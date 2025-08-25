const fs = require("fs");
const path = require("path");

console.log("🔧 Quick Fix for Linktree Build Error\n");

// 1. Verify the deleted file is gone
const deletedFile = path.join(
  __dirname,
  "src/components/Linktree/AuthContext.jsx"
);
if (fs.existsSync(deletedFile)) {
  console.log("❌ Deleted file still exists - removing...");
  fs.unlinkSync(deletedFile);
  console.log("✅ Removed deleted file");
} else {
  console.log("✅ Deleted file properly removed");
}

// 2. Verify main AuthContext exists
const mainFile = path.join(__dirname, "src/context/AuthContext.jsx");
if (fs.existsSync(mainFile)) {
  console.log("✅ Main AuthContext exists");
} else {
  console.log("❌ Main AuthContext missing!");
  process.exit(1);
}

// 3. Check all imports are correct
const linktreeDir = path.join(__dirname, "src/components/Linktree");
const files = [
  "LinktreeMain.jsx",
  "Login.jsx",
  "Register.jsx",
  "Dashboard.jsx",
];

let hasErrors = false;

files.forEach((file) => {
  const filePath = path.join(linktreeDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("from '../../context/AuthContext'")) {
      console.log(`✅ ${file} - Correct import`);
    } else if (content.includes("from './AuthContext'")) {
      console.log(`❌ ${file} - Wrong import!`);
      hasErrors = true;
    } else {
      console.log(`⚠️  ${file} - No AuthContext import`);
    }
  }
});

if (hasErrors) {
  console.log("\n❌ Found import errors - please fix them");
  process.exit(1);
}

console.log("\n✅ All imports are correct!");
console.log("\n📋 Solution:");
console.log("1. Stop the development server (Ctrl+C)");
console.log("2. Clear browser cache");
console.log("3. Run: npm run dev");
console.log("4. The error should be resolved");

console.log("\n💡 If error persists:");
console.log("- Clear node_modules/.vite directory");
console.log("- Restart your IDE/editor");
console.log("- Check for any remaining file references");
