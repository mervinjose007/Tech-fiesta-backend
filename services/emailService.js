const nodemailer = require("nodemailer");

// Email configuration with rotation
const emailConfigs = [
  {
    email: process.env.EMAIL_1,
    password: process.env.EMAIL_1_PASSWORD,
    name: "Tech Fiesta Team",
    currentUsage: 0,
    dailyLimit: 500, // Gmail's daily limit
  },
  {
    email: process.env.EMAIL_2,
    password: process.env.EMAIL_2_PASSWORD,
    name: "Tech Fiesta Team",
    currentUsage: 0,
    dailyLimit: 500,
  },
  {
    email: process.env.EMAIL_3,
    password: process.env.EMAIL_3_PASSWORD,
    name: "Tech Fiesta Team",
    currentUsage: 0,
    dailyLimit: 500,
  },
  {
    email: process.env.EMAIL_4,
    password: process.env.EMAIL_4_PASSWORD,
    name: "Tech Fiesta Team",
    currentUsage: 0,
    dailyLimit: 500,
  },
  {
    email: process.env.EMAIL_5,
    password: process.env.EMAIL_5_PASSWORD,
    name: "Tech Fiesta Team",
    currentUsage: 0,
    dailyLimit: 500,
  },
];

// Current email index for rotation
let currentEmailIndex = 0;

// Reset usage counters daily
const resetUsageCounters = () => {
  emailConfigs.forEach((config) => {
    config.currentUsage = 0;
  });
  console.log("📧 Email usage counters reset for the day");
};

// Reset usage counters at midnight
setInterval(resetUsageCounters, 24 * 60 * 60 * 1000);

// Get email service status
const getEmailServiceStatus = () => {
  if (process.env.RESEND_API_KEY) {
    return [
      {
        type: "Resend",
        email: "onboarding@resend.dev",
        isConfigured: true,
        currentUsage: "N/A",
        dailyLimit: "Unlimited (free tier limits apply)",
        isActive: true,
      }
    ];
  }
  return emailConfigs.map((config, index) => ({
    index: index + 1,
    email: config.email
      ? config.email.replace(/(.{3}).*(@.*)/, "$1***$2")
      : "Not configured",
    isConfigured: !!(config.email && config.password),
    currentUsage: config.currentUsage,
    dailyLimit: config.dailyLimit,
    isActive: config.currentUsage < config.dailyLimit,
  }));
};

// Get next available email configuration
const getAvailableEmailConfig = () => {
  console.log(
    `🔍 Looking for available email config. Current index: ${currentEmailIndex}`
  );

  // Try to find an email with available quota
  for (let i = 0; i < emailConfigs.length; i++) {
    const config = emailConfigs[(currentEmailIndex + i) % emailConfigs.length];
    const configIndex = (currentEmailIndex + i) % emailConfigs.length;

    console.log(`📧 Checking email config ${configIndex + 1}:`, {
      email: config.email
        ? config.email.replace(/(.{3}).*(@.*)/, "$1***$2")
        : "Not configured",
      hasPassword: !!config.password,
      currentUsage: config.currentUsage,
      dailyLimit: config.dailyLimit,
      available: config.currentUsage < config.dailyLimit,
    });

    if (
      config.email &&
      config.password &&
      config.currentUsage < config.dailyLimit
    ) {
      console.log(`✅ Found available email config: ${configIndex + 1}`);
      return config;
    }
  }

  console.log(
    "⚠️ No email config with available quota found, using first config"
  );
  return emailConfigs[0]; // Fallback to first config
};

