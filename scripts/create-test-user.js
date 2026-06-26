const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error("❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY not found in .env file.");
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
  process.exit(1);
}

const email = "reviewer@techfiesta.org";
const password = "RazorpayTest2026!";

async function createTestUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: "Razorpay Reviewer",
      emailVerified: true,
    });
    console.log(`\n🎉 Successfully created test user:`);
    console.log(`   UID:      ${userRecord.uid}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log(`\nℹ️ Test user already exists in Firebase Auth:`);
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.error("❌ Error creating test user:", error.message);
    }
  }
}

createTestUser();
