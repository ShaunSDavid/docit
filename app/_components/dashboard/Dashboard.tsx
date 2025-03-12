//
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
const { width } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
// Uncomment this when you have Firebase database set up
// import { getDatabase, ref, onValue } from "firebase/database";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  ProfilePage: undefined;
  EditInfo: undefined;
  Map: undefined;
  Chatbot: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Dashboard">;

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: "No data available",
    bloodPressure: "No data available",
    bloodOxygen: "No data available",
    bloodGlucose: "No data available",
  });

  // Effect for fetching data from Firebase
  useEffect(() => {
    // Uncomment and implement when Firebase is ready
    /*
    const db = getDatabase();
    const healthRef = ref(db, 'healthMetrics');
    
    const unsubscribe = onValue(healthRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHealthData({
          heartRate: data.heartRate || "No data available",
          bloodPressure: data.bloodPressure || "No data available",
          bloodOxygen: data.bloodOxygen || "No data available",
          bloodGlucose: data.bloodGlucose || "No data available",
        });
      }
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
    */
  }, []);

  const healthMetrics = [
    {
      id: 1,
      title: "Heart Rate",
      color: "#FF4B8C",
      data: healthData.heartRate,
      icon: "❤️",
    },
    {
      id: 2,
      title: "Blood pressure",
      color: "#FFA726",
      data: healthData.bloodPressure,
      icon: "💊",
    },
    {
      id: 3,
      title: "Blood oxygen",
      color: "#5677FC",
      data: healthData.bloodOxygen,
      icon: "O₂",
    },
    {
      id: 4,
      title: "Blood Glucose",
      color: "#FF4B8C",
      data: healthData.bloodGlucose,
      icon: "🩸",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F6D66" barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Health Metrics Cards */}
      <View style={styles.metricsContainer}>
        {healthMetrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View
                style={[styles.iconContainer, { borderColor: metric.color }]}
              >
                <Text style={[styles.metricIconText, { color: metric.color }]}>
                  {metric.icon}
                </Text>
              </View>
              <Text style={[styles.metricTitle, { color: metric.color }]}>
                {metric.title}
              </Text>
            </View>
            <View style={styles.metricDataContainer}>
              <Text style={[styles.metricData, { color: metric.color }]}>
                {metric.data}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Log Out Button */}
      <View style={styles.logoutContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0F6D66" />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              setLoading(true);
              try {
                await FIREBASE_AUTH.signOut();
                navigation.replace("Login");
              } catch (error: any) {
                alert("Logout failed: " + error.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Navigation Bar - Updated to match the image */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Chatbot")}
        >
          <FontAwesome name="comment-o" size={24} color="#999999" />
          <Text style={styles.navText}>Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          // Dashboard is already active, no navigation needed
        >
          <FontAwesome name="home" size={24} color="#0F6D66" />
          <Text style={styles.activeNavText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("ProfilePage")}
        >
          <FontAwesome name="user-o" size={24} color="#999999" />
          <Text style={styles.navText}>Mine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#0F6D66",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  metricsContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  metricCard: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  metricIconText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  metricDataContainer: {
    alignItems: "flex-end",
  },
  metricData: {
    fontSize: 16,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#0F6D66",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    height: 60,
    paddingBottom: 5,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 10,
  },
  navText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  activeNavText: {
    fontSize: 12,
    color: "#0F6D66",
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default Dashboard;
