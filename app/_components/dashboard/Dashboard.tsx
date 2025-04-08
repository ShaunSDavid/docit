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
  Modal,
  FlatList,
  Alert,
} from "react-native";
const { width } = Dimensions.get("window");
import { Link, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  ProfilePage: undefined;
  EditInfo: undefined;
  Map: undefined;
  Chatbot: undefined;
  SOS: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Dashboard">;

interface ConnectionRequest {
  id: string;
  doctorName: string;
  doctorEmail: string;
  patientId: string;
  doctorId: string;
  status: string;
  createdAt: any;
}

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [isConnectionRequestModalVisible, setConnectionRequestModalVisible] =
    useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: "No data available",
    bloodPressure: "No data available",
    bloodOxygen: "No data available",
    bloodGlucose: "No data available",
  });

  useEffect(() => {
    const fetchHealthData = () => {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser || !currentUser.email) {
        console.log("No current user found");
        return;
      }

      const db = getFirestore();
      const healthDataRef = doc(db, "healthData", currentUser.email);

      const unsubscribe = onSnapshot(
        healthDataRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setHealthData({
              heartRate: data.heartRate || "No data available",
              bloodPressure: data.bloodPressure || "No data available",
              bloodOxygen: data.bloodOxygen || "No data available",
              bloodGlucose: data.bloodGlucose || "No data available",
            });
            console.log("Health data updated:", data);
          }
        },
        (error) => {
          console.error("Error fetching health data:", error);
        }
      );

      return unsubscribe;
    };
    const healthUnsubscribe = fetchHealthData();

    const fetchConnectionRequests = async () => {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        console.log("No current user found");
        return;
      }

      const db = getFirestore();
      const requestsRef = collection(db, "connectionRequests");

      // Debug: Log the current user's UID
      console.log("Current User UID:", currentUser.uid);

      const q = query(
        requestsRef,
        where("patientEmail", "==", currentUser.email)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("Snapshot size:", snapshot.size);

          const requests = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Connection Request Data:", data);
            return {
              id: doc.id,
              ...data,
            } as ConnectionRequest;
          });

          setConnectionRequests(requests);

          // Show modal if there are new requests
          if (requests.length > 0) {
            console.log("Connection requests found:", requests);
            setConnectionRequestModalVisible(true);
          }
        },
        (error) => {
          console.error("Error fetching connection requests:", error);
        }
      );

      return () => {
        if (healthUnsubscribe) {
          healthUnsubscribe();
        }
        unsubscribe();
      };
    };

    fetchConnectionRequests();
  }, []);

  const handleConnectionRequest = async (
    requestId: string,
    accept: boolean
  ) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const currentUser = FIREBASE_AUTH.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const requestDoc = doc(db, "connectionRequests", requestId);

      // Fetch the request document directly
      const requestSnapshot = await getDocs(
        query(
          collection(db, "connectionRequests"),
          where("__name__", "==", requestId)
        )
      );

      if (requestSnapshot.empty) {
        Alert.alert("Error", "Connection request not found.");
        return;
      }

      const requestData = requestSnapshot.docs[0].data();

      if (accept) {
        // Update patient's connected doctors
        const patientEmail = currentUser.email;
        if (!patientEmail) {
          Alert.alert("Error", "User email not found");
          return;
        }
        const patientDocRef = doc(db, "users", patientEmail);
        try {
          await updateDoc(patientDocRef, {
            connectedDoctors: arrayUnion(requestData.doctorId),
          });
        } catch (error) {
          console.error("Error updating patient document:", error);
          const usersRef = collection(db, "users");
          const patientQuery = query(
            usersRef,
            where("email", "==", patientEmail)
          );
          const patientSnapshot = await getDocs(patientQuery);

          if (patientSnapshot.empty) {
            Alert.alert("Error", "Patient document not found");
            return;
          }

          // Use the document ID found from the query
          const patientDocId = patientSnapshot.docs[0].id;
          const altPatientDocRef = doc(db, "users", patientDocId);

          await updateDoc(altPatientDocRef, {
            connectedDoctors: arrayUnion(requestData.doctorId),
          });
        }
        // await updateDoc(patientDocRef, {
        //   connectedDoctors: arrayUnion(requestData.doctorId),
        // });

        // Update doctor's connected patients
        const doctorDocRef = doc(db, "doctors", requestData.doctorId);
        await updateDoc(doctorDocRef, {
          connectedPatients: arrayUnion(currentUser.email),
        });

        Alert.alert(
          "Success",
          `You are now connected with Dr. ${requestData.doctorName}`
        );
      } else {
        Alert.alert(
          "Connection Declined",
          `You have declined the connection request from Dr. ${requestData.doctorName}`
        );
      }

      // Remove the connection request
      await deleteDoc(requestDoc);
    } catch (error) {
      console.error("Error handling connection request:", error);
      Alert.alert("Error", "Failed to process the connection request.");
    } finally {
      setLoading(false);
      setConnectionRequestModalVisible(false);
    }
  };

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

  const renderConnectionRequestModal = () => (
    <Modal
      visible={isConnectionRequestModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Connection Requests</Text>
          <FlatList
            data={connectionRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
                  <Text style={styles.doctorEmail}>{item.doctorEmail}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleConnectionRequest(item.id, true)}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleConnectionRequest(item.id, false)}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setConnectionRequestModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F6D66" barStyle="light-content" />

      {/* Connection Request Modal */}
      {renderConnectionRequestModal()}

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SOS")}
              style={styles.sosButton}
            >
              <MaterialIcons name="sos" size={20} color="white" />
            </TouchableOpacity>
            {connectionRequests.length > 0 && (
              <View style={styles.connectionBadgeContainer}>
                <TouchableOpacity
                  style={styles.connectionBadge}
                  onPress={() => setConnectionRequestModalVisible(true)}
                >
                  <Text style={styles.connectionBadgeText}>
                    {connectionRequests.length}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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

      {/* Bottom Navigation Bar */}
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosButton: {
    backgroundColor: "#FF3B30",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionBadgeContainer: {
    position: "relative",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
    marginRight: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  doctorEmail: {
    fontSize: 14,
    color: "#666",
  },
  requestActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: "#0F6D66",
  },
  declineButton: {
    backgroundColor: "#FF6B6B",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeModalButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#0F6D66",
    borderRadius: 5,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  connectionBadge: {
    backgroundColor: "red",
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 20,
    top: 40,
  },
  connectionBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default Dashboard;
