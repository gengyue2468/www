import { join, dirname } from "path";
import { rename, rm } from "fs/promises";
import { contentHash, emitHashedTextAsset } from "./assets.js";
import { ensureDir, readFileContent } from "./fs.js";
import { AppError, ErrorCode } from "./errors.js";

const MERMAID_VERSION = "10.9.3";
const CORE_DEPENDENCY = "mermaid-5a5980d4.js";

// The pinned Mermaid distribution uses literal, same-directory ESM imports.
// Include dynamic imports, named imports, and bare side-effect imports.
export function getRelativeModuleImports(source: string): string[] {
  const pattern = /(?:import\s*(?:\(\s*)?|from\s*)["'](\.\/[^"']+)["']/g;
  return [...new Set([...source.matchAll(pattern)].map(match => match[1]))];
}

export async function validateModuleAssets(assetsDir: string, fileNames: Iterable<string>): Promise<void> {
  for (const fileName of fileNames) {
    const modulePath = join(assetsDir, fileName);
    const source = await readFileContent(modulePath);
    for (const importedName of getRelativeModuleImports(source)) {
      const importedPath = join(dirname(modulePath), importedName);
      if (!(await Bun.file(importedPath).exists())) {
        throw new AppError(`Missing Mermaid module dependency '${importedName}' in '${fileName}'`, ErrorCode.BUILD_ERROR, {
          modulePath,
          importedPath,
        });
      }
    }
  }
}

async function fetchCachedBuildAsset(url: string, cachePath: string): Promise<string> {
  if (await Bun.file(cachePath).exists() && Bun.file(cachePath).size > 0) {
    return readFileContent(cachePath);
  }

  const temporaryPath = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    console.log(`  Downloading ${url}...`);
    await ensureDir(dirname(cachePath));
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.text();
    if (!content) throw new Error("Empty response");
    await Bun.write(temporaryPath, content);
    await rename(temporaryPath, cachePath);
    return content;
  } catch (err) {
    await rm(temporaryPath, { force: true });
    throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { url, cachePath });
  }
}

export async function prepareMermaidRuntime(assetsDir: string, cacheDir: string): Promise<string> {
  const entryUrl = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.esm.min.mjs`;
  const dependencyUrl = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/${CORE_DEPENDENCY}`;
  const [entry, dependency] = await Promise.all([
    fetchCachedBuildAsset(entryUrl, join(cacheDir, `mermaid-${MERMAID_VERSION}.esm.min.mjs`)),
    fetchCachedBuildAsset(dependencyUrl, join(cacheDir, `mermaid-${MERMAID_VERSION}.${CORE_DEPENDENCY}`)),
  ]);

  const coreModuleName = `./${CORE_DEPENDENCY}`;
  const modules = new Map([[coreModuleName, dependency]]);
  const pending = [...modules.keys()];

  for (let index = 0; index < pending.length; index++) {
    const moduleSource = modules.get(pending[index])!;
    for (const importedName of getRelativeModuleImports(moduleSource)) {
      if (modules.has(importedName)) continue;
      const importedUrl = new URL(importedName, dependencyUrl).toString();
      const cacheName = importedName.replace(/^\.\//, "");
      const importedSource = await fetchCachedBuildAsset(
        importedUrl,
        join(cacheDir, `mermaid-${MERMAID_VERSION}.${cacheName}`),
      );
      modules.set(importedName, importedSource);
      pending.push(importedName);
    }
  }

  const emittedModules = new Map<string, string>();
  const emitted = new Set<string>();
  const resolvingModules = new Set<string>();
  // Diagram chunks import core helpers, while the core dynamically imports the
  // diagrams. Keep the existing stable core name to break that intentional cycle.
  emittedModules.set(coreModuleName, `mermaid-core-${contentHash(dependency)}.js`);

  const emitModule = async (moduleName: string): Promise<string> => {
    const existing = emittedModules.get(moduleName);
    if (moduleName === coreModuleName && resolvingModules.has(moduleName)) return existing!;
    if (emitted.has(moduleName)) return existing!;
    if (resolvingModules.has(moduleName)) {
      throw new Error(`Circular Mermaid module dependency: ${moduleName}`);
    }

    const source = modules.get(moduleName);
    if (source === undefined) throw new Error(`Missing Mermaid module: ${moduleName}`);
    resolvingModules.add(moduleName);

    let rewritten = source;
    for (const importedName of getRelativeModuleImports(source)) {
      const importedFileName = await emitModule(importedName);
      rewritten = rewritten.replaceAll(importedName, `./${importedFileName}`);
    }

    const baseName = moduleName.split("/").pop()!.replace(/\.[^.]+$/, "");
    const extension = moduleName.endsWith(".mjs") ? ".mjs" : ".js";
    const filePrefix = moduleName === coreModuleName ? "mermaid-core" : `mermaid-${baseName}`;
    const fileName = existing || await emitHashedTextAsset(assetsDir, filePrefix, extension, rewritten);
    if (existing) await Bun.write(join(assetsDir, fileName), rewritten);
    emittedModules.set(moduleName, fileName);
    emitted.add(moduleName);
    resolvingModules.delete(moduleName);
    return fileName;
  };

  const dependencyFileName = await emitModule(coreModuleName);
  const rewrittenEntry = entry.replaceAll(coreModuleName, `./${dependencyFileName}`);
  const entryFileName = await emitHashedTextAsset(assetsDir, "mermaid-esm", ".mjs", rewrittenEntry);
  await validateModuleAssets(assetsDir, [...emittedModules.values(), entryFileName]);
  return `/assets/${entryFileName}`;
}
