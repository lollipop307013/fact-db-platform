import type {
  ClawTask,
  TaskReport,
  ContentBlock,
  StatHighlight,
  SourceRef,
  ChatMessage,
  MatchPlayer,
  FriendMatchResult,
  MatchDimension,
  QuickAction,
} from "./types";

/* ========================================
   任务数据（保留原有）
   ======================================== */

export const mockTasks: ClawTask[] = [
  {
    id: "t1",
    title: "查询本周赛事资讯",
    type: "资讯查询",
    status: "已完成",
    summary: "已为你整理本周3场重要赛事信息，包括冠军联赛半决赛、新地图上线和限时活动。",
    completedAt: "2分钟前",
    createdAt: "5分钟前",
    hasReport: true,
  },
  {
    id: "t2",
    title: "分析我的近期对局数据",
    type: "数据分析",
    status: "已完成",
    summary: "近7天共32场对局，胜率89%，最常用英雄：不死鸟。KDA稳步上升中！",
    completedAt: "10分钟前",
    createdAt: "12分钟前",
    hasReport: true,
  },
  {
    id: "t3",
    title: "探索隐士修所A点进攻攻略",
    type: "攻略探索",
    status: "已完成",
    summary: "找到3套A点进攻战术配合，适合不同段位使用。",
    completedAt: "30分钟前",
    createdAt: "35分钟前",
    hasReport: true,
  },
  {
    id: "t4",
    title: "巡逻商城限时折扣",
    type: "日常巡逻",
    status: "进行中",
    summary: "正在扫描商城最新皮肤和折扣信息...",
    createdAt: "1分钟前",
    hasReport: false,
  },
  {
    id: "t5",
    title: "收集对手情报",
    type: "情报收集",
    status: "待领取",
    summary: "已收集到目标选手最近10场对局的英雄池和习惯打法。",
    createdAt: "1小时前",
    hasReport: true,
  },
];

