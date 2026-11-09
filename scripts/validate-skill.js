#!/usr/bin/env node
/**
 * Skill Validation Script
 * Validates the ai-zero-to-one skill structure and content
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_ROOT = join(__dirname, "..");
const REQUIRED_FILES = [
  "SKILL.md",
  "package.json",
];

const REQUIRED_DIRS = [
  "references",
  "assets",
  "scripts",
];

const REQUIRED_REFERENCES = [
  "llm-fundamentals.md",
  "agent-loop.md",
  "context-management.md",
  "mcp-server-patterns.md",
  "game-dev-patterns.md",
  "nextjs-patterns.md",
  "supabase-patterns.md",
  "automation-patterns.md",
  "eval-harness.md",
  "production-audit.md",
  "subagent-patterns.md",
];

const REQUIRED_ASSETS = [
  "spec-template.md",
  "eval-template.md",
  "postmortem-template.md",
  "autonomy-report-template.md",
  "mission-template.md",
  "mcp-server-template/",
];

function checkExists(path, type) {
  try {
    const stats = statSync(path);
    return type === "file" ? stats.isFile() : stats.isDirectory();
  } catch {
    return false;
  }
}

function validateFrontmatter(content) {
  const errors = [];
  
  if (!content.startsWith("---")) {
    errors.push("Missing YAML frontmatter (---)");
    return { valid: false, errors };
  }

  const frontmatterEnd = content.indexOf("---", 3);
  if (frontmatterEnd === -1) {
    errors.push("Unclosed YAML frontmatter");
    return { valid: false, errors };
  }

  const frontmatter = content.slice(3, frontmatterEnd).trim();
  
  const requiredFields = ["name", "description"];
  for (const field of requiredFields) {
    if (!frontmatter.includes(`${field}:`)) {
      errors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  if (!frontmatter.includes("name: ai-zero-to-one")) {
    errors.push("Skill name in frontmatter should be 'ai-zero-to-one'");
  }

  return { valid: errors.length === 0, errors };
}

function validateSkillMd() {
  const skillPath = join(SKILL_ROOT, "SKILL.md");
  if (!checkExists(skillPath, "file")) {
    return { valid: false, errors: ["SKILL.md not found"] };
  }

  const content = readFileSync(skillPath, "utf-8");
  const fmResult = validateFrontmatter(content);
  if (!fmResult.valid) return fmResult;

  const errors = [];
  
  const requiredSections = [
    "Phase 0: Discovery",
    "Phase 1: Foundations",
    "Phase 2: Your First Autonomous Build",
    "Phase 3: Domain Specialization",
    "Phase 4: Advanced Orchestration",
    "Phase 5: Autonomy Proof",
    "The Professor's Rules",
    "Reference Files",
    "Asset Templates",
    "Installation",
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  if (!content.includes("MISSION.md")) {
    errors.push("Missing MISSION.md reference");
  }

  if (!content.includes("learning-records")) {
    errors.push("Missing learning-records reference");
  }

  return { valid: errors.length === 0, errors };
}

function validateReferences() {
  const refDir = join(SKILL_ROOT, "references");
  const errors = [];

  if (!checkExists(refDir, "dir")) {
    return { valid: false, errors: ["references/ directory not found"] };
  }

  const files = readdirSync(refDir).filter(f => extname(f) === ".md");
  
  for (const required of REQUIRED_REFERENCES) {
    if (!files.includes(required)) {
      errors.push(`Missing required reference: ${required}`);
    }
  }

  for (const file of files) {
    const content = readFileSync(join(refDir, file), "utf-8");
    if (content.trim().length < 100) {
      errors.push(`Reference ${file} appears empty or too short`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateAssets() {
  const assetsDir = join(SKILL_ROOT, "assets");
  const errors = [];

  if (!checkExists(assetsDir, "dir")) {
    return { valid: false, errors: ["assets/ directory not found"] };
  }

  const files = readdirSync(assetsDir);
  
  for (const required of REQUIRED_ASSETS) {
    const path = join(assetsDir, required);
    if (!checkExists(path, required.endsWith("/") ? "dir" : "file")) {
      errors.push(`Missing required asset: ${required}`);
    }
  }

  const mcpTemplate = join(assetsDir, "mcp-server-template");
  if (checkExists(mcpTemplate, "dir")) {
    const mcpRequired = [
      "package.json",
      "tsconfig.json",
      "README.md",
      "src/index.ts",
      "src/tools/index.ts",
      "src/resources/index.ts",
      "src/prompts/index.ts",
      "src/utils/logger.ts",
    ];
    
    for (const req of mcpRequired) {
      if (!checkExists(join(mcpTemplate, req), req.endsWith(".ts") || req.endsWith(".json") || req.endsWith(".md") ? "file" : "dir")) {
        errors.push(`MCP template missing: ${req}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateScripts() {
  const scriptsDir = join(SKILL_ROOT, "scripts");
  const errors = [];

  if (!checkExists(scriptsDir, "dir")) {
    return { valid: false, errors: ["scripts/ directory not found"] };
  }

  const requiredScripts = ["validate-skill.js", "package-skill.js"];
  
  for (const script of requiredScripts) {
    if (!checkExists(join(scriptsDir, script), "file")) {
      errors.push(`Missing script: ${script}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateRootFiles() {
  const errors = [];
  
  for (const file of REQUIRED_FILES) {
    if (!checkExists(join(SKILL_ROOT, file), "file")) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  for (const dir of REQUIRED_DIRS) {
    if (!checkExists(join(SKILL_ROOT, dir), "dir")) {
      errors.push(`Missing required directory: ${dir}/`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function main() {
  console.log("🔍 Validating ai-zero-to-one skill...\n");

  const results = [
    { name: "Root files", ...validateRootFiles() },
    { name: "SKILL.md", ...validateSkillMd() },
    { name: "References", ...validateReferences() },
    { name: "Assets", ...validateAssets() },
    { name: "Scripts", ...validateScripts() },
  ];

  let allValid = true;
  
  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.name}`);
    } else {
      console.log(`❌ ${result.name}`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
      allValid = false;
    }
  }

  console.log(`\n${allValid ? "✅ All validations passed!" : "❌ Validation failed!"}`);
  process.exit(allValid ? 0 : 1);
}

main();