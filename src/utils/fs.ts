import { mkdir, readdir } from "fs/promises";
import { join } from "path";
import type { DirsConfig } from "../types.js";
import { AppError, ErrorCode, isENOENT, errorReporter } from "./errors.js";

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function copyDirectory(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  
  let entries;
  try {
    entries = await readdir(src, { withFileTypes: true });
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { src });
  }

  const dirs: Array<{ src: string; dest: string }> = [];
  const files: Array<{ src: string; dest: string }> = [];

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      dirs.push({ src: srcPath, dest: destPath });
    } else {
      files.push({ src: srcPath, dest: destPath });
    }
  }

  await Promise.all(
    files.map(async ({ src: srcPath, dest: destPath }) => {
      try {
        await Bun.write(destPath, Bun.file(srcPath));
      } catch (err) {
        throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { src: srcPath, dest: destPath });
      }
    })
  );

  await Promise.all(dirs.map(({ src: s, dest: d }) => copyDirectory(s, d)));
}

export async function copyPublicFiles(dirs: DirsConfig): Promise<void> {
  const { public: publicDir, dist } = dirs;

  let entries;
  try {
    entries = await readdir(publicDir, { withFileTypes: true });
  } catch (err) {
    if (isENOENT(err)) {
      errorReporter.reportWarning("Public directory not found, skipping", { dir: publicDir });
      return;
    }
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { dir: publicDir });
  }

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = join(publicDir, entry.name);
      const destPath = join(dist, entry.name);

      if (entry.isDirectory()) {
        await ensureDir(destPath);
        await copyDirectory(srcPath, destPath);
      } else {
        try {
          await Bun.write(destPath, Bun.file(srcPath));
        } catch (err) {
          throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { src: srcPath, dest: destPath });
        }
      }
    })
  );
}

export async function loadLayout(layoutName: string, layoutsDir: string): Promise<string> {
  const layoutPath = join(layoutsDir, `${layoutName}.html`);
  try {
    const file = Bun.file(layoutPath);
    return await file.text();
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { layout: layoutName, path: layoutPath });
  }
}

export async function readFileContent(filePath: string): Promise<string> {
  try {
    const file = Bun.file(filePath);
    return await file.text();
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { path: filePath });
  }
}

export async function writeFileContent(filePath: string, content: string): Promise<void> {
  try {
    await Bun.write(filePath, content);
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { path: filePath });
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const file = Bun.file(filePath);
    if (!(await file.exists())) return null;
    return await file.json() as T;
  } catch (err) {
    if (isENOENT(err)) return null;
    throw AppError.fromError(err, ErrorCode.PARSE_ERROR, { path: filePath });
  }
}