// ---- 报告内容（省略重复，保持不变） ----
const newsContent: ContentBlock[] = [
  { type: "heading", text: "🏆 冠军联赛半决赛即将开打" },
  { type: "paragraph", text: "本周六晚8点，冠军联赛半决赛将在线上同步直播。四支战队将争夺决赛席位。赛制采用BO5淘汰制，其中胜者组战队享有一局地图ban优势。" },
  { type: "quote", text: "「本次半决赛的对阵组合是近三年来最强的一次，每一场都有可能成为经典战役。」", source: "赛事官方评论" },
  { type: "paragraph", text: "解说阵容方面，官方邀请了前职业选手老K和知名解说米粒组成黄金搭档。建议提前设置观赛提醒，虾虾也会在直播时为你实时播报关键战况！" },
  { type: "divider" },
  { type: "heading", text: "🗺️ 新地图「雾隐峡谷」正式上线" },
  { type: "paragraph", text: "全新对战地图「雾隐峡谷」已于今日凌晨更新上线。地图风格偏日式庭院，包含大量垂直结构和单向通道，对控场型英雄非常友好。" },
  { type: "list", items: ["A点：高台+双通道结构，适合哨位英雄架点", "B点：狭窄回廊+烟雾格挡区，决斗英雄的天堂", "中路：开阔连接区，视野争夺是关键"] },
  { type: "highlight", text: "虾虾建议：这张地图首选不死鸟或蟾蜍，控场能力强且能有效切割视野。" },
  { type: "divider" },
  { type: "heading", text: "🎉 限时活动「星光捕手」开启" },
  { type: "paragraph", text: "活动期间完成指定任务可以获得星光碎片，集齐可兑换限定枪械皮肤「星河流光」。活动持续两周，每日任务在凌晨4点刷新。" },
  { type: "paragraph", text: "其中高难度挑战「连续5局MVP」奖励双倍碎片。根据你的历史数据来看，达成率约72%——虾虾觉得你完全可以冲一冲！" },
];
const newsStats: StatHighlight[] = [
  { label: "赛事", value: "3", unit: "场" },
  { label: "新地图", value: "1", unit: "张" },
  { label: "活动", value: "2", unit: "个", trend: "up" },
  { label: "限时奖励", value: "14", unit: "天" },
];
const newsSources: SourceRef[] = [
  { title: "官方赛事公告", origin: "赛事中心" },
  { title: "v3.2版本更新日志", origin: "官方公告" },
  { title: "星光捕手活动规则", origin: "游戏内活动页" },
];
const dataContent: ContentBlock[] = [
  { type: "heading", text: "📊 近7天对局总览" },
  { type: "paragraph", text: "过去7天你一共进行了32场竞技对局。整体表现稳中有升，尤其是在使用不死鸟时的胜率达到了惊人的93%，远超平均水平。" },
  { type: "highlight", text: "你的爆头率从上周的28%提升到了34%——进步非常明显！虾虾帮你鼓掌👏" },
  { type: "divider" },
  { type: "heading", text: "🦸 英雄使用分布" },
  { type: "list", items: ["不死鸟：15场 (胜率93%，KDA 1.8)", "蟾蜍：8场 (胜率75%，KDA 1.5)", "钛鼠：5场 (胜率80%，KDA 2.1)", "暮褐：4场 (胜率50%，KDA 1.2)"] },
  { type: "paragraph", text: "从数据来看，你的英雄池较为集中。建议可以多练习2-3个不同定位的英雄，这样在排位中更容易适应队伍需求。" },
  { type: "divider" },
  { type: "heading", text: "📈 段位趋势" },
  { type: "paragraph", text: "当前段位：铂金2。本周净胜场+8，距离钻石1还差约120分。按照目前的胜率趋势，预计3-4天可以晋级——虾虾在终点等你！" },
  { type: "quote", text: "「保持当前节奏，注意高段位对手的战术调整，你离钻石只差临门一脚。」", source: "虾虾分析建议" },
];
const dataStats: StatHighlight[] = [
  { label: "总对局", value: "32", unit: "场" },
  { label: "胜率", value: "89", unit: "%", trend: "up" },
  { label: "KDA", value: "1.7", trend: "up" },
  { label: "爆头率", value: "34", unit: "%", trend: "up" },
];
const dataSources: SourceRef[] = [
  { title: "对局历史记录", origin: "游戏数据中心" },
  { title: "排位积分变动", origin: "竞技排行榜" },
];
const guideContent: ContentBlock[] = [
  { type: "heading", text: "⚔️ 隐士修所 A点 进攻体系" },
  { type: "paragraph", text: "隐士修所的A点是整张地图中最具战术深度的区域之一。进攻方需要同时控制A大道和A短通道才能形成有效包夹。以下是三套不同段位适用的战术配合。" },
  { type: "divider" },
  { type: "heading", text: "🥉 入门级：烟雾推进流" },
  { type: "paragraph", text: "适合白银至黄金段位。核心思路是用大量烟雾覆盖关键视角点，配合闪光直接莽入。不需要太多配合，胜在简单直接。" },
  { type: "list", items: ["暮褐A大道放烟覆盖天台视角", "蟾蜍停云封住拐角", "不死鸟闪光开路，决斗位先行", "其余队员跟进补枪"] },
  { type: "divider" },
  { type: "heading", text: "🥈 进阶级：双线佯攻" },
  { type: "paragraph", text: "适合铂金至钻石段位。前期在B点制造进攻假象，消耗对方转点资源后快速转A。需要较好的团队沟通。" },
  { type: "highlight", text: "关键点：B点佯攻只需2人，必须在15秒内完成声东击西并转点，否则会被对方识破。" },
  { type: "divider" },
  { type: "heading", text: "🥇 高阶级：控场窒息流" },
  { type: "paragraph", text: "适合钻石及以上段位。通过精确的技能时序覆盖所有防守位，让对手完全无法架点。需要五人极高的默契度。" },
  { type: "quote", text: "「这套战术在职业赛场上使用率极高，但执行难度也是最大的。建议先在自定义中反复练习技能释放时间。」", source: "虾虾战术分析" },
];
const guideStats: StatHighlight[] = [
  { label: "战术数", value: "3", unit: "套" },
  { label: "推荐段位", value: "全", unit: "段位" },
  { label: "实测胜率", value: "76", unit: "%", trend: "up" },
];
const guideSources: SourceRef[] = [
  { title: "隐士修所地图详解", origin: "攻略中心" },
  { title: "职业赛事战术复盘", origin: "赛事数据库" },
];

