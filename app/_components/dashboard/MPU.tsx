// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";

// const SensorDataScreen = () => {
//   const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

//   useEffect(() => {
//     const ws = new WebSocket("ws://192.168.22.80:3000"); //192.168.23.4:3000

//     ws.onopen = () => {
//       console.log("✅ Connected to WebSocket Server");
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.gyroscope) {
//           setGyroData(data.gyroscope);
//         }
//       } catch (error) {
//         console.error("❌ Error parsing WebSocket message:", error);
//       }
//     };

//     ws.onclose = () => {
//       console.log("❌ WebSocket Disconnected");
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   // return (
//   //   <View style={styles.container}>
//   //     <Text style={styles.title}>Live Gyroscope Data</Text>
//   //     <View style={styles.dataBox}>
//   //       <Text style={styles.data}>X: {gyroData.x}</Text>
//   //       <Text style={styles.data}>Y: {gyroData.y}</Text>
//   //       <Text style={styles.data}>Z: {gyroData.z}</Text>
//   //     </View>
//   //   </View>
//   // );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#121212",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#ffffff",
//     marginBottom: 20,
//   },
//   dataBox: {
//     backgroundColor: "#1E1E1E",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   data: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#00FF00",
//     marginVertical: 5,
//   },
// });

// export default SensorDataScreen;

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH } from "@/FirebaseConfig";

const SensorDataScreen = () => {
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Calculate heart rate based on gyroscope data (simplified example)
  const calculateHeartRate = (gyroData: {
    x: number;
    y: number;
    z: number;
  }) => {
    // This is a placeholder - you would implement your actual algorithm here
    // For demo purposes, using gyro data magnitude to simulate heart rate
    const magnitude = Math.sqrt(
      gyroData.x ** 2 + gyroData.y ** 2 + gyroData.z ** 2
    );
    return Math.floor(60 + magnitude * 5); // Simple mapping to heart rate range
  };

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.22.80:3000");

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket Server");
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.gyroscope) {
          setGyroData(data.gyroscope);

          // Only update Firestore every 5 seconds to avoid excessive writes
          const currentTime = Date.now();
          if (currentTime - lastUpdateTime > 5000) {
            setLastUpdateTime(currentTime);

            const currentUser = FIREBASE_AUTH.currentUser;
            if (currentUser && currentUser.email) {
              const db = getFirestore();
              const userHealthDocRef = doc(db, "healthData", currentUser.email);

              // Calculate health metrics from sensor data
              const heartRate = calculateHeartRate(data.gyroscope);

              // Update health data in Firestore
              try {
                await setDoc(
                  userHealthDocRef,
                  {
                    heartRate: `${heartRate} BPM`,
                    bloodPressure: "120/80 mmHg", // Placeholder - would come from actual sensors
                    bloodOxygen: "98%", // Placeholder - would come from actual sensors
                    bloodGlucose: "100 mg/dL", // Placeholder - would come from actual sensors
                    lastUpdated: new Date().toISOString(),
                    rawGyroData: data.gyroscope,
                  },
                  { merge: true }
                );

                console.log("✅ Health data updated in Firestore");
              } catch (error) {
                console.error("❌ Error updating health data:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [lastUpdateTime]);

  return null; // No render needed since this is a background service
};

export default SensorDataScreen;
