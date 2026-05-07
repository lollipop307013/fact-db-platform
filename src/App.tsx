import React, { useState } from "react";
import { Layout, Menu, Select, Space, Dropdown, Button } from "tdesign-react";
import {
  EditIcon, BookIcon, LinkIcon, ChartIcon, SettingIcon, MailIcon,
  TaskIcon, ServerIcon, HelpCircleIcon, UserCircleIcon, ChevronDownIcon,
} from "tdesign-icons-react";
import FactDbPage from "./cases/fact-db/Page";
import ClawNamingPage from "./cases/claw-naming/Page";
import { gameOptions } from "./cases/fact-db/mock";
import type { FactEnv } from "./cases/fact-db/types";

const { Header, Aside, Content } = Layout;
const { SubMenu, MenuItem } = Menu;

const contentMenuItems = ["entity", "event", "fact", "extract", "qa", "error-detect"];

function getRouteFromPath(): string {
  const path = window.location.pathname;
  if (path.includes("claw-naming")) return "claw-naming";
  return "fact-db";
}

export default function App() {
  const [route] = useState(getRouteFromPath);
  const [game, setGame] = useState("valorant");
  const [menuValue, setMenuValue] = useState("entity");
  const [env] = useState<FactEnv>("prod"); // 本期固定正式环境，测试/正式切换在后续版本实现

  if (route === "claw-naming") return <ClawNamingPage />;

  const handleSyncToProduction = () => {}; // 移至 FactTab 内处理，此处保留空函数占位

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">游戏知几</div>
          <Select
            options={gameOptions}
            value={game}
            onChange={(v) => setGame(v as string)}
            style={{ width: 160 }}
            borderless
          />
        </div>
        <div className="app-header-right">
          <Space size="large">

            {/* 环境切换 - 后续版本实现
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--td-text-color-secondary)" }}>环境：</span>
              <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid var(--td-component-stroke)" }}>
                <div onClick={() => setEnv("test")} style={{ padding: "4px 16px", fontSize: 13, cursor: "pointer", background: env === "test" ? "var(--td-warning-color)" : "transparent", color: env === "test" ? "#fff" : "var(--td-text-color-secondary)", fontWeight: env === "test" ? 600 : 400, transition: "all .15s" }}>测试</div>
                <div onClick={() => setEnv("prod")} style={{ padding: "4px 16px", fontSize: 13, cursor: "pointer", background: env === "prod" ? "var(--td-brand-color)" : "transparent", color: env === "prod" ? "#fff" : "var(--td-text-color-secondary)", fontWeight: env === "prod" ? 600 : 400, transition: "all .15s" }}>正式</div>
              </div>
            </div>
            */}

            <Button variant="text" icon={<HelpCircleIcon />}>帮助文档</Button>
            <Dropdown
              options={[
                { content: "个人设置", value: "setting" },
                { content: "退出登录", value: "logout" },
              ]}
            >
              <Button variant="text" icon={<UserCircleIcon />} suffix={<ChevronDownIcon />}>
                dorrawang
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Header>

      <Layout>
        <Aside className="app-aside">
          <Menu
            theme="dark"
            value={menuValue}
            onChange={(v) => {
              const val = v as string;
              if (contentMenuItems.includes(val) || ["kb-list","ch-list","overview","ops-list","task-list","sys-config","msg-list"].includes(val)) {
                setMenuValue(val);
              }
            }}
            defaultExpanded={["content"]}
            style={{ height: "100%" }}
          >
            <SubMenu value="content" title="内容管理" icon={<EditIcon />}>
              <MenuItem value="entity">实体管理</MenuItem>
              <MenuItem value="event">事件管理</MenuItem>
              <MenuItem value="fact">事实管理</MenuItem>
              <MenuItem value="extract">事实提取</MenuItem>
              <MenuItem value="qa">问题回答</MenuItem>
              <MenuItem value="error-detect">错误表述检测</MenuItem>
            </SubMenu>
            <SubMenu value="knowledge" title="知识库" icon={<BookIcon />}>
              <MenuItem value="kb-list">知识库列表</MenuItem>
            </SubMenu>
            <SubMenu value="channel" title="渠道接入" icon={<LinkIcon />}>
              <MenuItem value="ch-list">渠道列表</MenuItem>
            </SubMenu>
            <SubMenu value="stats" title="数据统计" icon={<ChartIcon />}>
              <MenuItem value="overview">数据概览</MenuItem>
            </SubMenu>
            <SubMenu value="ops" title="知识运维" icon={<ServerIcon />}>
              <MenuItem value="ops-list">运维列表</MenuItem>
            </SubMenu>
            <SubMenu value="task" title="任务管理" icon={<TaskIcon />}>
              <MenuItem value="task-list">任务列表</MenuItem>
            </SubMenu>
            <SubMenu value="setting" title="系统设置" icon={<SettingIcon />}>
              <MenuItem value="sys-config">系统配置</MenuItem>
            </SubMenu>
            <SubMenu value="message" title="消息推送" icon={<MailIcon />}>
              <MenuItem value="msg-list">推送列表</MenuItem>
            </SubMenu>
          </Menu>
        </Aside>
        <Content className="app-content">
          <FactDbPage activeMenu={menuValue} env={env} />
        </Content>
      </Layout>
    </Layout>
  );
}
