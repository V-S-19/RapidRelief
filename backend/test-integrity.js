// Comprehensive Integrity Test for RapidRelief Project
// Run with: node test-integrity.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the root directory (one level up from backend)
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Test tracking
let testsPassed = 0;
let testsFailed = 0;
let testsWarning = 0;

const log = {
  pass: (msg) => {
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
    testsPassed++;
  },
  fail: (msg) => {
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
    testsFailed++;
  },
  warn: (msg) => {
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
    testsWarning++;
  },
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (title) => {
    console.log(`\n${colors.blue}${title}${colors.reset}`);
    console.log("━".repeat(60));
  },
};

// ============ UTILITY FUNCTIONS ============
const fileExists = (filePath) => {
  return fs.existsSync(path.join(__dirname, filePath));
};

const fileContains = (filePath, text) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), "utf8");
    return content.includes(text);
  } catch (e) {
    return false;
  }
};

const getFileContent = (filePath) => {
  try {
    return fs.readFileSync(path.join(__dirname, filePath), "utf8");
  } catch (e) {
    return null;
  }
};

// ============ TEST SUITES ============

console.log(
  `\n╔${"═".repeat(58)}╗\n║ ${" ".repeat(16)}RapidRelief - Integrity Tests${" ".repeat(14)}║\n╚${"═".repeat(58)}╝`
);

// Test Suite 1: File Structure
log.section("📁 TEST SUITE 1: FILE STRUCTURE");

// Root level
fileExists("package.json")
  ? log.pass("Root package.json")
  : log.fail("Root package.json missing");
fileExists("README.md")
  ? log.pass("README.md documentation")
  : log.warn("README.md missing");

// Backend
const backendFiles = [
  "backend/package.json",
  "backend/.env",
  "backend/server.js",
  "backend/config/db.js",
  "backend/models/Alert.js",
  "backend/controllers/alertController.js",
  "backend/routes/alertRoutes.js",
  "backend/socket/socket.js",
];

backendFiles.forEach((file) => {
  fileExists(file) ? log.pass(`Backend: ${path.basename(file)}`) : log.fail(`Backend: ${file} missing`);
});

// Frontend
const frontendFiles = [
  "frontend/package.json",
  "frontend/tsconfig.json",
  "frontend/next.config.mjs",
  "frontend/app/page.tsx",
  "frontend/app/layout.tsx",
  "frontend/app/api/emergency-report/route.ts",
];

frontendFiles.forEach((file) => {
  fileExists(file)
    ? log.pass(`Frontend: ${path.basename(file)}`)
    : log.fail(`Frontend: ${file} missing`);
});

// AI Service
const aiFiles = [
  "ai-service/main.py",
  "ai-service/model.py",
  "ai-service/requirements.txt",
];

aiFiles.forEach((file) => {
  fileExists(file) ? log.pass(`AI Service: ${path.basename(file)}`) : log.fail(`AI Service: ${file} missing`);
});

// Test Suite 2: Configuration
log.section("⚙️  TEST SUITE 2: CONFIGURATION");

// Environment variables
const envContent = getFileContent("backend/.env");
if (envContent) {
  envContent.includes("MONGO_URI")
    ? log.pass("Backend .env has MONGO_URI")
    : log.fail("Backend .env missing MONGO_URI");
  envContent.includes("NODE_ENV")
    ? log.pass("Backend .env has NODE_ENV")
    : log.warn("Backend .env missing NODE_ENV");
} else {
  log.fail("Backend .env file not readable");
}

// Package.json scripts
const rootPkg = JSON.parse(getFileContent("package.json") || "{}");
const scripts = rootPkg.scripts || {};

Object.keys(scripts).length > 0
  ? log.pass("Root scripts configured")
  : log.fail("Root scripts missing");

scripts["dev:frontend"]
  ? log.pass("dev:frontend script exists")
  : log.warn("dev:frontend script missing");
scripts["dev:backend"] ? log.pass("dev:backend script exists") : log.warn("dev:backend script missing");
scripts["dev:ai"] ? log.pass("dev:ai script exists") : log.warn("dev:ai script missing");

// Port verification
getFileContent("package.json").includes("8000")
  ? log.pass("AI service port configured (8000)")
  : log.fail("AI service port not set to 8000");

getFileContent("backend/server.js").includes("5000")
  ? log.pass("Backend port configured (5000)")
  : log.warn("Backend port might not be set to 5000");

// Test Suite 3: Dependencies
log.section("📦 TEST SUITE 3: DEPENDENCIES");

const backendPkg = JSON.parse(getFileContent("backend/package.json") || "{}");
const backendDeps = { ...backendPkg.dependencies, ...backendPkg.devDependencies };

["express", "mongoose", "socket.io", "cors", "dotenv", "axios"].forEach((dep) => {
  backendDeps[dep] ? log.pass(`Backend dependency: ${dep}`) : log.fail(`Backend missing: ${dep}`);
});

const frontendPkg = JSON.parse(getFileContent("frontend/package.json") || "{}");
const frontendDeps = { ...frontendPkg.dependencies, ...frontendPkg.devDependencies };

["next", "react", "react-dom"].forEach((dep) => {
  frontendDeps[dep] ? log.pass(`Frontend dependency: ${dep}`) : log.fail(`Frontend missing: ${dep}`);
});

