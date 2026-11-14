import type { ReactNode } from "react";
import { buttonStyle } from "./buttonStyle";

const TONE_BACKGROUNDS = {
  warning: "#fdf0d2",
  success: "#dcefe7",
  error: "#fbe1dd",
} as const;

export type NoticeTone = keyof typeof TONE_BACKGROUNDS;

type NoticeProps = {
  tone: NoticeTone;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
};

export function Notice({ tone, children, action }: NoticeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px",
        background: TONE_BACKGROUNDS[tone],
        border: "1px solid #00000020",
        borderRadius: 8,
        fontSize: 14,
        color: "#1b1d1c",
      }}
    >
      {children}
      {action ? (
        <button type="button" onClick={action.onClick} style={buttonStyle}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function NoticeArea({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}
