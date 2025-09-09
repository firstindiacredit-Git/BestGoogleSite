// Build script for AllMyTab Chrome Extension
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build configuration
const buildConfig = {
  sourceDir: __dirname,
  outputDir: path.join(__dirname, "dist"),
  filesToCopy: [
    "manifest.json",
    "newtab.html",
    "background.js",
    "popup.html",
    "popup.js",
    "icons",
  ],
};

// Create build function
function buildExtension() {
  console.log("🚀 Building AllMyTab Chrome Extension...");

  // Create output directory
  if (!fs.existsSync(buildConfig.outputDir)) {
    fs.mkdirSync(buildConfig.outputDir, { recursive: true });
    console.log("✅ Created output directory");
  }

  // Copy files
  buildConfig.filesToCopy.forEach((file) => {
    const sourcePath = path.join(buildConfig.sourceDir, file);
    const destPath = path.join(buildConfig.outputDir, file);

    if (fs.existsSync(sourcePath)) {
      if (fs.statSync(sourcePath).isDirectory()) {
        // Copy directory
        copyDirectory(sourcePath, destPath);
        console.log(`✅ Copied directory: ${file}`);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied file: ${file}`);
      }
    } else {
      console.warn(`⚠️  File not found: ${file}`);
    }
  });

  // Validate manifest
  validateManifest();

  console.log("🎉 Build completed successfully!");
  console.log(`📦 Extension ready in: ${buildConfig.outputDir}`);
  console.log("\n📋 Installation Instructions:");
  console.log("1. Open Chrome and go to chrome://extensions/");
  console.log('2. Enable "Developer mode" in the top right');
  console.log('3. Click "Load unpacked" and select the dist folder');
  console.log("4. The extension will be installed and active");
}

// Copy directory recursively
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Validate manifest.json
function validateManifest() {
  try {
    const manifestPath = path.join(buildConfig.outputDir, "manifest.json");
    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContent);

    // Check required fields
    const requiredFields = [
      "manifest_version",
      "name",
      "version",
      "chrome_url_overrides",
    ];
    const missingFields = requiredFields.filter((field) => !manifest[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Check if newtab override exists
    if (!manifest.chrome_url_overrides.newtab) {
      throw new Error("Missing newtab override in manifest");
    }

    console.log("✅ Manifest validation passed");
  } catch (error) {
    console.error("❌ Manifest validation failed:", error.message);
    process.exit(1);
  }
}

// Clean build directory
function cleanBuild() {
  if (fs.existsSync(buildConfig.outputDir)) {
    fs.rmSync(buildConfig.outputDir, { recursive: true, force: true });
    console.log("🧹 Cleaned build directory");
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case "clean":
    cleanBuild();
    break;
  case "build":
  default:
    buildExtension();
    break;
}
