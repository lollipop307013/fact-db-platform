import type { ReviewItem, ReviewerStat, ReviewTask, ReviewObjectType, ReviewLogEntry } from "./review-types";
import { REVIEW_SOURCE_LABELS } from "./review-types";
import realReviewItems from "./review-real-20260715.json";

/** 可模拟切换的审核人员（rtx），用于演示多人协作审核 */
export const MOCK_OPERATORS = ["yzhinan", "zhang.san", "li.si", "wang.wu", "chen.liu"];

/**
 * 任务创建时分配的顺序号。该映射模拟服务端持久化序列：即使任务删除，已占用编号也不会分配给新任务。
 * 原始 taskId 仍仅作为内部批次关联键使用。
 */
export const REVIEW_TASK_SEQUENCE: Record<string, number> = {
  "IMPORT-20260715": 13,
  "IMPORT-ENTITY-20260715": 17,
  "DELETE-20260715": 14,
  "CONFLICT-20260715": 15,
  "DUP-20260715": 16,
};

const runtimeTaskSequences = new Map<string, number>();
const maxKnownTaskSequence = Math.max(...Object.values(REVIEW_TASK_SEQUENCE));

function getStableTaskSequence(taskId: string) {
  const knownSequence = REVIEW_TASK_SEQUENCE[taskId];
  if (knownSequence != null) return knownSequence;
  const existingSequence = runtimeTaskSequences.get(taskId);
  if (existingSequence != null) return existingSequence;
  const sequenceNo = maxKnownTaskSequence + runtimeTaskSequences.size + 1;
  runtimeTaskSequences.set(taskId, sequenceNo);
  return sequenceNo;
}

/** 审核条目 mock：覆盖各来源类型 + 新建/更新/删除 + 多待审版本 + 跨批次同步 */
/** 接入 20260715_待审核汇总.xlsx 的真实待审核数据（92 导入 / 3 删除 / 5 冲突） */
export const mockReviewItems: ReviewItem[] = [
  ...(realReviewItems as unknown as ReviewItem[]),
];

/** 审核操作日志 mock：记录每一次提交结论的人员与结果（用于"操作日志"查看入口） */
export const mockReviewLogs: ReviewLogEntry[] = [];

function getTaskTitle(taskId: string, source: ReviewItem["source"]) {
  if (taskId.startsWith("IMPORT")) return "批量导入审核";
  if (taskId.startsWith("CONFLICT")) return "导入冲突待确认";
  if (taskId.startsWith("DUP")) return "导入重复待确认";
  if (taskId.startsWith("DELETE")) return "删除审核";
  return `${REVIEW_SOURCE_LABELS[source]}审核任务`;
}

/**
 * 一批入库可能同时包含事实 / 实体 / 事件三类数据，导入类任务统一归并到同一批次，
 * 不按内容类型拆分。这里把 `IMPORT-ENTITY-*` 归一为 `IMPORT-*` 使其并入同一任务。
 */
function normalizeTaskGroupKey(taskId: string): string {
  return taskId.replace(/^IMPORT-ENTITY-/, "IMPORT-");
}

/** 把条目按 taskId 聚合成任务，并自动计算处理进度、内容类型和审核人分布。 */
export function buildReviewTasks(items: ReviewItem[], logs: ReviewLogEntry[] = []): ReviewTask[] {
  const map = new Map<string, ReviewItem[]>();
  for (const item of items) {
    const groupKey = normalizeTaskGroupKey(item.taskId);
    const group = map.get(groupKey) || [];
    group.push(item);
    map.set(groupKey, group);
  }

  const latestLogByItem = new Map<number, ReviewLogEntry>();
  logs.forEach((log) => {
    const previous = latestLogByItem.get(log.itemId);
    if (!previous || log.timestamp >= previous.timestamp) latestLogByItem.set(log.itemId, log);
  });

  // 按 factId 索引被最新通过的版本号，同 factId 的较旧未审核条目自动标记 superseded。
  const latestApprovalByFact = new Map<number, { taskId: string; itemId: number; updatedAt: string; operator?: string }>();
  items.forEach((item) => {
    if (item.factId == null || item.status !== "approved") return;
    const current = latestApprovalByFact.get(item.factId);
    if (!current || item.reviewedAt && item.reviewedAt > current.updatedAt) {
      latestApprovalByFact.set(item.factId, {
        taskId: item.taskId,
        itemId: item.id,
        updatedAt: item.reviewedAt || item.createdAt,
        operator: item.reviewedBy,
      });
    }
  });

  const tasks: ReviewTask[] = [];
  for (const [taskId, group] of map) {
    // 历史任务：同 factId 已在更新任务里通过审核时，将当前条目标记为 superseded。
    const enrichedGroup = group.map((item) => {
      if (item.status !== "pending" || item.factId == null) return item;
      const newer = latestApprovalByFact.get(item.factId);
      if (!newer || newer.taskId === item.taskId) return item;
      return { ...item, supersededBy: { ...newer, displayId: `#${getStableTaskSequence(newer.taskId)}` } };
    });
    const typeCounts: Record<ReviewObjectType, number> = { fact: 0, entity: 0, event: 0 };
    const typeProgress: Record<ReviewObjectType, { reviewed: number; total: number }> = {
      fact: { reviewed: 0, total: 0 },
      entity: { reviewed: 0, total: 0 },
      event: { reviewed: 0, total: 0 },
    };
    const reviewerStatsMap = new Map<string, ReviewerStat>();
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let createdAt = group[0].createdAt;

    group.forEach((item) => {
      typeCounts[item.objectType]++;
      typeProgress[item.objectType].total++;
      if (item.status === "pending") {
        pending++;
      } else if (item.status === "approved") {
        approved++;
        typeProgress[item.objectType].reviewed++;
      } else {
        rejected++;
        typeProgress[item.objectType].reviewed++;
      }
      if (item.createdAt > createdAt) createdAt = item.createdAt;

      const reviewer = item.reviewedBy || latestLogByItem.get(item.id)?.operator;
      if (item.status === "pending" || !reviewer) return;
      const stat = reviewerStatsMap.get(reviewer) || {
        reviewer,
        reviewed: 0,
        typeCounts: { fact: 0, entity: 0, event: 0 },
      };
      stat.reviewed++;
      stat.typeCounts[item.objectType]++;
      reviewerStatsMap.set(reviewer, stat);
    });

    const reviewerStats = Array.from(reviewerStatsMap.values())
      .sort((a, b) => b.reviewed - a.reviewed || a.reviewer.localeCompare(b.reviewer));

    const sequenceNo = getStableTaskSequence(taskId);
    tasks.push({
      id: taskId,
      sequenceNo,
      displayId: `#${sequenceNo}`,
      title: getTaskTitle(taskId, group[0].source),
      source: group[0].source,
      sourceLabel: REVIEW_SOURCE_LABELS[group[0].source],
      createdAt,
      items: enrichedGroup,
      total: enrichedGroup.length,
      pending,
      approved,
      rejected,
      typeCounts,
      typeProgress,
      operators: reviewerStats.map((stat) => stat.reviewer),
      reviewerStats,
      progress: pending > 0 ? "pending" : "done",
      applicationStatus: pending === 0 ? "done" : "reviewing",
    });
  }

  return tasks.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
}
