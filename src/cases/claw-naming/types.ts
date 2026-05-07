/** 虾的技能类型 */
export interface ClawSkill {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
}

/** 任务状态 */
export type TaskStatus = "进行中" | "已完成" | "待领取";

/** 任务类型 */
export type TaskType = "资讯查询" | "数据分析" | "攻略探索" | "日常巡逻" | "情报收集";

/** 任务项 */
export interface ClawTask {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  summary: string;
  completedAt?: string;
  createdAt: string;
  hasReport: boolean;
}

/** 数据亮点项 */
export interface StatHighlight {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "flat";
}

/** 引用来源 */
export interface SourceRef {
  title: string;
  origin: string;
  url?: string;
}

/** 富文本段落块 */
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "highlight"; text: string }
  | { type: "list"; items: string[] }
  | { type: "divider" };

/** 任务报告 */
export interface TaskReport {
  taskId: string;
  title: string;
  type: TaskType;
  clawMood: "开心" | "认真" | "兴奋" | "困惑";
  clawComment: string;
  summary: string;
  stats: StatHighlight[];
  content: ContentBlock[];
  sources: SourceRef[];
  relatedTasks: { id: string; title: string; type: TaskType }[];
  createdAt: string;
}

/* ========================================
   对话系统
   ======================================== */

/** 对话消息角色 */
export type ChatRole = "user" | "claw" | "system";

/** 快捷回复（skill入口） */
export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  description: string;
}

/** 对话消息 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
  /** 消息中嵌入的快捷操作 */
  actions?: QuickAction[];
  /** 嵌入的搭子推荐卡片 */
  matchCard?: MatchPlayer;
  /** 嵌入的分享邀请卡片 */
  shareCard?: ShareCard;
  /** 消息是否正在输入中 */
  typing?: boolean;
}

/* ========================================
   搭子匹配系统
   ======================================== */

/** 游戏数据摘要 */
export interface GameProfile {
  rank: string;
  mainHeroes: string[];
  playStyle: string;
  winRate: number;
  avgKDA: number;
  playTime: string;
  preferMap: string;
}

/** 匹配搭子 */
export interface MatchPlayer {
  id: string;
  nickname: string;
  avatar: string;
  matchScore: number;
  tags: string[];
  profile: GameProfile;
  /** 是否来自好友邀请 */
  isFriend?: boolean;
  /** 匹配理由 */
  matchReason: string;
  /** 在线状态 */
  online: boolean;
}

/** 匹配维度 */
export interface MatchDimension {
  label: string;
  icon: string;
  score: number;
  description: string;
}

/** 好友匹配详情 */
export interface FriendMatchResult {
  player: MatchPlayer;
  overallScore: number;
  dimensions: MatchDimension[];
  summary: string;
  clawComment: string;
}

/** 分享卡片（小程序卡片） */
export interface ShareCard {
  id: string;
  type: "invite-match" | "match-result";
  title: string;
  description: string;
  fromUser: string;
  fromAvatar: string;
  /** 匹配结果分享时展示分数 */
  score?: number;
}

/* ========================================
   页面路由
   ======================================== */

/** 底部Tab */
export type BottomTab = "chat" | "tasks" | "match";

/** 页面视图 */
export type PageView =
  | "task-center"
  | "report-detail"
  | "chat"
  | "match-hub"
  | "match-detail"
  | "friend-match-result";
