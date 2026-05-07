import React, { useState } from "react";
import { Tag, Button, Loading } from "tdesign-react";
import {
  RefreshIcon,
  ShareIcon,
  ChevronRightIcon,
} from "tdesign-icons-react";
import type { MatchPlayer, ShareCard } from "../types";

interface MatchHubProps {
  strangers: MatchPlayer[];
  onViewDetail: (player: MatchPlayer) => void;
  onInviteFriend: () => void;
  onViewFriendResult: () => void;
  hasFriendResult: boolean;
}

function PlayerCard({
  player,
  onView,
}: {
  player: MatchPlayer;
  onView: () => void;
}) {
  const scoreColor =
    player.matchScore >= 90
      ? "#00a870"
      : player.matchScore >= 80
      ? "#0052d9"
      : "#ed7b2f";

  return (
    <div className="claw-match-player-card" onClick={onView}>
      {/* 匹配度环 */}
      <div className="claw-match-score-ring" style={{ borderColor: scoreColor }}>
        <span className="claw-match-score-ring-avatar">{player.avatar}</span>
        <div className="claw-match-score-badge" style={{ background: scoreColor }}>
          {player.matchScore}%
        </div>
      </div>

      <div className="claw-match-player-body">
        <div className="claw-match-player-name">
          {player.nickname}
          {player.online && <span className="claw-match-online" />}
        </div>
        <div className="claw-match-player-rank">{player.profile.rank}</div>
        <div className="claw-match-player-heroes">
          {player.profile.mainHeroes.join(" · ")}
        </div>
        <div className="claw-match-player-tags">
          {player.tags.map((t, i) => (
            <Tag key={i} size="small" variant="light" theme="primary">
              {t}
            </Tag>
          ))}
        </div>
        <div className="claw-match-player-reason">
          🦐 {player.matchReason}
        </div>
      </div>
    </div>
  );
}

export default function MatchHub({
  strangers,
  onViewDetail,
  onInviteFriend,
  onViewFriendResult,
  hasFriendResult,
}: MatchHubProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "friend">("discover");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="claw-match">
      {/* 头部 */}
      <div className="claw-match-header">
        <div className="claw-match-header-bg" />
        <div className="claw-match-header-content">
          <div className="claw-match-header-title">
            <span>🤝</span>
            <span>找搭子</span>
          </div>
          <div className="claw-match-header-subtitle">
            虾虾根据你的游戏数据，智能匹配最合拍的队友
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="claw-match-tabs">
        <button
          className={`claw-match-tab ${activeTab === "discover" ? "claw-match-tab--active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          <span>🔍</span>
          <span>发现搭子</span>
        </button>
        <button
          className={`claw-match-tab ${activeTab === "friend" ? "claw-match-tab--active" : ""}`}
          onClick={() => setActiveTab("friend")}
        >
          <span>💕</span>
          <span>好友匹配</span>
        </button>
      </div>

      {/* 内容区 */}
      <div className="claw-match-body">
        {activeTab === "discover" && (
          <>
            {/* 刷新提示 */}
            <div className="claw-match-refresh-bar">
              <span className="claw-match-refresh-text">
                虾虾为你找到 {strangers.length} 位高匹配度搭子
              </span>
              <button
                className="claw-match-refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loading size="small" />
                ) : (
                  <RefreshIcon size="16px" />
                )}
                <span>{refreshing ? "刷新中" : "换一批"}</span>
              </button>
            </div>

            {/* 搭子卡片列表 */}
            <div className="claw-match-list">
              {strangers.map((p) => (
                <PlayerCard key={p.id} player={p} onView={() => onViewDetail(p)} />
              ))}
            </div>
          </>
        )}

        {activeTab === "friend" && (
          <div className="claw-match-friend-section">
            {/* 邀请好友测试 */}
            <div className="claw-match-friend-invite">
              <div className="claw-match-friend-invite-icon">📨</div>
              <div className="claw-match-friend-invite-title">
                邀请好友测搭子匹配度
              </div>
              <div className="claw-match-friend-invite-desc">
                发送小程序卡片给好友，好友授权游戏数据后，虾虾自动帮你们分析匹配度
              </div>
              <Button
                theme="primary"
                icon={<ShareIcon />}
                onClick={onInviteFriend}
                block
                style={{ borderRadius: 12, marginTop: 16 }}
              >
                发送邀请卡片
              </Button>
            </div>

            {/* 微信小程序卡片预览 */}
            <div className="claw-match-miniapp-card">
              <div className="claw-match-miniapp-card-header">
                <span className="claw-match-miniapp-card-avatar">🦐</span>
                <span className="claw-match-miniapp-card-from">dorrawang</span>
              </div>
              <div className="claw-match-miniapp-card-body">
                <div className="claw-match-miniapp-card-title">
                  测测我们的游戏搭子匹配度
                </div>
                <div className="claw-match-miniapp-card-desc">
                  我的虾虾想帮我们看看游戏默契值有多高！
                </div>
              </div>
              <div className="claw-match-miniapp-card-footer">
                <span className="claw-match-miniapp-card-icon">🦐</span>
                <span>虾虾搭子测试</span>
              </div>
            </div>

            {/* 已有好友匹配结果 */}
            {hasFriendResult && (
              <div
                className="claw-match-friend-result-entry"
                onClick={onViewFriendResult}
              >
                <div className="claw-match-friend-result-entry-left">
                  <span className="claw-match-friend-result-avatar">👑</span>
                  <div>
                    <div className="claw-match-friend-result-name">
                      老王Next 的匹配结果
                    </div>
                    <div className="claw-match-friend-result-score">
                      匹配度 <strong>91%</strong>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon size="16px" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