export const mockReports: Record<string, TaskReport> = {
  t1: {
    taskId: "t1", title: "本周赛事与活动资讯汇总", type: "资讯查询",
    clawMood: "兴奋", clawComment: "好多好玩的活动！虾虾已经帮你全部标记好了～",
    summary: "本周有3场重要赛事、1张新地图上线和2个限时活动。冠军联赛半决赛本周六开打，新地图「雾隐峡谷」已上线，限时活动「星光捕手」可以兑换限定皮肤。",
    stats: newsStats, content: newsContent, sources: newsSources,
    relatedTasks: [{ id: "t4", title: "巡逻商城限时折扣", type: "日常巡逻" }, { id: "t5", title: "收集对手情报", type: "情报收集" }],
    createdAt: "5分钟前",
  },
  t2: {
    taskId: "t2", title: "近7天对局数据深度分析", type: "数据分析",
    clawMood: "开心", clawComment: "数据在涨！虾虾替你骄傲～继续保持这个势头！",
    summary: "近7天32场对局，整体胜率89%，KDA 1.7。不死鸟胜率93%为最佳英雄。爆头率从28%提升至34%，段位距钻石1还差约120分。",
    stats: dataStats, content: dataContent, sources: dataSources,
    relatedTasks: [{ id: "t5", title: "收集对手情报", type: "情报收集" }],
    createdAt: "12分钟前",
  },
  t3: {
    taskId: "t3", title: "隐士修所 A点 进攻攻略全解", type: "攻略探索",
    clawMood: "认真", clawComment: "虾虾已经把三套战术整理好了，从入门到高阶都有覆盖！",
    summary: "整理了3套隐士修所A点进攻战术：烟雾推进流(入门)、双线佯攻(进阶)、控场窒息流(高阶)。实测平均胜率76%。",
    stats: guideStats, content: guideContent, sources: guideSources,
    relatedTasks: [{ id: "t2", title: "分析我的近期对局数据", type: "数据分析" }],
    createdAt: "35分钟前",
  },
};

/* ========================================
   对话系统 Mock
   ======================================== */

export const quickActions: QuickAction[] = [
  { id: "s1", icon: "📰", label: "查资讯", description: "帮你搜最新游戏资讯" },
  { id: "s2", icon: "📊", label: "看数据", description: "分析你的对局数据" },
  { id: "s3", icon: "⚔️", label: "找攻略", description: "搜索地图/英雄攻略" },
  { id: "s4", icon: "🤝", label: "找搭子", description: "匹配高契合游戏搭子" },
  { id: "s5", icon: "🕵️", label: "查情报", description: "侦查对手信息" },
  { id: "s6", icon: "🎮", label: "测匹配", description: "测和好友的搭子匹配度" },
];

export const mockStrangerMatch: MatchPlayer = {
  id: "m1",
  nickname: "暗夜猎手",
  avatar: "🎯",
  matchScore: 94,
  tags: ["铂金", "决斗位", "凌晨党", "话多"],
  profile: {
    rank: "铂金3",
    mainHeroes: ["不死鸟", "钛鼠", "蟾蜍"],
    playStyle: "激进型",
    winRate: 85,
    avgKDA: 1.9,
    playTime: "22:00-02:00",
    preferMap: "隐士修所",
  },
  isFriend: false,
  matchReason: "英雄池互补、段位接近、在线时段高度重合，打法风格配合度极高",
  online: true,
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: "c0",
    role: "system",
    text: "欢迎回来！虾虾今天也元气满满～",
    time: "14:30",
  },
  {
    id: "c1",
    role: "claw",
    text: "嘿！好久不见～虾虾今天给你准备了几个好玩的能力，想试试哪个？",
    time: "14:30",
    actions: quickActions.slice(0, 4),
  },
  {
    id: "c2",
    role: "user",
    text: "帮我找个搭子吧，最近排位老是遇到不配合的队友",
    time: "14:31",
  },
  {
    id: "c3",
    role: "claw",
    text: "虾虾马上帮你找！根据你的游戏数据——铂金2、主玩不死鸟、喜欢隐士修所——我来匹配最合拍的搭子 🔍",
    time: "14:31",
  },
  {
    id: "c4",
    role: "claw",
    text: "找到一位超高匹配度的搭子！匹配度 94%，和你英雄池互补、段位接近、还是同一个时间段在线的～看看？",
    time: "14:32",
    matchCard: mockStrangerMatch,
  },
  {
    id: "c5",
    role: "user",
    text: "不错，还想测测和我好友的搭子匹配度",
    time: "14:33",
  },
  {
    id: "c6",
    role: "claw",
    text: "好呀！发个邀请卡片给好友，让ta也授权游戏数据，虾虾就能帮你们测匹配度了～点下面的分享按钮就行！",
    time: "14:33",
    shareCard: {
      id: "share1",
      type: "invite-match",
      title: "测测我们的游戏搭子匹配度",
      description: "我的虾虾想帮我们看看游戏默契值有多高！点击授权游戏数据即可测试～",
      fromUser: "dorrawang",
      fromAvatar: "🦐",
    },
  },
];

