import type { Memory } from "@/api";
import { formatTimestamp } from "@/lib/date-format";

/** Bucket a filtered memory list into the five tab views. */
export function groupMemories(filtered: Memory[]) {
  const core = filtered.filter(
    (m) => m.tier === "core" && m.status === "active",
  );
  // Projects is the active working set, so retired memories belong to the
  // archive tab only. Without the status filter an archived or superseded
  // memory was counted here as well, inflating the per-project badge.
  const projects = filtered.filter(
    (m) => m.scope_type === "project" && m.status === "active",
  );
  const recent = [...filtered].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );
  const archive = filtered.filter((m) =>
    ["superseded", "archived", "deleted"].includes(m.status),
  );
  return { core, projects, recent, archive };
}

export { formatTimestamp };
