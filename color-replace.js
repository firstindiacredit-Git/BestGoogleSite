/**
 * Color Replacement Script
 *
 * This script helps replace hardcoded color values with dynamic Tailwind classes
 * Usage: node color-replace.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const PRIMARY_COLOR = "#28283a";
const PRIMARY_COLOR_UPPER = "#28283A";
const SECONDARY_COLOR = "#513a7a";
const SECONDARY_COLOR_UPPER = "#513A7A";

// Replacement patterns
const replacements = [
  // Primary color - background
  {
    search: `dark:bg-[${PRIMARY_COLOR}]`,
    replace: "dark:bg-primary",
  },
  {
    search: `dark:bg-[${PRIMARY_COLOR_UPPER}]`,
    replace: "dark:bg-primary",
  },
  {
    search: `dark:bg-[${PRIMARY_COLOR}]/[var(--widget-opacity)]`,
    replace: "dark:bg-primary/[var(--widget-opacity)]",
  },
  {
    search: `dark:bg-[${PRIMARY_COLOR_UPPER}]/[var(--widget-opacity)]`,
    replace: "dark:bg-primary/[var(--widget-opacity)]",
  },
  {
    search: `dark:bg-[${PRIMARY_COLOR}]/[(var(--widget-opacity))]`,
    replace: "dark:bg-primary/[(var(--widget-opacity))]",
  },
  {
    search: `dark:bg-[${PRIMARY_COLOR_UPPER}]/[(var(--widget-opacity))]`,
    replace: "dark:bg-primary/[(var(--widget-opacity))]",
  },

  // Secondary color - background
  {
    search: `dark:bg-[${SECONDARY_COLOR}]`,
    replace: "dark:bg-secondary",
  },
  {
    search: `dark:bg-[${SECONDARY_COLOR_UPPER}]`,
    replace: "dark:bg-secondary",
  },
  {
    search: `dark:bg-[${SECONDARY_COLOR}]/[var(--widget-opacity)]`,
    replace: "dark:bg-secondary/[var(--widget-opacity)]",
  },
  {
    search: `dark:bg-[${SECONDARY_COLOR_UPPER}]/[var(--widget-opacity)]`,
    replace: "dark:bg-secondary/[var(--widget-opacity)]",
  },
  {
    search: `dark:bg-[${SECONDARY_COLOR}]/[(var(--widget-opacity))]`,
    replace: "dark:bg-secondary/[(var(--widget-opacity))]",
  },
  {
    search: `dark:bg-[${SECONDARY_COLOR_UPPER}]/[(var(--widget-opacity))]`,
    replace: "dark:bg-secondary/[(var(--widget-opacity))]",
  },

  // Primary color - text color
  {
    search: `dark:text-[${PRIMARY_COLOR}]`,
    replace: "dark:text-primary",
  },
  {
    search: `dark:text-[${PRIMARY_COLOR_UPPER}]`,
    replace: "dark:text-primary",
  },

  // Secondary color - text color
  {
    search: `dark:text-[${SECONDARY_COLOR}]`,
    replace: "dark:text-secondary",
  },
  {
    search: `dark:text-[${SECONDARY_COLOR_UPPER}]`,
    replace: "dark:text-secondary",
  },

  // Primary color - border
  {
    search: `dark:border-[${PRIMARY_COLOR}]`,
    replace: "dark:border-primary",
  },
  {
    search: `dark:border-[${PRIMARY_COLOR_UPPER}]`,
    replace: "dark:border-primary",
  },

  // Secondary color - border
  {
    search: `dark:border-[${SECONDARY_COLOR}]`,
    replace: "dark:border-secondary",
  },
  {
    search: `dark:border-[${SECONDARY_COLOR_UPPER}]`,
    replace: "dark:border-secondary",
  },

  // CSS literal values
  {
    search: `background: ${PRIMARY_COLOR};`,
    replace: "background: var(--primary-color);",
  },
  {
    search: `background: ${PRIMARY_COLOR_UPPER};`,
    replace: "background: var(--primary-color);",
  },
  {
    search: `background: ${SECONDARY_COLOR};`,
    replace: "background: var(--secondary-color);",
  },
  {
    search: `background: ${SECONDARY_COLOR_UPPER};`,
    replace: "background: var(--secondary-color);",
  },
  {
    search: `color: ${PRIMARY_COLOR};`,
    replace: "color: var(--primary-color);",
  },
  {
    search: `color: ${PRIMARY_COLOR_UPPER};`,
    replace: "color: var(--primary-color);",
  },
  {
    search: `color: ${SECONDARY_COLOR};`,
    replace: "color: var(--secondary-color);",
  },
  {
    search: `color: ${SECONDARY_COLOR_UPPER};`,
    replace: "color: var(--secondary-color);",
  },
  {
    search: `border-color: ${PRIMARY_COLOR};`,
    replace: "border-color: var(--primary-color);",
  },
  {
    search: `border-color: ${PRIMARY_COLOR_UPPER};`,
    replace: "border-color: var(--primary-color);",
  },
  {
    search: `border-color: ${SECONDARY_COLOR};`,
    replace: "border-color: var(--secondary-color);",
  },
  {
    search: `border-color: ${SECONDARY_COLOR_UPPER};`,
    replace: "border-color: var(--secondary-color);",
  },
];

// Find all JavaScript, JSX, CSS files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
      fileList = findFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".css"))
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Apply replacements to a file
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  replacements.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      modified = true;
      console.log(`In ${filePath}: Replaced "${search}" with "${replace}"`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Main function
function main() {
  console.log("Starting color replacement process...");

  try {
    const files = findFiles(".");
    console.log(`Found ${files.length} files to process`);

    files.forEach((file) => {
      try {
        replaceInFile(file);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    });

    console.log("Color replacement completed successfully");
  } catch (err) {
    console.error("Error during color replacement:", err);
  }
}

main();
