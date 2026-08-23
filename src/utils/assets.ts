import { join } from "path";
import { rename, rm } from "fs/promises";
import { ensureDir } from "./fs.js";

const HASH_LENGTH = 12;

export function contentHash(content: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(content);
  return hasher.digest("hex").slice(0, HASH_LENGTH);
}

export async function emitHashedTextAsset(
  directory: string,
  baseName: string,
  extension: string,
  content: string
): Promise<string> {
  const fileName = `${baseName}.${contentHash(content)}${extension}`;
  const destinationPath = join(directory, fileName);
  await ensureDir(directory);
  if (await Bun.file(destinationPath).exists()) return fileName;

  const temporaryPath = `${destinationPath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    await Bun.write(temporaryPath, content);
    await rename(temporaryPath, destinationPath);
  } catch (err) {
    await rm(temporaryPath, { force: true });
    throw err;
  }
  return fileName;
}
