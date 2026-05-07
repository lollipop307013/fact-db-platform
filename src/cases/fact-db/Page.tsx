import React from "react";
import { Card } from "tdesign-react";
import EntityTab from "./components/EntityTab";
import EventTab from "./components/EventTab";
import FactTab from "./components/FactTab";
import ExtractTab from "./components/ExtractTab";
import QaTab from "./components/QaTab";
import ErrorDetectTab from "./components/ErrorDetectTab";
import type { FactEnv } from "./types";
import "./style.css";

const knownMenus = ["entity", "event", "fact", "extract", "qa", "error-detect"];

interface PageProps {
  activeMenu: string;
  env: FactEnv;
}

export default function Page({ activeMenu, env }: PageProps) {
  if (!knownMenus.includes(activeMenu)) {
    return (
      <div className="factdb-page">
        <Card bordered>
          <div style={{ padding: 48, textAlign: "center", color: "var(--td-text-color-placeholder)" }}>
            功能开发中...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="factdb-page">
      <Card bordered>
        {activeMenu === "entity"       && <EntityTab />}
        {activeMenu === "event"        && <EventTab />}
        {activeMenu === "fact"         && <FactTab env={env} />}
        {activeMenu === "extract"      && <ExtractTab />}
        {activeMenu === "qa"           && <QaTab />}
        {activeMenu === "error-detect" && <ErrorDetectTab />}
      </Card>
    </div>
  );
}
