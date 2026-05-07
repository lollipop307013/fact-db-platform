import React, { useState } from "react";
import { Button, Tag, Loading } from "tdesign-react";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ThumbUpIcon,
  StarIcon,
  RefreshIcon,
  LinkIcon,
} from "tdesign-icons-react";
import type { TaskReport, ContentBlock } from "../types";

interface ReportDetailProps {
  report: TaskReport;
  onBack: () => void;
}

const moodEmoji: Record<string, string> = {
  开心: "😄",
  认真: "🧐",
  兴奋: "🤩",
  困惑: "🤔",
};

const typeColor: Record<string, string> = {
  资讯查询: "primary",
  数据分析: "success",
  攻略探索: "warning",
  日常巡逻: "default",
  情报收集: "danger",
};

function ContentRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <h3 className="claw-article-heading">{block.text}</h3>;
    case "paragraph":
      return <p className="claw-article-paragraph">{block.text}</p>;
    case "quote":
      return (
        <blockquote className="claw-article-quote">
          <div className="claw-article-quote-text">{block.text}</div>
          {block.source && (
            <div className="claw-article-quote-source">— {block.source}</div>
          )}
        </blockquote>
      );
    case "highlight":
      return (
        <div className="claw-article-highlight">
          <span className="claw-article-highlight-icon">💡</span>
          <span>{block.text}</span>
        </div>
      );
    case "list":
      return (
        <ul className="claw-article-list">
          {block.items.map((item, i) => (
            <li key={i} className="claw-article-list-item">
              {item}
            </li>
          ))}
        </ul>
      );
    case "divider":
      return <div className="claw-article-divider" />;
    default:
      return null;
  }
}

export default function ReportDetail({ report, onBack }: ReportDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);

  const summaryLines = report.summary;
  const needsExpand = summaryLines.length > 80;

  return (
    <div className="claw-report">
      {/* 顶部导航 */}
      <div className="claw-report-navbar">
        <button className="claw-report-back" onClick={onBack}>
          <ChevronLeftIcon />
        </button>
        <div className="claw-report-navbar-title">虾虾播报</div>
        <div className="claw-report-navbar-right" />
      </div>

      {/* 可滚动主体 */}
      <div className="claw-report-body">
        {/* 虾状态气泡 */}
        <div className="claw-shrimp-bubble">
          <div className="claw-shrimp-avatar">
            <span className="claw-shrimp-emoji">🦐</span>
          </div>
          <div className="claw-shrimp-bubble-content">
            <div className="claw-shrimp-bubble-meta">
              <Tag
                theme={typeColor[report.type] as any}
                variant="light"
                size="small"
              >
                {report.type}
              </Tag>
              <span className="claw-shrimp-time">{report.createdAt}</span>
            </div>
            <div className="claw-shrimp-bubble-text">
              {moodEmoji[report.clawMood]} {report.clawComment}
            </div>
          </div>
        </div>

        {/* 报告标题卡片 */}
        <div className="claw-report-card">
          <div className="claw-report-card-title">{report.title}</div>
          <div
            className={`claw-report-summary ${
              !expanded && needsExpand ? "claw-report-summary--collapsed" : ""
            }`}
          >
            {summaryLines}
          </div>
          {needsExpand && (
            <button
              className="claw-report-expand-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "收起" : "展开全文"}
              {expanded ? (
                <ChevronUpIcon size="14px" />
              ) : (
                <ChevronDownIcon size="14px" />
              )}
            </button>
          )}
        </div>

        {/* 数据亮点 */}
        {report.stats.length > 0 && (
          <div className="claw-report-card">
            <div className="claw-report-card-section-title">📊 数据亮点</div>
            <div className="claw-stats-grid">
              {report.stats.map((stat, i) => (
                <div key={i} className="claw-stat-item">
                  <div className="claw-stat-value">
                    {stat.value}
                    {stat.unit && (
                      <span className="claw-stat-unit">{stat.unit}</span>
                    )}
                    {stat.trend === "up" && (
                      <span className="claw-stat-trend claw-stat-trend--up">
                        ↑
                      </span>
                    )}
                    {stat.trend === "down" && (
                      <span className="claw-stat-trend claw-stat-trend--down">
                        ↓
                      </span>
                    )}
                  </div>
                  <div className="claw-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 正文内容区 */}
        <div className="claw-report-card">
          <div className="claw-report-card-section-title">📝 详细内容</div>
          <article className="claw-article">
            {report.content.map((block, i) => (
              <ContentRenderer key={i} block={block} />
            ))}
          </article>
        </div>

        {/* 引用来源 */}
        {report.sources.length > 0 && (
          <div className="claw-report-card">
            <div className="claw-report-card-section-title">📎 信息来源</div>
            <div className="claw-sources">
              {report.sources.map((src, i) => (
                <div key={i} className="claw-source-item">
                  <LinkIcon size="14px" />
                  <div className="claw-source-info">
                    <div className="claw-source-title">{src.title}</div>
                    <div className="claw-source-origin">{src.origin}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 相关推荐 */}
        {report.relatedTasks.length > 0 && (
          <div className="claw-report-card">
            <div className="claw-report-card-section-title">🔗 相关任务</div>
            <div className="claw-related-scroll">
              {report.relatedTasks.map((task) => (
                <div key={task.id} className="claw-related-card">
                  <Tag
                    theme={typeColor[task.type] as any}
                    variant="light"
                    size="small"
                  >
                    {task.type}
                  </Tag>
                  <div className="claw-related-card-title">{task.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部留白 */}
        <div style={{ height: 80 }} />
      </div>

      {/* 底部操作栏 */}
      <div className="claw-report-footer">
        <Button
          variant="text"
          icon={<ThumbUpIcon />}
          className={liked ? "claw-footer-btn--active" : ""}
          onClick={() => setLiked(!liked)}
        >
          {liked ? "已点赞" : "有用"}
        </Button>
        <Button
          variant="text"
          icon={<StarIcon />}
          className={starred ? "claw-footer-btn--active" : ""}
          onClick={() => setStarred(!starred)}
        >
          {starred ? "已收藏" : "收藏"}
        </Button>
        <Button variant="text" icon={<RefreshIcon />}>
          再查一次
        </Button>
      </div>
    </div>
  );
}
