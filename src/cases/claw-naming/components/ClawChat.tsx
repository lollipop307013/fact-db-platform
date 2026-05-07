import React, { useState, useRef, useEffect } from "react";
import { Tag, Loading } from "tdesign-react";
import {
  SendIcon,
  ChevronRightIcon,
} from "tdesign-icons-react";
import type { ChatMessage, MatchPlayer, ShareCard, QuickAction } from "../types";

interface ClawChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUseSkill: (skillId: string) => void;
  onViewMatch: (player: MatchPlayer) => void;
  onShare: (card: ShareCard) => void;
}

function MatchCardEmbed({
  player,
  onView,
}: {
  player: MatchPlayer;
  onView: () => void;
}) {
  return (
    <div className="claw-chat-match-card" onClick={onView}>
      <div className="claw-chat-match-card-header">
        <div className="claw-chat-match-avatar">{player.avatar}</div>
        <div className="claw-chat-match-info">
          <div className="claw-chat-match-name">
            {player.nickname}
            {player.online && <span className="claw-chat-online-dot" />}
          </div>
          <div className="claw-chat-match-tags">
            {player.tags.slice(0, 3).map((t, i) => (
              <Tag key={i} size="small" variant="light" theme="primary">
                {t}
              </Tag>
            ))}
          </div>
        </div>
        <div className="claw-chat-match-score">
          <span className="claw-chat-match-score-num">{player.matchScore}</span>
          <span className="claw-chat-match-score-label">匹配度</span>
        </div>
      </div>
      <div className="claw-chat-match-reason">{player.matchReason}</div>
      <div className="claw-chat-match-action">
        <span>查看详情</span>
        <ChevronRightIcon size="14px" />
      </div>
    </div>
  );
}

function ShareCardEmbed({
  card,
  onShare,
}: {
  card: ShareCard;
  onShare: () => void;
}) {
  return (
    <div className="claw-chat-share-card">
      <div className="claw-chat-share-card-icon">📨</div>
      <div className="claw-chat-share-card-body">
        <div className="claw-chat-share-card-title">{card.title}</div>
        <div className="claw-chat-share-card-desc">{card.description}</div>
      </div>
      <button className="claw-chat-share-btn" onClick={onShare}>
        分享给好友
      </button>
    </div>
  );
}

function SkillGrid({
  actions,
  onUse,
}: {
  actions: QuickAction[];
  onUse: (id: string) => void;
}) {
  return (
    <div className="claw-chat-skill-grid">
      {actions.map((a) => (
        <button key={a.id} className="claw-chat-skill-item" onClick={() => onUse(a.id)}>
          <span className="claw-chat-skill-icon">{a.icon}</span>
          <span className="claw-chat-skill-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function ClawChat({
  messages,
  onSendMessage,
  onUseSkill,
  onViewMatch,
  onShare,
}: ClawChatProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="claw-chat">
      {/* 顶部栏 */}
      <div className="claw-chat-topbar">
        <div className="claw-chat-topbar-avatar">🦐</div>
        <div className="claw-chat-topbar-info">
          <div className="claw-chat-topbar-name">小虾仔</div>
          <div className="claw-chat-topbar-status">在线 · 随时待命</div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="claw-chat-messages" ref={scrollRef}>
        {messages.map((msg) => {
          if (msg.role === "system") {
            return (
              <div key={msg.id} className="claw-chat-system">
                <span>{msg.text}</span>
              </div>
            );
          }

          const isClaw = msg.role === "claw";
          return (
            <div
              key={msg.id}
              className={`claw-chat-row ${isClaw ? "claw-chat-row--claw" : "claw-chat-row--user"}`}
            >
              {isClaw && (
                <div className="claw-chat-msg-avatar">🦐</div>
              )}
              <div className="claw-chat-msg-col">
                <div
                  className={`claw-chat-bubble ${
                    isClaw ? "claw-chat-bubble--claw" : "claw-chat-bubble--user"
                  }`}
                >
                  {msg.typing ? (
                    <div className="claw-chat-typing">
                      <Loading size="small" />
                      <span>虾虾思考中...</span>
                    </div>
                  ) : (
                    <div className="claw-chat-bubble-text">{msg.text}</div>
                  )}
                </div>

                {/* Skill 快捷入口 */}
                {msg.actions && msg.actions.length > 0 && (
                  <SkillGrid actions={msg.actions} onUse={onUseSkill} />
                )}

                {/* 嵌入搭子卡片 */}
                {msg.matchCard && (
                  <MatchCardEmbed
                    player={msg.matchCard}
                    onView={() => onViewMatch(msg.matchCard!)}
                  />
                )}

                {/* 嵌入分享卡片 */}
                {msg.shareCard && (
                  <ShareCardEmbed
                    card={msg.shareCard}
                    onShare={() => onShare(msg.shareCard!)}
                  />
                )}

                <div className="claw-chat-time">{msg.time}</div>
              </div>
              {!isClaw && (
                <div className="claw-chat-msg-avatar claw-chat-msg-avatar--user">
                  😎
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 输入区 */}
      <div className="claw-chat-input-bar">
        <input
          className="claw-chat-input"
          placeholder="跟虾虾说点什么..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`claw-chat-send-btn ${inputText.trim() ? "claw-chat-send-btn--active" : ""}`}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
