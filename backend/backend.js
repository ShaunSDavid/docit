const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const express = require("express");
const client = require("twilio")(accountSid, authToken);
const axios = require("axios");
const ip = require("ip");

const app = express();
app.use(express.json());

// ✅ Call with dynamic message
app.post("/call", async (req, res) => {
  const message = req.body.message || "This is a default emergency message.";
  const twimlUrl = `https://resqdemo-6615.twil.io/dynamic-voice?message=${encodeURIComponent(message)}`;

  try {
    const call = await client.calls.create({
      url: twimlUrl,
      to: "+919943375656",
      from: "+19516217901",
    });
    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error("Call error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ SMS with editable message
app.post("/sms", async (req, res) => {
  const to = "+919943375656";
  const message = req.body.message || "This is a default SMS emergency message.";

  try {
    const sms = await client.messages.create({
      body: message,
      to,
      from: "+19516217901",
    });
    res.json({ success: true, sid: sms.sid });
  } catch (error) {
    console.error("SMS error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () =>
  console.log(`Server running at http://${ip.address()}:3000`)
);
