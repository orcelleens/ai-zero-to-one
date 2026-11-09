#!/usr/bin/env node
/**
 * Skill Packaging Script
 * Creates a distributable .skill file (zip with .skill extension)
 */

import { readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from "fs";
import { createWriteStream } from "fs";
import { createGzip } from "zlib";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(SKILL_ROOT, "dist");
const SKILL_NAME = "ai-zero-to-one";

const INCLUDE_PATTERNS = [
  "SKILL.md",
  "package.json",
  "references/**/*",
  "assets/**/*",
  "scripts/**/*",
];

const EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.git/**",
  "**/*.log",
  "**/*.skill",
  "**/Thumbs.db",
  "**/.DS_Store",
];

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

function shouldInclude(filePath, relativePath) {
  for (const pattern of EXCLUDE_PATTERNS) {
    const regex = globToRegex(pattern);
    if (regex.test(relativePath)) return false;
  }

  for (const pattern of INCLUDE_PATTERNS) {
    const regex = globToRegex(pattern);
    if (regex.test(relativePath)) return true;
  }

  return false;
}

function getAllFiles(dir, base = "") {
  const files = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = join(base, entry);
    const stats = statSync(fullPath);
    
    if (stats.isDirectory()) {
      files.push(...getAllFiles(fullPath, relPath));
    } else {
      files.push(relPath);
    }
  }
  
  return files;
}

async function createSkillPackage() {
  console.log(`📦 Packaging ${SKILL_NAME} skill...`);

  const pkg = JSON.parse(readFileSync(join(SKILL_ROOT, "package.json"), "utf-8"));
  const version = pkg.version;
  const outputFile = join(OUTPUT_DIR, `${SKILL_NAME}-v${version}.skill`);

  const allFiles = getAllFiles(SKILL_ROOT);
  const filesToInclude = allFiles
    .filter(f => shouldInclude(join(SKILL_ROOT, f), f))
    .sort();

  console.log(`   Including ${filesToInclude.length} files`);

  const manifest = {
    name: SKILL_NAME,
    version,
    description: pkg.description,
    author: pkg.author,
    license: pkg.license,
    files: filesToInclude.map(f => ({
      path: f,
      hash: createHash("sha256").update(readFileSync(join(SKILL_ROOT, f))).digest("hex"),
    })),
    createdAt: new Date().toISOString(),
  };

  const manifestPath = join(SKILL_ROOT, ".skill-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  filesToInclude.push(".skill-manifest.json");

  console.log(`   Creating ${outputFile}...`);
  
  const output = createWriteStream(outputFile);
  const gzip = createGzip();
  
  gzip.write(Buffer.from(JSON.stringify({ fileCount: filesToInclude.length }) + "\n"));
  
  for (const file of filesToInclude) {
    const content = readFileSync(join(SKILL_ROOT, file));
    const header = JSON.stringify({ path: file, size: content.length }) + "\n";
    gzip.write(Buffer.from(header));
    gzip.write(content);
    gzip.write(Buffer.from("\n"));
  }
  
  gzip.end();
  
  await new Promise((resolve, reject) => {
    gzip.pipe(output).on("finish", resolve).on("error", reject);
  });

  unlinkSync(manifestPath);

  const stats = statSync(outputFile);
  console.log(`✅ Created ${outputFile} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`   Version: ${version}`);
  console.log(`   Files: ${filesToInclude.length}`);
  
  return outputFile;
}

createSkillPackage().catch(err => {
  console.error("❌ Packaging failed:", err);
  process.exit(1);
});