const aiRequirements = getFileContent("ai-service/requirements.txt") || "";
["fastapi", "uvicorn", "opencv-python", "numpy"].forEach((dep) => {
  aiRequirements.includes(dep)
    ? log.pass(`AI dependency: ${dep}`)
    : dep === "opencv-python"
      ? log.warn(`AI dependency: ${dep} (optional)`)
      : log.fail(`AI missing: ${dep}`);
});

// Test Suite 4: API Endpoints
log.section("🔗 TEST SUITE 4: API ENDPOINTS");

fileContains("backend/routes/alertRoutes.js", "router.post")
  ? log.pass("Backend POST endpoint defined")
  : log.fail("Backend POST endpoint missing");

fileContains("backend/routes/alertRoutes.js", "detectDanger")
  ? log.pass("Alert controller imported")
  : log.fail("Alert controller not imported");

fileContains("frontend/app/api/emergency-report/route.ts", "POST")
  ? log.pass("Frontend POST handler defined")
  : log.fail("Frontend POST handler missing");

fileContains("ai-service/main.py", "@app.post")
  ? log.pass("AI POST endpoint defined")
  : log.fail("AI POST endpoint missing");

fileContains("ai-service/main.py", "detect_emergency")
  ? log.pass("Emergency detection function defined")
  : log.fail("Emergency detection function missing");

// Test Suite 5: Integration
log.section("🔌 TEST SUITE 5: INTEGRATION POINTS");

fileContains("backend/server.js", "connectDB")
  ? log.pass("Backend initializes database connection")
  : log.fail("Database initialization missing");

fileContains("backend/server.js", "initSocket")
  ? log.pass("Backend initializes Socket.io")
  : log.fail("Socket.io initialization missing");

fileContains("backend/controllers/alertController.js", "axios.post")
  ? log.pass("Backend calls AI service")
  : log.fail("Backend missing AI service call");

fileContains("backend/controllers/alertController.js", "emit")
  ? log.pass("Backend emits Socket.io events")
  : log.fail("Backend missing Socket.io emit");

fileContains("frontend/app/page.tsx", "fetch")
  ? log.pass("Frontend makes API calls")
  : log.fail("Frontend missing API calls");

// Test Suite 6: Error Handling
log.section("🛡️  TEST SUITE 6: ERROR HANDLING");

const errorHandling = [
  { file: "backend/server.js", name: "Backend" },
  { file: "backend/controllers/alertController.js", name: "Controllers" },
  { file: "frontend/app/page.tsx", name: "Frontend" },
];

errorHandling.forEach(({ file, name }) => {
  const content = getFileContent(file) || "";
  content.includes("try") && content.includes("catch")
    ? log.pass(`${name} has error handling`)
    : log.warn(`${name} may lack error handling`);
});

const aiContent = getFileContent("ai-service/main.py") || "";
aiContent.includes("try") && aiContent.includes("except")
  ? log.pass("AI service has error handling")
  : log.warn("AI service may lack error handling");

// Test Suite 7: Type Safety
log.section("✨ TEST SUITE 7: TYPE SAFETY & QUALITY");

fileExists("frontend/tsconfig.json")
  ? log.pass("TypeScript configured for frontend")
  : log.fail("TypeScript not configured");

fileContains("frontend/tsconfig.json", "strict")
  ? log.pass("Strict mode enabled (good)")
  : log.warn("Strict mode might not be enabled");

const frontendLayout = getFileContent("frontend/app/layout.tsx") || "";
frontendLayout.includes("'use client'")
  ? log.pass("Client component directives used")
  : log.warn("Missing use client directives");

// Test Suite 8: Components & UI
log.section("🎨 TEST SUITE 8: UI COMPONENTS");

const components = [
  "emergency-capture.tsx",
  "emergency-confirmation.tsx",
  "emergency-form.tsx",
];

components.forEach((comp) => {
  fileExists(`frontend/components/${comp}`)
    ? log.pass(`Component: ${comp}`)
    : log.fail(`Component missing: ${comp}`);
});

// Test Suite 9: Database Models
log.section("💾 TEST SUITE 9: DATABASE MODELS");

const alertModel = getFileContent("backend/models/Alert.js") || "";
alertModel.includes("alertSchema") ? log.pass("Alert schema defined") : log.fail("Alert schema missing");
alertModel.includes("image") ? log.pass("Alert has image field") : log.fail("Image field missing");
alertModel.includes("type") ? log.pass("Alert has type field") : log.fail("Type field missing");
alertModel.includes("createdAt")
  ? log.pass("Alert has timestamp")
  : log.warn("Timestamp tracking might be missing");

// Summary
log.section("📊 TEST SUMMARY");

console.log(`\n${colors.green}✓ Passed:  ${testsPassed}${colors.reset}`);
console.log(`${colors.red}✗ Failed:  ${testsFailed}${colors.reset}`);
console.log(`${colors.yellow}⚠ Warnings: ${testsWarning}${colors.reset}\n`);

if (testsFailed === 0) {
  console.log(
    `${colors.green}✓ All critical tests passed! Project integrity verified.${colors.reset}\n`
  );
  process.exit(0);
} else {
  console.log(
    `${colors.red}✗ Critical issues found. Please review above.${colors.reset}\n`
  );
  process.exit(1);
}
