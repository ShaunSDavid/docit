import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
const { width } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type RootStackParamList = {
  Home: undefined;
  DoctorDashboard: undefined;
  ConnectPatient: undefined;
  PatientDetails: { patientId: string };
  DoctorProfile: undefined;
};

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  "DoctorDashboard"
>;

type Patient = {
  id: string;
  name: string;
  email: string;
};

const DoctorDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorName, setDoctorName] = useState("");

  // Fetch connected patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const db = getFirestore();
        const currentUser = FIREBASE_AUTH.currentUser;

        if (!currentUser) {
          console.log("No current user found");
          setLoading(false);
          return;
        }

        console.log("Current user email:", currentUser.email);

        // Get the doctor document
        const doctorsRef = collection(db, "doctors");
        const doctorQuery = query(
          doctorsRef,
          where("email", "==", currentUser.email)
        );

        const doctorSnapshot = await getDocs(doctorQuery);

        if (doctorSnapshot.empty) {
          console.log("No doctor document found");
          setLoading(false);
          return;
        }

        const doctorDoc = doctorSnapshot.docs[0].data();
        setDoctorName(doctorDoc.name || "Doctor");

        // Get connected patients
        const connectedPatients = doctorDoc.connectedPatients || [];
        console.log("Connected patients:", connectedPatients);

        if (connectedPatients.length === 0) {
          console.log("No connected patients");
          setLoading(false);
          return;
        }

        // Fetch details for each patient email
        const patientsList: Patient[] = [];

        for (const patientEmail of connectedPatients) {
          // Query for user with this email
          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("email", "==", patientEmail));

          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            patientsList.push({
              id: userSnapshot.docs[0].id,
              name: userData.name || "Patient",
              email: patientEmail,
            });
          } else {
            // If user doc not found, still add with the email
            patientsList.push({
              id: patientEmail,
              name: "Patient",
              email: patientEmail,
            });
          }
        }

        console.log("Patients list:", patientsList);
        setPatients(patientsList);
      } catch (error: any) {
        console.error("Error fetching patients:", error);
        Alert.alert("Error", "Failed to load patient data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() =>
        navigation.navigate("PatientDetails", {
          patientId: item.email,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <FontAwesome name="user-circle" size={40} color="#0F6D66" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientEmail}>{item.email}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <FontAwesome name="angle-right" size={24} color="#999999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F6D66" barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {doctorName ? `Dr. ${doctorName}'s Dashboard` : "Doctor Dashboard"}
        </Text>
      </View>

      {/* Connect Button */}
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => navigation.navigate("ConnectPatient")}
      >
        <FontAwesome
          name="user-plus"
          size={18}
          color="#FFFFFF"
          style={styles.connectIcon}
        />
        <Text style={styles.connectButtonText}>Connect with Patient</Text>
      </TouchableOpacity>

      {/* Patient List */}
      <View style={styles.patientListContainer}>
        <Text style={styles.sectionTitle}>Your Patients</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0F6D66"
            style={styles.loader}
          />
        ) : patients.length > 0 ? (
          <FlatList
            data={patients}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id || item.email}
            contentContainerStyle={styles.patientList}
          />
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={60} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No patients connected yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect with patients to see them here
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("ConnectPatient")}
        >
          <FontAwesome name="users" size={24} color="#999999" />
          <Text style={styles.navText}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <FontAwesome name="home" size={24} color="#0F6D66" />
          <Text style={styles.activeNavText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("DoctorProfile")}
        >
          <FontAwesome name="user-md" size={24} color="#999999" />
          <Text style={styles.navText}>Profile</Text>
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
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6D66",
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
  },
  connectIcon: {
    marginRight: 8,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  patientListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333333",
  },
  patientList: {
    paddingBottom: 20,
  },
  patientCard: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  patientEmail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  arrowContainer: {
    justifyContent: "center",
    paddingLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888888",
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 8,
    textAlign: "center",
  },
  loader: {
    marginTop: 30,
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

export default DoctorDashboard;