/* ========================================
   搭子匹配 Mock
   ======================================== */

export const mockStrangerMatches: MatchPlayer[] = [
  {
    id: "m1", nickname: "暗夜猎手", avatar: "🎯", matchScore: 94,
    tags: ["铂金3", "决斗位", "凌晨党", "话多"],
    profile: { rank: "铂金3", mainHeroes: ["不死鸟", "钛鼠", "蟾蜍"], playStyle: "激进型", winRate: 85, avgKDA: 1.9, playTime: "22:00-02:00", preferMap: "隐士修所" },
    isFriend: false, matchReason: "英雄池互补、段位接近、在线时段高度重合", online: true,
  },
  {
    id: "m2", nickname: "静水深流", avatar: "🛡️", matchScore: 87,
    tags: ["铂金1", "哨位", "周末党", "稳健"],
    profile: { rank: "铂金1", mainHeroes: ["暮褐", "钛狐"], playStyle: "防守型", winRate: 78, avgKDA: 1.5, playTime: "20:00-23:00", preferMap: "日落之城" },
    isFriend: false, matchReason: "防守位刚好补你队伍短板，风格互补", online: true,
  },
  {
    id: "m3", nickname: "闪电突袭", avatar: "⚡", matchScore: 82,
    tags: ["黄金4", "先锋", "日常在线", "沉默型"],
    profile: { rank: "黄金4", mainHeroes: ["蟾蜍", "不死鸟"], playStyle: "均衡型", winRate: 72, avgKDA: 1.6, playTime: "18:00-24:00", preferMap: "雾隐峡谷" },
    isFriend: false, matchReason: "先锋位空缺正好填补，在线时间覆盖面广", online: false,
  },
  {
    id: "m4", nickname: "彩虹战术家", avatar: "🌈", matchScore: 79,
    tags: ["钻石1", "控场", "周末党", "指挥型"],
    profile: { rank: "钻石1", mainHeroes: ["暮褐", "蟾蜍", "钛狐"], playStyle: "战术型", winRate: 81, avgKDA: 1.4, playTime: "21:00-01:00", preferMap: "隐士修所" },
    isFriend: false, matchReason: "段位略高但控场位稀缺，可以带飞你", online: true,
  },
];

export const mockFriendMatchResult: FriendMatchResult = {
  player: {
    id: "f1", nickname: "老王Next", avatar: "👑", matchScore: 91,
    tags: ["铂金2", "决斗位", "老搭档"],
    profile: { rank: "铂金2", mainHeroes: ["钛鼠", "不死鸟"], playStyle: "激进型", winRate: 82, avgKDA: 2.0, playTime: "21:00-01:00", preferMap: "隐士修所" },
    isFriend: true, matchReason: "经常一起排位，默契度极高", online: true,
  },
  overallScore: 91,
  dimensions: [
    { label: "段位匹配", icon: "🏆", score: 95, description: "段位几乎相同，排位不会出现段位差限制" },
    { label: "英雄互补", icon: "🦸", score: 88, description: "你们的英雄池有一定重叠，但主玩位置能互补" },
    { label: "时间契合", icon: "⏰", score: 92, description: "在线时间高度重合，约客可能性极高" },
    { label: "打法配合", icon: "⚔️", score: 85, description: "都偏激进型，进攻时火力凶猛但要注意防守" },
    { label: "沟通风格", icon: "💬", score: 96, description: "老搭档了，沟通完全没有障碍" },
  ],
  summary: "你和老王Next的搭子匹配度高达91%！你们在段位、在线时间和沟通方面都极为契合。唯一需要注意的是双人都偏激进打法，建议再搭配一个稳健型队友。",
  clawComment: "虾虾认证：你们是天生的游戏搭档！🎮🔥",
};
