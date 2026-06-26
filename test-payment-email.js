const dotenv = require("dotenv");
dotenv.config();

// Simulate exactly what happens after a paid registration
const { sendRegistrationConfirmationEmail } = require("./services/emailService");
const events = require("./data/events");
const workshops = require("./data/workshops");

async function testPaymentEmail() {
  console.log("=".repeat(60));
  console.log("🧪 Testing payment confirmation email");
  console.log("=".repeat(60));

  console.log("\n📋 Email Config Status:");
  console.log("  EMAIL_1:", process.env.EMAIL_1 ? `${process.env.EMAIL_1.slice(0,3)}***@gmail.com` : "❌ NOT SET");
  console.log("  EMAIL_1_PASSWORD:", process.env.EMAIL_1_PASSWORD ? `✅ SET (${process.env.EMAIL_1_PASSWORD.length} chars)` : "❌ NOT SET");
  console.log("  EMAIL_2:", process.env.EMAIL_2 ? `${process.env.EMAIL_2.slice(0,3)}***@gmail.com` : "❌ NOT SET");
  console.log("  EMAIL_2_PASSWORD:", process.env.EMAIL_2_PASSWORD ? `✅ SET (${process.env.EMAIL_2_PASSWORD.length} chars)` : "❌ NOT SET");
  console.log("  RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ SET" : "❌ NOT SET");

  // This mirrors exactly what payment.js sends
  const testRegistrationData = {
    registrationId: "TF2025-TEST-DEBUG",
    userEmail: process.env.EMAIL_1, // Send to your own email to verify
    userName: "Test User",
    name: "Test User",
    email: process.env.EMAIL_1,
    whatsapp: "9876543210",
    college: "Chennai Institute of Technology",
    department: "Computer Science",
    year: "3rd",
    userDetails: {
      name: "Test User",
      email: process.env.EMAIL_1,
      whatsapp: "9876543210",
      college: "Chennai Institute of Technology",
      department: "Computer Science",
      year: "3rd",
    },
    paymentDetails: {
      orderId: "order_test123",
      paymentId: "pay_test123",
      amount: 299,
      currency: "INR",
      status: "paid",
    },
    selectedEvents: [{ id: 1, title: "Test Event" }],
    selectedWorkshops: [],
    selectedNonTechEvents: [],
    status: "confirmed",
    paymentStatus: "verified",
  };

  console.log("\n📤 Sending test email to:", testRegistrationData.userEmail);
  console.log("-".repeat(60));

  try {
    const result = await sendRegistrationConfirmationEmail(
      testRegistrationData,
      events,
      workshops
    );

    console.log("\n" + "=".repeat(60));
    if (result.success) {
      console.log("✅ EMAIL SENT SUCCESSFULLY!");
      console.log("  Message ID:", result.messageId);
      console.log("  Used email:", result.usedEmail);
      console.log("\n👉 Check your inbox at:", testRegistrationData.userEmail);
    } else {
      console.log("❌ EMAIL FAILED!");
      console.log("  Error:", result.error);
      console.log("  Code:", result.code);
    }
    console.log("=".repeat(60));
  } catch (err) {
    console.error("💥 EXCEPTION:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
  }
}

testPaymentEmail();
