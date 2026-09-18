import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AiPage, { aiFaq, metadata } from "../page";
import { SITE_CONFIG } from "@/lib/constants";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const MCP_URL = `${SITE_CONFIG.url}/api/mcp`;

describe("AiPage", () => {
  it("renders the MCP connector URL", () => {
    render(<AiPage />);
    expect(screen.getAllByText(MCP_URL).length).toBeGreaterThan(0);
  });

  it("renders setup instructions for the major AI clients", () => {
    render(<AiPage />);
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("Claude (web & desktop)")).toBeInTheDocument();
    expect(screen.getByText("Perplexity")).toBeInTheDocument();
    expect(screen.getByText("Cursor & other MCP clients")).toBeInTheDocument();
  });

  it("renders the FAQ questions used for the FAQPage schema", () => {
    render(<AiPage />);
    for (const item of aiFaq) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it("has canonical metadata pointing at /ai", () => {
    expect(metadata.title).toMatch(/Book with AI/i);
    expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.url}/ai`);
  });

  it("exports a non-empty FAQ array with question/answer pairs", () => {
    expect(aiFaq.length).toBeGreaterThanOrEqual(6);
    for (const item of aiFaq) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });
});
