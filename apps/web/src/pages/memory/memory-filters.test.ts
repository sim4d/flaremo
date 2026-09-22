import { describe, expect, it } from "vitest";
import type { Memory } from "@/api";
import { groupMemories } from "./memory-filters";

function memory(overrides: Partial<Memory>): Memory {
  return {
    id: "memories/1",
    content: "content",
    type: "semantic",
    kind: "fact",
    scope_type: "project",
    scope_key: "github:owner/repo",
    tier: "normal",
    verification: "observed",
    status: "active",
    importance: 50,
    confidence: 50,
    needs_review: false,
    review_reason: null,
    created_by_type: "agent",
    source_agent: "codex",
    source_session: null,
    source_ref: null,
    valid_from: null,
    valid_to: null,
    access_count: 0,
    last_accessed_at: null,
    embedding_status: "indexed",
    created_at: "2026-09-22T10:00:00.000Z",
    updated_at: "2026-09-22T10:00:00.000Z",
    ...overrides,
  } as Memory;
}

describe("groupMemories", () => {
  it("keeps retired project memories out of the projects tab", () => {
    const { projects, archive } = groupMemories([
      memory({ id: "memories/active", status: "active" }),
      memory({ id: "memories/archived", status: "archived" }),
      memory({ id: "memories/superseded", status: "superseded" }),
      memory({ id: "memories/deleted", status: "deleted" }),
    ]);

    expect(projects.map((m) => m.id)).toEqual(["memories/active"]);
    expect(archive.map((m) => m.id).sort()).toEqual([
      "memories/archived",
      "memories/deleted",
      "memories/superseded",
    ]);
  });

  it("still requires an active core tier for the core tab", () => {
    const { core } = groupMemories([
      memory({ id: "memories/core", tier: "core", status: "active" }),
      memory({
        id: "memories/core-archived",
        tier: "core",
        status: "archived",
      }),
      memory({ id: "memories/normal", tier: "normal", status: "active" }),
    ]);

    expect(core.map((m) => m.id)).toEqual(["memories/core"]);
  });

  it("sorts recent by updated_at descending across all scopes", () => {
    const { recent } = groupMemories([
      memory({ id: "memories/old", updated_at: "2026-09-01T00:00:00.000Z" }),
      memory({
        id: "memories/new",
        scope_type: "global",
        scope_key: null,
        updated_at: "2026-09-22T00:00:00.000Z",
      }),
    ]);

    expect(recent.map((m) => m.id)).toEqual(["memories/new", "memories/old"]);
  });
});
