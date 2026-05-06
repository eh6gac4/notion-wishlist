import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityText, StatusPill } from "@/components/Pill";

describe("StatusPill", () => {
  it("ステータスがあれば名前と色ドットを表示する", () => {
    render(<StatusPill status="購入予定" />);
    expect(screen.getByText("購入予定")).toBeInTheDocument();
  });

  it("null のときは「未設定」を表示する", () => {
    render(<StatusPill status={null} />);
    expect(screen.getByText("未設定")).toBeInTheDocument();
  });
});

describe("PriorityText", () => {
  it("優先度をそのまま表示する", () => {
    render(<PriorityText priority="高" />);
    expect(screen.getByText("高")).toBeInTheDocument();
  });

  it("null のときはダッシュを表示する", () => {
    render(<PriorityText priority={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
