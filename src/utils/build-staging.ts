import { readdir, rm } from "fs/promises";
import { basename, dirname, join } from "path";
import { isENOENT } from "./errors.js";

export function isProcessAlive(pid: number): boolean {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Called while holding the build lock; only remove old, recognizable build directories. */
export async function cleanAbandonedStaging(
  liveDist: string,
  isAlive: (pid: number) => boolean = isProcessAlive,
): Promise<number> {
  const parent = dirname(liveDist);
  const prefix = `${basename(liveDist)}.staging-`;
  let entries;
  try {
    entries = await readdir(parent, { withFileTypes: true });
  } catch (err) {
    if (isENOENT(err)) return 0;
    throw err;
  }
  let removed = 0;
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(prefix)) continue;
    const match = entry.name.slice(prefix.length).match(/^([1-9]\d*)-\d{13}$/);
    if (!match) continue;
    const pid = Number(match[1]);
    if (!Number.isSafeInteger(pid) || pid > 2_147_483_647 || isAlive(pid)) continue;
    await rm(join(parent, entry.name), { recursive: true, force: true });
    removed++;
  }
  return removed;
}
