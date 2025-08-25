// test-unified-auth.js

const fs = require("fs");
const path = require("path");

console.log("🔍 Testing Unified Authentication System...\n");

// Check main signin component
const signinFile = path.join(__dirname, "src/components/Signup/signin.jsx");
if (fs.existsSync(signinFile)) {
  const signinContent = fs.readFileSync(signinFile, "utf8");

  console.log("📋 Main Signin Component Analysis:");

  // Check if it imports AuthContext
  if (
    signinContent.includes(
      "import { useAuth } from '../../context/AuthContext'"
    )
  ) {
    console.log("✅ Uses main AuthContext");
  } else {
    console.log("❌ Does not use main AuthContext");
  }

  // Check if it uses googleLogin from AuthContext
  if (signinContent.includes("const { googleLogin } = useAuth()")) {
    console.log("✅ Uses AuthContext googleLogin function");
  } else {
    console.log("❌ Does not use AuthContext googleLogin");
  }

  // Check if it still has direct Firebase imports
  if (signinContent.includes("import { signInWithPopup")) {
    console.log(
      "⚠️  Still has direct Firebase imports (may be for email auth)"
    );
  } else {
    console.log("✅ No direct Firebase popup imports");
  }

  // Check Google signin function
  if (signinContent.includes("const result = await googleLogin()")) {
    console.log("✅ Google signin uses AuthContext");
  } else {
    console.log("❌ Google signin does not use AuthContext");
  }
} else {
  console.log("❌ Main signin component not found");
}

console.log("\n📋 Linktree Components Analysis:");

// Check Linktree components
const linktreeDir = path.join(__dirname, "src/components/Linktree");
const components = [
  "LinktreeMain.jsx",
  "Login.jsx",
  "Register.jsx",
  "Dashboard.jsx",
];

components.forEach((component) => {
  const filePath = path.join(linktreeDir, component);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    if (content.includes("from '../../context/AuthContext'")) {
      console.log(`✅ ${component} - Uses main AuthContext`);
    } else {
      console.log(`❌ ${component} - Does not use main AuthContext`);
    }
  } else {
    console.log(`❌ ${component} - Not found`);
  }
});


