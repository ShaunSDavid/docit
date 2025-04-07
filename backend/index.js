import express from "express";
import mqtt from "mqtt";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

let latestSensorData = {};

const config = {
  host: "bdc5f429a9c74af9909c380a0cc79e53.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "hivemq.webclient.1743499792537",
  password: "WTf8Ov9wn;.$Fg@7x0UC",
};

const mqttClient = mqtt.connect(config);

mqttClient.on("connect", () => {
  console.log("✅ Connected to HiveMQ Cloud MQTT Broker");
  mqttClient.subscribe("mpu6050/data", (err) => {
    if (err) {
      console.error("❌ Subscription error:", err);
    } else {
      console.log("📡 Subscribed to topic: mpu6050/data");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  try {
    latestSensorData = JSON.parse(message.toString());
    console.log("📩 Received MPU6050 Data:", latestSensorData);
    broadcastSensorData(latestSensorData);
  } catch (error) {
    console.error("❌ Error parsing MQTT message:", error);
  }
});

mqttClient.on("error", (err) =>
  console.error("❌ MQTT Connection Error:", err)
);
mqttClient.on("close", () => console.log("⚠️ MQTT Connection Closed"));

app.get("/", (req, res) => res.json(latestSensorData));

const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket Connection");
  ws.send(JSON.stringify({ message: "Connected to WebSocket Server" }));

  ws.on("close", () => {
    console.log("❌ WebSocket Connection Closed");
  });
});

function broadcastSensorData(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}
