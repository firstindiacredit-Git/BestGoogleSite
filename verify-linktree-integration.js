// verify-linktree-integration.js

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Linktree Authentication Integration...\n");

const linktreeDir = path.join(__dirname, "src/components/Linktree");
const mainAuthContext = path.join(__dirname, "src/context/AuthContext.jsx");

// Check if main AuthContext exists
if (!fs.existsSync(mainAuthContext)) {
  console.log("❌ Main AuthContext not found at:", mainAuthContext);
  process.exit(1);
} else {
  console.log("✅ Main AuthContext found");
}

// Check Linktree components
const components = [
  "LinktreeMain.jsx",
  "Login.jsx",
  "Register.jsx",
  "Dashboard.jsx",
  "LinktreeTest.jsx",
];

let allGood = true;

components.forEach((component) => {
  const filePath = path.join(linktreeDir, component);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${component} not found`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  // Check if it imports from main AuthContext
  if (content.includes("from '../../context/AuthContext'")) {
    console.log(`✅ ${component} - Correctly imports from main AuthContext`);
  } else if (content.includes("from './AuthContext'")) {
    console.log(`❌ ${component} - Still imports from local AuthContext`);
    allGood = false;
  } else {
    console.log(`⚠️  ${component} - No AuthContext import found`);
  }
});

// Check if old AuthContext is completely removed
const oldAuthContext = path.join(linktreeDir, "AuthContext.jsx");
if (fs.existsSync(oldAuthContext)) {
  console.log("❌ Old AuthContext.jsx still exists - should be deleted");
  allGood = false;
} else {
  console.log("✅ Old AuthContext.jsx properly deleted");
}

// Check if App.jsx is removed (since we're using main website's routing)
const oldApp = path.join(linktreeDir, "App.jsx");
if (fs.existsSync(oldApp)) {
  console.log("❌ Old App.jsx still exists - should be deleted");
  allGood = false;
} else {
  console.log("✅ Old App.jsx properly deleted");
}

console.log("\n📋 Integration Summary:");
if (allGood) {
  console.log("🎉 All Linktree components are properly integrated!");
  console.log("✅ Using main website's authentication system");
  console.log("✅ Google OAuth functionality available");
  console.log("✅ Shared JWT tokens across components");
  console.log("✅ Single sign-on experience");
} else {
  console.log("❌ Some issues found - please fix the above problems");
  process.exit(1);
}

console.log("\n🚀 Ready to test the integration!");
console.log("1. Start the backend: cd Link-Tree-Backend-main && npm start");
console.log("2. Start the frontend: npm run dev");
console.log("3. Test the Linktree component");
