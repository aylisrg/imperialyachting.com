import { describe, it, expect } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { parseAnalysisOutput, stripCodeFence } from "../mcp-analyzer";

type Block = Anthropic.Beta.BetaContentBlock;

function textBlock(text: string): Block {
  return { type: "text", text, citations: null } as unknown as Block;
}

function toolUseBlock(): Block {
  return {
    type: "mcp_tool_use",
    id: "toolu_1",
    name: "ads_get_ad_entities",
    server_name: "meta-ads",
    input: {},
  } as unknown as Block;
}

describe("stripCodeFence", () => {
  it("returns plain JSON untouched", () => {
    expect(stripCodeFence('{"a":1}')).toBe('{"a":1}');
  });

  it("strips a ```json fence", () => {
    expect(stripCodeFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strips a bare ``` fence", () => {
    expect(stripCodeFence('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("trims surrounding whitespace", () => {
    expect(stripCodeFence('  \n{"a":1}\n  ')).toBe('{"a":1}');
  });
});

describe("parseAnalysisOutput", () => {
  it("parses the report from the final text block", () => {
    const result = parseAnalysisOutput([
      textBlock('{"summary":"Steady day","opportunity_score":72}'),
    ]);
    expect(result.summary).toBe("Steady day");
    expect(result.opportunity_score).toBe(72);
  });

  it("ignores MCP tool-use blocks interleaved with the answer", () => {
    const result = parseAnalysisOutput([
      toolUseBlock(),
      textBlock('{"summary":"After tools"}'),
    ]);
    expect(result.summary).toBe("After tools");
  });

  it("unwraps a fenced JSON response", () => {
    const result = parseAnalysisOutput([
      textBlock('```json\n{"summary":"Fenced"}\n```'),
    ]);
    expect(result.summary).toBe("Fenced");
  });

  it("takes the final answer when the model narrates first", () => {
    const result = parseAnalysisOutput([
      textBlock("Let me pull the ad entities first."),
      toolUseBlock(),
      textBlock('{"summary":"Final answer"}'),
    ]);
    expect(result.summary).toBe("Final answer");
  });

  it("recovers when a preamble shares the final text block", () => {
    const result = parseAnalysisOutput([
      textBlock('Here is the report:\n{"summary":"Recovered"}'),
    ]);
    expect(result.summary).toBe("Recovered");
  });

  it("throws when there is no text at all", () => {
    expect(() => parseAnalysisOutput([toolUseBlock()])).toThrow(
      "No text response from Claude",
    );
  });

  it("throws a clear error when the text holds no JSON", () => {
    expect(() => parseAnalysisOutput([textBlock("I could not reach Meta.")])).toThrow(
      "No JSON object found in Claude response",
    );
  });
});