// Create transporter for the selected email
const createTransporter = (config) => {
  if (process.env.RESEND_API_KEY) {
    console.log("🔧 Creating transporter using Resend SMTP");
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      });
      console.log(`✅ Resend transporter created successfully`);
      return transporter;
    } catch (error) {
      console.error(`❌ Error creating Resend transporter:`, error.message);
      throw error;
    }
  }

  console.log(
    `🔧 Creating transporter for Gmail: ${
      config && config.email
        ? config.email.replace(/(.{3}).*(@.*)/, "$1***$2")
        : "Not configured"
    }`
  );

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email,
        pass: config.password,
      },
    });

    console.log(`✅ Gmail transporter created successfully`);
    return transporter;
  } catch (error) {
    console.error(`❌ Error creating Gmail transporter:`, error.message);
    throw error;
  }
};

// Generate email template for registration confirmation
const generateRegistrationEmailTemplate = (
  registrationData,
  events,
  workshops
) => {
  const { registrationId, userEmail, paymentDetails, selectedPass } =
    registrationData;

  // Get event details for tech events
  const selectedEventDetails = [];
  if (
    registrationData.selectedEvents &&
    registrationData.selectedEvents.length > 0
  ) {
    registrationData.selectedEvents.forEach((selectedEvent) => {
      // Handle both {id, title} format and just id format
      const eventId = selectedEvent.id || selectedEvent;
      const event = events.find((e) => e.id === eventId && e.type === "tech");
      if (event) {
        selectedEventDetails.push(event);
      }
    });
  }

  // Get workshop details
  const selectedWorkshopDetails = [];
  if (
    registrationData.selectedWorkshops &&
    registrationData.selectedWorkshops.length > 0
  ) {
    registrationData.selectedWorkshops.forEach((selectedWorkshop) => {
      // Handle both {id, title} format and just id format
      const workshopId = selectedWorkshop.id || selectedWorkshop;
      const workshop = workshops.find((w) => w.id === workshopId);
      if (workshop) {
        selectedWorkshopDetails.push(workshop);
      }
    });
  }

  // Get non-tech event details
  const selectedNonTechEventDetails = [];
  if (
    registrationData.selectedNonTechEvents &&
    registrationData.selectedNonTechEvents.length > 0
  ) {
    registrationData.selectedNonTechEvents.forEach((selectedEvent) => {
      // Handle both {id, title} format and just id format
      const eventId = selectedEvent.id || selectedEvent;
      const event = events.find(
        (e) => e.id === eventId && e.type === "non-tech"
      );
      if (event) {
        selectedNonTechEventDetails.push(event);
      }
    });
  }

  const isCIT = userEmail && userEmail.endsWith("@citchennai.net");
  const isFreRegistration = !paymentDetails || paymentDetails.amount === 0;

  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .registration-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .event-list { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; }
        .event-item { padding: 15px; border-bottom: 1px solid #eee; }
        .event-item:last-child { border-bottom: none; }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .event-details { background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 8px; }
        .pass-info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
        .free-registration { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <h2>Tech Fiesta 2025</h2>
            <p>Chennai Institute of Technology</p>
        </div>
        
        <div class="content">
            <div class="registration-details">
                <h3>📋 Registration Details</h3>
                <p><strong>Registration ID:</strong> ${registrationId}</p>
                <p><strong>Participant Name:</strong> ${
                  registrationData.userDetails?.name ||
                  registrationData.name ||
                  "Not provided"
                }</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>College:</strong> ${
                  registrationData.userDetails?.college ||
                  registrationData.college ||
                  "Not provided"
                }</p>
                <p><strong>Department:</strong> ${
                  registrationData.userDetails?.department ||
                  registrationData.department ||
                  "Not provided"
                }</p>
                <p><strong>Year of Study:</strong> ${
                  registrationData.userDetails?.year ||
                  registrationData.year ||
                  "Not provided"
                }</p>
                <p><strong>WhatsApp:</strong> ${
                  registrationData.userDetails?.whatsapp ||
                  registrationData.whatsapp ||
                  "Not provided"
                }</p>
                <p><strong>Student Type:</strong> ${
                  isCIT ? "CIT Student" : "External Student"
                }</p>
                ${
                  !isFreRegistration
                    ? `
                <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
                <p><strong>Amount Paid:</strong> <span class="amount">₹${paymentDetails.amount}</span></p>
                <p><strong>Payment Status:</strong> ✅ Verified</p>
                `
                    : `
                <div class="free-registration">
                    <p><strong>Registration Type:</strong> ✅ Free Registration</p>
                    <p><em>No payment required for your selected events</em></p>
                </div>
                `
                }
            </div>

            ${
              (registrationData.teamDetails?.isTeamEvent ||
                registrationData.isTeamEvent) &&
              (registrationData.teamDetails?.teamMembers ||
                registrationData.teamMembers) &&
              (
                registrationData.teamDetails?.teamMembers ||
                registrationData.teamMembers
              ).length > 0
                ? `
            <div class="registration-details">
                <h3>👥 Team Details</h3>
                <p><strong>Team Leader:</strong> ${
                  registrationData.userDetails?.name ||
                  registrationData.name ||
                  "Not provided"
                }</p>
                <p><strong>Team Size:</strong> ${
                  registrationData.teamDetails?.teamSize ||
                  registrationData.teamSize ||
                  (
                    registrationData.teamDetails?.teamMembers ||
                    registrationData.teamMembers
                  ).length + 1
                } members</p>
                <div class="event-details">
                    <h4>Team Members:</h4>
                    ${(
                      registrationData.teamDetails?.teamMembers ||
                      registrationData.teamMembers
                    )
                      .map(
                        (member, index) => `
                        <div style="margin-bottom: 10px; padding: 8px; border-left: 3px solid #667eea;">
                            <strong>Member ${index + 2}:</strong> ${
                          member.name || "Not provided"
                        }<br>
                            <small>📧 ${member.email || "Not provided"} | 📱 ${
                          member.whatsapp || "Not provided"
                        }</small><br>
                            <small>🏛️ ${
                              member.department || "Not provided"
                            } | 📚 ${member.year || "Not provided"}</small>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
            `
                : ""
            }

            ${
              selectedPass
                ? `
            <div class="pass-info">
                <h3>🎫 Selected Pass</h3>
                <div class="event-item">
                    <strong>Tech Fiesta General Pass</strong><br>
                    <div class="event-details">
                        <p>✅ Unlimited access to ALL technical events</p>
                        <p>✅ 1 workshop included + up to 4 additional workshops</p>
                        <p>✅ Priority seating and exclusive merchandise</p>
                        <p><strong>Pass ID:</strong> ${selectedPass}</p>
                    </div>
                </div>
            </div>
            `
                : ""
            }

            ${
              !selectedPass &&
              selectedEventDetails.length === 0 &&
              selectedWorkshopDetails.length === 0 &&
              selectedNonTechEventDetails.length === 0
                ? `
            <div class="event-list">
                <h3>🎪 Welcome to Tech Fiesta 2025!</h3>
                <div class="event-item" style="background: #e8f4fd; border-left: 4px solid #2196f3;">
                    <p style="margin: 0; color: #1976d2;">
                        <strong>🎉 Your registration is complete!</strong><br><br>
                        You can still participate in events by:
                    </p>
                    <div class="event-details">
                        <p>🎯 <strong>Walk-in Registration:</strong> Available at the venue for most events</p>
                        <p>🎨 <strong>Non-Tech Events:</strong> Register and pay at the venue on event day</p>
                        <p>🎫 <strong>General Pass:</strong> Purchase at the venue for unlimited access to all tech events</p>
                        <p>📱 <strong>Mobile Registration:</strong> Use our website to add more events anytime</p>
                    </div>
                </div>
            </div>
            `
                : ""
            }

            ${
              selectedEventDetails.length > 0
                ? `
            <div class="event-list">
                <h3>🎯 Technical Events Registered</h3>
                ${selectedEventDetails
                  .map(
                    (event) => `
                <div class="event-item">
                    <strong>${event.title}</strong>
                    <div class="event-details">
                        <p>📅 <strong>Date:</strong> ${event.date}</p>
                        <p>🕒 <strong>Time:</strong> ${event.time}</p>
                        <p>📍 <strong>Venue:</strong> ${event.venue}</p>
                        <p>📝 <strong>Description:</strong> ${
                          event.description
                        }</p>
                        ${
                          event.speakers
                            ? `<p>👨‍🏫 <strong>Speakers:</strong> ${event.speakers.join(
                                ", "
                              )}</p>`
                            : ""
                        }
                    </div>
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            ${
              selectedWorkshopDetails.length > 0
                ? `
            <div class="event-list">
                <h3>🛠️ Workshops Registered</h3>
                ${selectedWorkshopDetails
                  .map(
                    (workshop) => `
                <div class="event-item">
                    <strong>${workshop.title}</strong>
                    <div class="event-details">
                        <p>📅 <strong>Date:</strong> ${workshop.date}</p>
                        <p>🕒 <strong>Time:</strong> ${workshop.time}</p>
                        <p>📍 <strong>Venue:</strong> ${workshop.venue}</p>
                        <p>📝 <strong>Description:</strong> ${workshop.description}</p>
                        <p>👨‍🏫 <strong>Instructor:</strong> ${workshop.instructor}</p>
                        <p>⏱️ <strong>Duration:</strong> ${workshop.duration}</p>
                        <p>📊 <strong>Level:</strong> ${workshop.level}</p>
                    </div>
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            ${
              selectedNonTechEventDetails.length > 0
                ? `
            <div class="event-list">
                <h3>🎨 Non-Technical Events Registered</h3>
                <p style="background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404; margin-bottom: 15px;">
                    <strong>📢 Important:</strong> Payment for non-technical events is required at the venue on the day of the event.
                </p>
                ${selectedNonTechEventDetails
                  .map(
                    (event) => `
                <div class="event-item">
                    <strong>${event.title}</strong>
                    <div class="event-details">
                        <p>📅 <strong>Date:</strong> ${event.date}</p>
                        <p>🕒 <strong>Time:</strong> ${event.time}</p>
                        <p>📍 <strong>Venue:</strong> ${event.venue}</p>
                        <p>📝 <strong>Description:</strong> ${event.description}</p>
                        <p>💰 <strong>Payment:</strong> At venue on arrival</p>
                    </div>
                </div>
                `
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            <div class="registration-details">
                <h3>📋 Important Instructions</h3>
                <ul>
                    <li><strong>Save this email</strong> for your records - you'll need it for event entry</li>
                    <li><strong>Bring a valid ID card</strong> to all events for verification</li>
                    <li><strong>Arrive 15 minutes early</strong> to all registered events</li>
                    <li><strong>Non-tech events</strong> require payment at the venue before participation</li>
                    <li><strong>Follow event-specific guidelines</strong> that will be shared at the venue</li>
                    <li><strong>Contact support</strong> if you have any questions about your registration</li>
                </ul>
            </div>

            <div class="registration-details">
                <h3>📞 Contact Information</h3>
                <p><strong>Email:</strong> Asymmetric@citchennai.net</p>
                <p><strong>Event Queries:</strong> Contact event coordinators at the venue</p>
                <p><strong>Registration Support:</strong> Show this email and your ID at registration desk</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for registering for Tech Fiesta 2025!</p>
            <p><strong>Chennai Institute of Technology</strong></p>
            <p>For any queries, contact us at <a href="mailto:Asymmetric@citchennai.net">Asymmetric@citchennai.net</a></p>
            <p>© 2025 Tech Fiesta - Chennai Institute of Technology</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Send registration confirmation email
const sendRegistrationConfirmationEmail = async (
  registrationData,
  events = [],
  workshops = []
) => {
  console.log(`📨 Starting registration confirmation email process`);
  console.log(`📧 Recipient: ${registrationData.userEmail}`);
  console.log(`🆔 Registration ID: ${registrationData.registrationId}`);
  console.log(
    `💰 Payment Amount: ₹${registrationData.paymentDetails?.amount || 0}`
  );

  try {
    const isResend = !!process.env.RESEND_API_KEY;
    let emailConfig = null;
    let transporter = null;

    if (isResend) {
      transporter = createTransporter();
    } else {
      emailConfig = getAvailableEmailConfig();
      if (!emailConfig.email || !emailConfig.password) {
        console.error("❌ No email configuration available");
        return { success: false, error: "Email service not configured" };
      }
      console.log(
        `🔧 Using Gmail config for sending: ${emailConfig.email.replace(
          /(.{3}).*(@.*)/,
          "$1***$2"
        )}`
      );
      transporter = createTransporter(emailConfig);
    }

    console.log(`📝 Generating email template...`);
    logEmailTemplateInfo(registrationData, events, workshops);
    const htmlContent = generateRegistrationEmailTemplate(
      registrationData,
      events,
      workshops
    );
    console.log(
      `✅ Email template generated successfully (${htmlContent.length} characters)`
    );

    const fromAddress = isResend
      ? (process.env.EMAIL_FROM || "Tech Fiesta Team <onboarding@resend.dev>")
      : `"${emailConfig.name}" <${emailConfig.email}>`;

    const mailOptions = {
      from: fromAddress,
      to: registrationData.userEmail,
      subject: `🎉 Tech Fiesta 2025 - Registration Confirmed (${registrationData.registrationId})`,
      html: htmlContent,
      text: `
Tech Fiesta 2025 - Registration Confirmed

Registration ID: ${registrationData.registrationId}
Email: ${registrationData.userEmail}
Amount Paid: ₹${registrationData.paymentDetails?.amount || 0}
Payment ID: ${
        registrationData.paymentDetails?.paymentId || "N/A (Free Registration)"
      }

Your registration has been confirmed successfully!
Please save this email for your records and bring it to events for verification.

For queries, contact: Asymmetric@citchennai.net
      `,
    };

    console.log(`📤 Sending email...`);
    console.log(`Mail options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
    });

    const info = await transporter.sendMail(mailOptions);

    if (!isResend) {
      // Increment usage counter
      emailConfig.currentUsage++;
      // Move to next email for the next send
      currentEmailIndex = (currentEmailIndex + 1) % emailConfigs.length;
      console.log(`📊 Email usage stats:`, {
        usedEmail: emailConfig.email.replace(/(.{3}).*(@.*)/, "$1***$2"),
        currentUsage: emailConfig.currentUsage,
        dailyLimit: emailConfig.dailyLimit,
        nextEmailIndex: currentEmailIndex,
      });
    }

    console.log(`✅ Registration email sent successfully!`);
    console.log(`📧 Sent to: ${registrationData.userEmail}`);
    console.log(`🆔 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      usedEmail: isResend ? "Resend SMTP" : emailConfig.email,
    };
  } catch (error) {
    console.error("❌ Error sending registration email:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    // If current email failed, try the next one
    if (error.code === "EAUTH" || error.code === "ELIMIT") {
      console.log("🔄 Trying next email configuration...");
      currentEmailIndex = (currentEmailIndex + 1) % emailConfigs.length;

      // Recursive retry with next email (only once to avoid infinite loop)
      if (currentEmailIndex !== 0) {
        console.log(
          `🔁 Retrying with next email config (index: ${currentEmailIndex})`
        );
        return await sendRegistrationConfirmationEmail(
          registrationData,
          events,
          workshops
        );
      }
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// Send general notification email
const sendNotificationEmail = async (to, subject, htmlContent, textContent) => {
  console.log(`📨 Starting notification email process`);
  console.log(`📧 Recipient: ${to}`);
  console.log(`📝 Subject: ${subject}`);

  try {
    const isResend = !!process.env.RESEND_API_KEY;
    let emailConfig = null;
    let transporter = null;

    if (isResend) {
      transporter = createTransporter();
    } else {
      emailConfig = getAvailableEmailConfig();
      if (!emailConfig.email || !emailConfig.password) {
        console.error("❌ No email configuration available");
        return { success: false, error: "Email service not configured" };
      }
      console.log(
        `🔧 Using Gmail config for notification: ${emailConfig.email.replace(
          /(.{3}).*(@.*)/,
          "$1***$2"
        )}`
      );
      transporter = createTransporter(emailConfig);
    }

    const fromAddress = isResend
      ? (process.env.EMAIL_FROM || "Tech Fiesta Team <onboarding@resend.dev>")
      : `"${emailConfig.name}" <${emailConfig.email}>`;

    const mailOptions = {
      from: fromAddress,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    console.log(`📤 Sending notification email...`);
    console.log(`Mail options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
    });

    const info = await transporter.sendMail(mailOptions);

    if (!isResend) {
      emailConfig.currentUsage++;
      currentEmailIndex = (currentEmailIndex + 1) % emailConfigs.length;
    }

    console.log(`✅ Notification email sent successfully!`);
    console.log(`📧 Sent to: ${to}`);
    console.log(`🆔 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      usedEmail: isResend ? "Resend SMTP" : emailConfig.email,
    };
  } catch (error) {
    console.error("❌ Error sending notification email:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// Test email connectivity
const testEmailConnectivity = async () => {
  console.log(`🧪 Testing email connectivity...`);
  const results = [];

  if (process.env.RESEND_API_KEY) {
    console.log(`🔍 Testing Resend SMTP configuration`);
    try {
      const transporter = createTransporter();
      await transporter.verify();
      console.log(`✅ Resend SMTP: Connection successful`);
      results.push({
        type: "resend",
        status: "success",
        message: "Connection verified with Resend SMTP",
      });
    } catch (error) {
      console.error(`❌ Resend SMTP: Connection failed -`, error.message);
      results.push({
        type: "resend",
        status: "failed",
        error: error.message,
        code: error.code,
      });
    }
    console.log(`🏁 Email connectivity test completed`);
    console.table(results);
    return results;
  }

  console.log(`🧪 Testing email connectivity for all Gmail configurations...`);
  for (let i = 0; i < emailConfigs.length; i++) {
    const config = emailConfigs[i];
    if (!config.email || !config.password) {
      continue;
    }
    console.log(
      `🔍 Testing email ${i + 1}: ${config.email.replace(
        /(.{3}).*(@.*)/,
        "$1***$2"
      )}`
    );

    try {
      const transporter = createTransporter(config);

      // Verify the connection
      await transporter.verify();

      console.log(`✅ Email ${i + 1}: Connection successful`);
      results.push({
        index: i + 1,
        email: config.email.replace(/(.{3}).*(@.*)/, "$1***$2"),
        status: "success",
        message: "Connection verified",
      });
    } catch (error) {
      console.error(`❌ Email ${i + 1}: Connection failed -`, error.message);
      results.push({
        index: i + 1,
        email: config.email.replace(/(.{3}).*(@.*)/, "$1***$2"),
        status: "failed",
        error: error.message,
        code: error.code,
      });
    }
  }

  console.log(`🏁 Email connectivity test completed`);
  console.table(results);

  return results;
};

// Log detailed email template information
const logEmailTemplateInfo = (registrationData, events, workshops) => {
  console.log(`📋 Email Template Information:`);
  console.log(`  Registration ID: ${registrationData.registrationId}`);
  console.log(`  User Email: ${registrationData.userEmail}`);
  console.log(
    `  User Name: ${
      registrationData.userDetails?.name ||
      registrationData.name ||
      "Not provided"
    }`
  );
  console.log(
    `  User College: ${
      registrationData.userDetails?.college ||
      registrationData.college ||
      "Not provided"
    }`
  );
  console.log(
    `  User Department: ${
      registrationData.userDetails?.department ||
      registrationData.department ||
      "Not provided"
    }`
  );
  console.log(
    `  User WhatsApp: ${
      registrationData.userDetails?.whatsapp ||
      registrationData.whatsapp ||
      "Not provided"
    }`
  );
  console.log(
    `  Is CIT Student: ${registrationData.userEmail?.endsWith(
      "@citchennai.net"
    )}`
  );
  console.log(
    `  Payment Amount: ₹${registrationData.paymentDetails?.amount || 0}`
  );
  console.log(
    `  Payment ID: ${registrationData.paymentDetails?.paymentId || "N/A"}`
  );
  console.log(`  Selected Pass: ${registrationData.selectedPass || "None"}`);
  console.log(
    `  Selected Events: ${registrationData.selectedEvents?.length || 0} events`
  );
  console.log(
    `  Selected Workshops: ${
      registrationData.selectedWorkshops?.length || 0
    } workshops`
  );
  console.log(
    `  Selected Non-Tech Events: ${
      registrationData.selectedNonTechEvents?.length || 0
    } events`
  );

  if (events?.length > 0) {
    console.log(`  Available Events: ${events.length}`);
    events.forEach((event) => {
      console.log(`    - ${event.title} (ID: ${event.id})`);
    });
  }

  if (workshops?.length > 0) {
    console.log(`  Available Workshops: ${workshops.length}`);
    workshops.forEach((workshop) => {
      console.log(`    - ${workshop.title} (ID: ${workshop.id})`);
    });
  }
};

// Send OD letter email with PDF attachment
const sendODLetterWithAttachment = async (to, subject, htmlContent, textContent, attachment) => {
  console.log(`📨 Starting OD letter email with attachment process`);
  console.log(`📧 Recipient: ${to}`);
  console.log(`📎 Attachment: ${attachment.filename}`);

  try {
    const isResend = !!process.env.RESEND_API_KEY;
    let emailConfig = null;
    let transporter = null;

    if (isResend) {
      transporter = createTransporter();
    } else {
      emailConfig = getAvailableEmailConfig();
      if (!emailConfig.email || !emailConfig.password) {
        console.error("❌ No email configuration available");
        return { success: false, error: "Email service not configured" };
      }
      console.log(
        `🔧 Using Gmail config for OD: ${emailConfig.email.replace(
          /(.{3}).*(@.*)/,
          "$1***$2"
        )}`
      );
      transporter = createTransporter(emailConfig);
    }

    const fromAddress = isResend
      ? (process.env.EMAIL_FROM || "Tech Fiesta Team <onboarding@resend.dev>")
      : `"${emailConfig.name}" <${emailConfig.email}>`;

    const mailOptions = {
      from: fromAddress,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        },
      ],
    };

    console.log(`📤 Sending OD letter email with PDF attachment...`);
    console.log(`Mail options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
      hasAttachment: !!mailOptions.attachments,
      attachmentSize: attachment.content ? attachment.content.length : 0,
    });

    const info = await transporter.sendMail(mailOptions);

    if (!isResend) {
      emailConfig.currentUsage++;
      currentEmailIndex = (currentEmailIndex + 1) % emailConfigs.length;
    }

    console.log(`✅ OD letter email with PDF sent successfully!`);
    console.log(`📧 Sent to: ${to}`);
    console.log(`🆔 Message ID: ${info.messageId}`);
    console.log(`📎 PDF attachment: ${attachment.filename} included`);

    return {
      success: true,
      messageId: info.messageId,
      usedEmail: isResend ? "Resend SMTP" : emailConfig.email,
    };
  } catch (error) {
    console.error("❌ Error sending OD letter email with attachment:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

module.exports = {
  sendRegistrationConfirmationEmail,
  sendNotificationEmail,
  getEmailServiceStatus,
  sendODLetterWithAttachment,
  resetUsageCounters,
  testEmailConnectivity,
  logEmailTemplateInfo,
};
