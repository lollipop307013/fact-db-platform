import React, { useState } from "react";
import { Tag, Button } from "tdesign-react";
import {
  ChevronLeftIcon,
  ShareIcon,
} from "tdesign-icons-react";
import type { FriendMatchResult } from "../types";

interface FriendMatchDetailProps {
  result: FriendMatchResult;
  onBack: () => void;
  onShare: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#00a870" : score >= 80 ? "#0052d9" : "#ed7b2f";

  return (
    <div className="claw-fmd-ring-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="8" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="claw-fmd-ring-value">
        <span className="claw-fmd-ring-num">{score}</span>
        <span className="claw-fmd-ring-pct">%</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, icon, score, description }: {
  label: string; icon: string; score: number; description: string;
}) {
  const color = score >= 90 ? "#00a870" : score >= 80 ? "#0052d9" : "#ed7b2f";
  return (
    <div className="claw-fmd-dim">
      <div className="claw-fmd-dim-header">
        <span className="claw-fmd-dim-icon">{icon}</span>
        <span className="claw-fmd-dim-label">{label}</span>
        <span className="claw-fmd-dim-score" style={{ color }}>{score}%</span>
      </div>
      <div className="claw-fmd-dim-bar-bg">
        <div
          className="claw-fmd-dim-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <div className="claw-fmd-dim-desc">{description}</div>
    </div>
  );
}

export default function FriendMatchDetail({ result, onBack, onShare }: FriendMatchDetailProps) {
  return (
    <div className="claw-fmd">
      {/* 导航栏 */}
      <div className="claw-report-navbar">
        <button className="claw-report-back" onClick={onBack}>
          <ChevronLeftIcon />
        </button>
        <div className="claw-report-navbar-title">搭子匹配报告</div>
        <div className="claw-report-navbar-right" />
      </div>

      <div className="claw-fmd-body">
        {/* 头部展示区 */}
        <div className="claw-fmd-hero">
          <div className="claw-fmd-hero-bg" />
          <div className="claw-fmd-hero-content">
            {/* 双人头像 */}
            <div className="claw-fmd-avatars">
              <div className="claw-fmd-avatar claw-fmd-avatar--me">😎</div>
              <div className="claw-fmd-vs">VS</div>
              <div className="claw-fmd-avatar claw-fmd-avatar--friend">
                {result.player.avatar}
              </div>
            </div>
            <div className="claw-fmd-names">
              <span>我</span>
              <span>{result.player.nickname}</span>
            </div>
            {/* 总分环 */}
            <ScoreRing score={result.overallScore} />
            <div className="claw-fmd-verdict">搭子匹配度</div>
          </div>
        </div>

        {/* 虾虾评语 */}
        <div className="claw-report-card">
          <div className="claw-fmd-claw-comment">
            <span className="claw-fmd-claw-avatar">🦐</span>
            <div className="claw-fmd-claw-text">{result.clawComment}</div>
          </div>
        </div>

        {/* 维度分析 */}
        <div className="claw-report-card">
          <div className="claw-report-card-section-title">📊 详细分析</div>
          <div className="claw-fmd-dims">
            {result.dimensions.map((d, i) => (
              <DimensionBar key={i} {...d} />
            ))}
          </div>
        </div>

        {/* 综合总结 */}
        <div className="claw-report-card">
          <div className="claw-report-card-section-title">📝 综合评价</div>
          <div className="claw-fmd-summary">{result.summary}</div>
        </div>

        {/* 分享按钮 */}
        <div className="claw-fmd-share-section">
          <Button
            theme="primary"
            icon={<ShareIcon />}
            block
            style={{ borderRadius: 12, height: 44 }}
            onClick={onShare}
          >
            分享匹配结果给好友
          </Button>
          <div className="claw-fmd-share-hint">
            好友将收到一张小程序卡片，展示你们的匹配度
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
