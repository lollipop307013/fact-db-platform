export interface Entity {
  id: number;
  title: string;
  tag: string;
  status: "待审核" | "已审核";
  source: string;
  description: string;
  alias?: string;
  logs?: OperationLog[];
}

export interface GameEvent {
  id: number;
  name: string;
  description: string;
  eventType: string;
  status: "已审核" | "待审核";
  startTime: string;
  endTime: string;
  source: string;
  remark: string;
  alias?: string;
  logs?: OperationLog[];
}

/** 事实来源环境 */
export type FactEnv = "test" | "prod";

export interface Fact {
  id: number;
  title: string;
  content: string;
  status: FactStatus;
  keywords: string;
  category: string;
  env?: FactEnv;
  sourceType?: string;
  source?: string;
  sourceUrl?: string;
  sourceContent?: string;
  startTime?: string;
  endTime?: string;
  timeDesc?: string;
  relatedEvents?: string;
  conflict?: string;
  duplicate?: string;
  /** upload_status：后端自动维护的同步状态（pending/need_update/done/failed） */
  uploadStatus?: UploadStatus;
  /** 兼容旧 demo 字段：向量同步状态（success/failed/pending） */
  syncStatus?: SyncStatus;
  /** 同步失败时的错误信息（用于运维排查） */
  syncError?: string;
  /** 最近一次同步时间 */
  syncAt?: string;
  logs?: OperationLog[];
}

/** upload_status：后端自动维护的同步状态 */
export type UploadStatus = "pending" | "need_update" | "done" | "failed";

/** 兼容旧 demo 字段：success 占绝大多数（保存即同步），failed 用于暴露需要关注的异常 */
export type SyncStatus = "success" | "failed" | "pending";

/** 抽取缓冲池条目：提取后先进缓冲池，审核通过才入库 */
export interface ExtractBufferItem {
  bufferId: string;         // 缓冲池唯一ID
  extractedAt: string;      // 提取时间
  content: string;          // 事实内容
  title: string;
  category: string;
  entities: string[];
  newEntities: string[];
  events: string[];
  newEvents: string[];
  startTime: string;
  endTime: string;
  timeDesc: string;
  conflict: {
    detected: boolean;
    reason: string;
    factId: string;
    factContent: string;
  } | null;
  bufferStatus: "待审核" | "已审核" | "已拒绝"; // 缓冲池内的审核状态
}

/** 单条操作日志 */
export interface OperationLog {
  id: number;
  operator: string;
  time: string;
  action: "创建-手动" | "创建-导入" | "编辑" | "状态变更" | "回退" | "同步" | "删除";
  detail: string;
}

/**
 * 事实状态流转规则：
 *   新建/导入 → 待审核（唯一入口，不可从其他状态转回）
 *   待审核 → 已审核（审核通过）
 *   待审核 → 已拒绝（审核拒绝，终态）
 *   已审核 → 已上线（发布）
 *   已上线 → 已下线（下线）
 *   已下线 → 已上线（重新上线）
 *   测试→正式同步：系统行为，直接置为已上线，记录 action=同步
 */
export type FactStatus = "待审核" | "已审核" | "已上线" | "已下线";

/** 每种状态允许流转到的下一步（空数组=终态） */
export const STATUS_TRANSITIONS: Record<FactStatus, FactStatus[]> = {
  "待审核": ["已审核"],
  "已审核": ["已上线"],
  "已上线": ["已下线"],
  "已下线": ["已上线"],
};

export interface CategoryNode {
  name: string;
  count: number;
  children?: CategoryNode[];
  expanded?: boolean;
}

export type TabId = "entity" | "event" | "fact" | "extract" | "qa" | "error-detect";
