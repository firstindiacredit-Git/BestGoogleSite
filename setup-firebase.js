// setup-firebase.js

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🔥 Firebase Setup for Linktree Google OAuth\n");

const questions = [
  {
    name: "apiKey",
    question: "Enter your Firebase API Key: ",
    required: true,
  },
  {
    name: "authDomain",
    question:
      "Enter your Firebase Auth Domain (e.g., project.firebaseapp.com): ",
    required: true,
  },
  {
    name: "projectId",
    question: "Enter your Firebase Project ID: ",
    required: true,
  },
  {
    name: "storageBucket",
    question:
      "Enter your Firebase Storage Bucket (e.g., project.appspot.com): ",
    required: true,
  },
  {
    name: "messagingSenderId",
    question: "Enter your Firebase Messaging Sender ID: ",
    required: true,
  },
  {
    name: "appId",
    question: "Enter your Firebase App ID: ",
    required: true,
  },
  {
    name: "jwtSecret",
    question: "Enter a secure JWT secret (or press Enter to generate one): ",
    required: false,
  },
  {
    name: "mongoUri",
    question:
      "Enter your MongoDB connection string (or press Enter for localhost): ",
    required: false,
  },
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateEnvFiles();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    if (question.required && !answer.trim()) {
      console.log("❌ This field is required. Please try again.\n");
      askQuestion(index);
      return;
    }

    answers[question.name] = answer.trim();
    askQuestion(index + 1);
  });
}

function generateEnvFiles() {
  // Generate JWT secret if not provided
  if (!answers.jwtSecret) {
    answers.jwtSecret = require("crypto").randomBytes(64).toString("hex");
  }

  // Use default MongoDB URI if not provided
  if (!answers.mongoUri) {
    answers.mongoUri = "mongodb://localhost:27017/linktree_db";
  }

  // Frontend .env content
  const frontendEnv = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${answers.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${answers.authDomain}
VITE_FIREBASE_PROJECT_ID=${answers.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${answers.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${answers.messagingSenderId}
VITE_FIREBASE_APP_ID=${answers.appId}

# Other APIs (optional - add these later if needed)
VITE_OPENWEATHER_API_KEY=
VITE_PAYPAL_PLAN_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_UPLOAD_AVATAR_PRESET=
VITE_CLOUDINARY_UPLOAD_BACKGROUND_PRESET=
`;

  // Backend .env content
  const backendEnv = `# Backend Environment Variables
JWT_SECRET=${answers.jwtSecret}
MONGO_URI=${answers.mongoUri}
PORT=5000

# Cloudinary Configuration (optional - add these later if needed)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
`;

  try {
    // Write frontend .env
    fs.writeFileSync(".env", frontendEnv);
    console.log("✅ Created .env file in root directory");

    // Write backend .env
    fs.writeFileSync("Link-Tree-Backend-main/.env", backendEnv);
    console.log("✅ Created .env file in backend directory");

    console.log("\n🎉 Setup complete! Next steps:");
    console.log(
      "1. Start the backend server: cd Link-Tree-Backend-main && npm start"
    );
    console.log("2. Start the frontend: npm run dev");
    console.log("3. Test Google OAuth in the Linktree component");
    console.log("4. Check the FirebaseTest component to verify configuration");
  } catch (error) {
    console.error("❌ Error creating .env files:", error.message);
  }

  rl.close();
}

// Start the setup process
askQuestion(0);
