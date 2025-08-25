#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Fixing Linktree Build Error...\n");

// Check if the deleted file still exists (it shouldn't)
const deletedAuthContext = path.join(
  __dirname,
  "src/components/Linktree/AuthContext.jsx"
);
if (fs.existsSync(deletedAuthContext)) {
  console.log("❌ Deleted AuthContext.jsx still exists - removing it...");
  fs.unlinkSync(deletedAuthContext);
  console.log("✅ Removed deleted AuthContext.jsx");
} else {
  console.log("✅ Deleted AuthContext.jsx properly removed");
}

// Check if main AuthContext exists
const mainAuthContext = path.join(__dirname, "src/context/AuthContext.jsx");
if (fs.existsSync(mainAuthContext)) {
  console.log("✅ Main AuthContext.jsx exists");
} else {
  console.log("❌ Main AuthContext.jsx not found!");
  process.exit(1);
}

// Check all Linktree components for correct imports
const linktreeDir = path.join(__dirname, "src/components/Linktree");
const components = [
  "LinktreeMain.jsx",
  "Login.jsx",
  "Register.jsx",
  "Dashboard.jsx",
  "LinktreeTest.jsx",
];

console.log("\n🔍 Checking component imports...");
let allGood = true;

components.forEach((component) => {
  const filePath = path.join(linktreeDir, component);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${component} not found`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  // Check for correct import
  if (content.includes("from '../../context/AuthContext'")) {
    console.log(`✅ ${component} - Correct import`);
  } else if (content.includes("from './AuthContext'")) {
    console.log(`❌ ${component} - Wrong import, needs fixing`);
    allGood = false;
  } else {
    console.log(`⚠️  ${component} - No AuthContext import found`);
  }
});

if (!allGood) {
  console.log("\n❌ Some components have incorrect imports");
  process.exit(1);
}

// Clear potential cache directories
console.log("\n🧹 Clearing cache...");
const cacheDirs = [
  path.join(__dirname, "node_modules/.vite"),
  path.join(__dirname, ".vite"),
  path.join(__dirname, "dist"),
];

cacheDirs.forEach((cacheDir) => {
  if (fs.existsSync(cacheDir)) {
    try {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log(`✅ Cleared ${path.basename(cacheDir)}`);
    } catch (error) {
      console.log(
        `⚠️  Could not clear ${path.basename(cacheDir)}: ${error.message}`
      );
    }
  }
});

console.log("\n🎉 Build error should be fixed!");
console.log("\n📋 Next steps:");
console.log("1. Stop the development server (Ctrl+C)");
console.log("2. Run: npm run dev");
console.log("3. The error should be resolved");

console.log("\n🔍 If the error persists:");
console.log("1. Check browser console for any remaining errors");
console.log("2. Clear browser cache and reload");
console.log("3. Restart the development server");
