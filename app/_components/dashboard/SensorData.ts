import { getFirestore, doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH } from "@/FirebaseConfig";

// Determine if a person is in motion based on accelerometer and gyroscope data
const determineMotionState = (
  accelerometer: { x: number; y: number; z: number },
  gyroData: { x: number; y: number; z: number }
) => {
  // Calculate the magnitude of acceleration and angular velocity
  const accelMagnitude = Math.sqrt(
    accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
  );
  const gyroMagnitude = Math.sqrt(
    gyroData.x ** 2 + gyroData.y ** 2 + gyroData.z ** 2
  );

  // Define thresholds for motion detection
  const ACCEL_THRESHOLD = 0.8; // Adjust based on your sensor's sensitivity
  const GYRO_THRESHOLD = 100; // Adjust based on your sensor's sensitivity

  // Determine if the person is in motion
  if (accelMagnitude > ACCEL_THRESHOLD || gyroMagnitude > GYRO_THRESHOLD) {
    return "In Motion";
  } else {
    return "Stationary";
  }
};

// Format date to a simpler format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
      wsConnection = new WebSocket("ws://192.168.0.106:3000");
      
      wsConnection.onopen = () => {
        console.log("✅ Connected to WebSocket Server");
      };
      
      wsConnection.onmessage = async (event) => {
        if (!isActive) return;
        
        try {
          const data = JSON.parse(event.data);
          
          // Check if we have all the required sensor data
          if (data.gyroscope && data.accelerometer && data.pulseoximeter) {
            // Only update Firestore every 2 seconds
            const currentTime = Date.now();
            if (currentTime - lastUpdateTime > 2000) {
              lastUpdateTime = currentTime;
              
              const currentUser = FIREBASE_AUTH.currentUser;
              if (currentUser && currentUser.email) {
                const db = getFirestore();
                const userHealthDocRef = doc(db, "healthData", currentUser.email);
                
                // Get current timestamp
                const now = new Date();
                const simpleFormat = formatDate(now.toISOString());
                
                // Determine motion state
                const motionState = determineMotionState(data.accelerometer, data.gyroscope);
                
                // Get heart rate and SpO2 directly from pulse oximeter
                const heartRate = data.pulseoximeter.heartRate;
                const bloodOxygen = data.pulseoximeter.SpO2;
                
                // Update Firestore
                try {
                  await setDoc(
                    userHealthDocRef,
                    {
                      heartRate: `${heartRate} BPM`,
                      bloodOxygen: `${bloodOxygen}%`,
                      motionState: motionState,
                      lastUpdated: simpleFormat,
                      rawData: {
                        gyroscope: data.gyroscope,
                        accelerometer: data.accelerometer,
                        pulseoximeter: data.pulseoximeter
                      }
                    },
                    { merge: true }
                  );
                  
                  console.log(`✅ Health data updated in Firestore: HR=${heartRate}, SpO2=${bloodOxygen}, Motion=${motionState}`);
                } catch (error) {
                  console.error("❌ Error updating health data:", error);
                }
              } else {
                console.log("❌ No current user found or missing email");
              }
            }
          } else {
            console.log("⚠️ Incomplete sensor data received");
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