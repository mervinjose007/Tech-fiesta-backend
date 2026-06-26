const https = require("https");

const payload = JSON.stringify({
  name: "Production Test User",
  email: "test_prod@citchennai.net",
  whatsapp: "9876543210",
  college: "Chennai Institute of Technology",
  department: "CSE",
  year: "3rd",
  selectedEvents: [{ id: 1, title: "Paper Presentation" }],
  selectedWorkshops: [],
  selectedNonTechEvents: [],
  hasConsented: true
});

// We need an ID token, but let's see what happens if we send a request without a token first, or with an invalid token
// It should return 401 Unauthorized "Invalid token" or similar.
// But wait! We can also check if the server responds at all or returns 500.

const options = {
  hostname: "tech-fiesta-backend.onrender.com",
  port: 443,
  path: "/api/registration/submit",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length,
    "Authorization": "Bearer mock_invalid_token"
  }
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    console.log("Response Body:", data);
  });
});

req.on("error", (error) => {
  console.error("Request Error:", error);
});

req.write(payload);
req.end();
