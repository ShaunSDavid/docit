import { getFirestore, doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH } from "@/FirebaseConfig";

// Calculate heart rate based on gyroscope data (simplified example)
const calculateHeartRate = (gyroData: { x: number; y: number; z: number }) => {
  // Using gyro data magnitude to simulate heart rate
  const magnitude = Math.sqrt(gyroData.x ** 2 + gyroData.y ** 2 + gyroData.z ** 2);
  return Math.floor(60 + magnitude * 5);
};

// This function starts collecting sensor data and updating Firestore
// It returns a cleanup function that can be called to stop the data collection
export const startSensorDataCollection = () => {
  console.log("🔄 Starting sensor data collection service...");
  
  let lastUpdateTime = Date.now();
  let isActive = true;
  let wsConnection: WebSocket | null = null;
  
  // Function to connect to the WebSocket server
  const connectWebSocket = () => {
    if (!isActive) return;
    
    try {
      wsConnection = new WebSocket("ws://192.168.22.100:3000");
      
      wsConnection.onopen = () => {
        console.log("✅ Connected to WebSocket Server");
      };
      
      wsConnection.onmessage = async (event) => {
        if (!isActive) return;
        
        try {
          const data = JSON.parse(event.data);
          if (data.gyroscope) {
            // Only update Firestore every 2 seconds
            const currentTime = Date.now();
            if (currentTime - lastUpdateTime > 2000) {
              lastUpdateTime = currentTime;
              
              const currentUser = FIREBASE_AUTH.currentUser;
              if (currentUser && currentUser.email) {
                const db = getFirestore();
                const userHealthDocRef = doc(db, "healthData", currentUser.email);
                
                // Calculate health metrics
                const heartRate = calculateHeartRate(data.gyroscope);
                
                // Update Firestore
                try {
                  await setDoc(
                    userHealthDocRef,
                    {
                      heartRate: `${heartRate} BPM`,
                      bloodPressure: "120/80 mmHg", // Placeholder
                      bloodOxygen: "98%", // Placeholder
                      bloodGlucose: "100 mg/dL", // Placeholder
                      lastUpdated: new Date().toISOString(),
                      rawGyroData: data.gyroscope,
                    },
                    { merge: true }
                  );
                  
                  console.log("✅ Health data updated in Firestore:", heartRate);
                } catch (error) {
                  console.error("❌ Error updating health data:", error);
                }
              } else {
                console.log("❌ No current user found or missing email");
              }
            }
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };
      
      wsConnection.onclose = () => {
        console.log("❌ WebSocket Disconnected");
        // Try to reconnect after a delay if still active
        if (isActive) {
          setTimeout(connectWebSocket, 5000);
        }
      };
      
      wsConnection.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        // Close the connection (will trigger onclose and reconnect)
        wsConnection?.close();
      };
    } catch (error) {
      console.error("❌ Error connecting to WebSocket:", error);
      // Try to reconnect after a delay if still active
      if (isActive) {
        setTimeout(connectWebSocket, 5000);
      }
    }
  };
  
  // Start the WebSocket connection
  connectWebSocket();
  
  // Return a cleanup function
  return () => {
    console.log("🛑 Stopping sensor data collection...");
    isActive = false;
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
  };
};