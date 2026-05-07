import React, { useState, useCallback } from "react";
import TaskCenter from "./components/TaskCenter";
import ReportDetail from "./components/ReportDetail";
import ClawChat from "./components/ClawChat";
import MatchHub from "./components/MatchHub";
import FriendMatchDetail from "./components/FriendMatchDetail";
import {
  mockTasks,
  mockReports,
  mockChatMessages,
  mockStrangerMatches,
  mockFriendMatchResult,
  quickActions,
  mockStrangerMatch,
} from "./mock";
import type { BottomTab, PageView, ChatMessage, MatchPlayer, ShareCard } from "./types";
import "./style.css";

export default function Page() {
  const [activeTab, setActiveTab] = useState<BottomTab>("chat");
  const [view, setView] = useState<PageView>("chat");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchPlayer | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleTabChange = useCallback((tab: BottomTab) => {
    setActiveTab(tab);
    if (tab === "chat") setView("chat");
    else if (tab === "tasks") setView("task-center");
    else if (tab === "match") setView("match-hub");
  }, []);

  const handleViewReport = useCallback((taskId: string) => {
    if (mockReports[taskId]) {
      setActiveReportId(taskId);
      setView("report-detail");
    }
  }, []);

  const handleBack = useCallback(() => {
    if (view === "report-detail") {
      setView("task-center");
      setActiveReportId(null);
    } else if (view === "match-detail") {
      setView("match-hub");
      setSelectedMatch(null);
    } else if (view === "friend-match-result") {
      setView("match-hub");
    }
  }, [view]);

  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const clawReply: ChatMessage = {
        id: `claw-${Date.now()}`,
        role: "claw",
        text: `收到！虾虾正在处理「${text.slice(0, 20)}」的请求～稍等一下哦！`,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        actions: text.includes("搭子") || text.includes("匹配")
          ? [quickActions[3], quickActions[5]]
          : undefined,
        matchCard: text.includes("找搭子") ? mockStrangerMatch : undefined,
      };
      setChatMessages((prev) => [...prev, clawReply]);
    }, 800);
  }, []);

  const handleUseSkill = useCallback((skillId: string) => {
    const skill = quickActions.find((s) => s.id === skillId);
    if (!skill) return;
    if (skillId === "s4") {
      setActiveTab("match");
      setView("match-hub");
      return;
    }
    if (skillId === "s6") {
      setActiveTab("match");
      setView("match-hub");
      return;
    }
    const msg: ChatMessage = {
      id: `user-skill-${Date.now()}`,
      role: "user",
      text: `使用技能：${skill.label}`,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const handleViewMatch = useCallback((player: MatchPlayer) => {
    setSelectedMatch(player);
    setView("match-detail");
  }, []);

  const triggerShareToast = useCallback(() => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  }, []);

  const handleShare = useCallback((_card: ShareCard) => {
    triggerShareToast();
  }, [triggerShareToast]);

  const isSubPage = view === "report-detail" || view === "match-detail" || view === "friend-match-result";

  return (
    <div className="claw-mobile-frame">
      {/* 手机状态栏 */}
      <div className="claw-status-bar">
        <span>14:34</span>
        <div className="claw-status-bar-icons">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="claw-page-container">
        {/* 主视图 */}
        {view === "chat" && (
          <ClawChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onUseSkill={handleUseSkill}
            onViewMatch={handleViewMatch}
            onShare={handleShare}
          />
        )}
        {view === "task-center" && (
          <TaskCenter tasks={mockTasks} onViewReport={handleViewReport} />
        )}
        {view === "match-hub" && (
          <MatchHub
            strangers={mockStrangerMatches}
            onViewDetail={handleViewMatch}
            onInviteFriend={triggerShareToast}
            onViewFriendResult={() => setView("friend-match-result")}
            hasFriendResult={true}
          />
        )}

        {/* 子页面 */}
        {view === "report-detail" && activeReportId && mockReports[activeReportId] && (
          <ReportDetail report={mockReports[activeReportId]} onBack={handleBack} />
        )}
        {view === "friend-match-result" && (
          <FriendMatchDetail
            result={mockFriendMatchResult}
            onBack={handleBack}
            onShare={triggerShareToast}
          />
        )}
      </div>

      {/* 底部 Tab 栏 - 子页面时隐藏 */}
      {!isSubPage && (
        <div className="claw-bottom-tabs">
          <button
            className={`claw-bottom-tab ${activeTab === "chat" ? "claw-bottom-tab--active" : ""}`}
            onClick={() => handleTabChange("chat")}
          >
            <span className="claw-bottom-tab-icon">💬</span>
            <span className="claw-bottom-tab-label">对话</span>
          </button>
          <button
            className={`claw-bottom-tab ${activeTab === "tasks" ? "claw-bottom-tab--active" : ""}`}
            onClick={() => handleTabChange("tasks")}
          >
            <span className="claw-bottom-tab-icon">📋</span>
            <span className="claw-bottom-tab-label">任务</span>
          </button>
          <button
            className={`claw-bottom-tab ${activeTab === "match" ? "claw-bottom-tab--active" : ""}`}
            onClick={() => handleTabChange("match")}
          >
            <span className="claw-bottom-tab-icon">🤝</span>
            <span className="claw-bottom-tab-label">搭子</span>
          </button>
        </div>
      )}

      {/* 分享 Toast */}
      {showShareToast && (
        <div className="claw-share-toast">
          <div className="claw-share-toast-content">
            <span>✅</span>
            <span>小程序卡片已发送给好友</span>
          </div>
        </div>
      )}
    </div>
  );
}
