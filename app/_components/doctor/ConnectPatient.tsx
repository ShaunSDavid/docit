import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
  arrayUnion,
} from "firebase/firestore";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type RootStackParamList = {
  DoctorDashboard: undefined;
  ConnectPatient: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "ConnectPatient">;

const ConnectPatient = () => {
  const navigation = useNavigation<NavigationProp>();
  const [patientEmail, setPatientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const searchPatient = async () => {
    if (!patientEmail || !patientEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", patientEmail.trim()));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert(
          "Patient Not Found",
          "No patient found with this email address."
        );
        setFoundPatient(null);
      } else {
        const patientDoc = querySnapshot.docs[0];
        const patientData = patientDoc.data();

        setFoundPatient({
          id: patientDoc.id,
          name: patientData.name || "Unknown",
          email: patientData.email,
        });
      }
    } catch (error: any) {
      console.error("Error searching for patient:", error);
      Alert.alert(
        "Error",
        "An error occurred while searching for the patient."
      );
    } finally {
      setLoading(false);
    }
  };

  const connectWithPatient = async () => {
    if (!foundPatient) return;

    setLoading(true);
    try {
      const db = getFirestore();
      const currentUser = FIREBASE_AUTH.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to connect with patients.");
        navigation.navigate("DoctorDashboard");
        return;
      }

      // Find the doctor's document
      const doctorsRef = collection(db, "doctors");
      const q = query(doctorsRef, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Doctor profile not found.");
        return;
      }

      const doctorDoc = querySnapshot.docs[0];

      // Update the doctor's connectedPatients array
      await updateDoc(doc(db, "doctors", doctorDoc.id), {
        connectedPatients: arrayUnion(foundPatient.id),
      });

      // Optional: Update the patient's document to add the doctor
      const patientDocRef = doc(db, "users", foundPatient.id);
      await updateDoc(patientDocRef, {
        connectedDoctors: arrayUnion(doctorDoc.id),
      });

      Alert.alert(
        "Success",
        `You are now connected with ${foundPatient.name}`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("DoctorDashboard"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error connecting with patient:", error);
      Alert.alert("Error", "Failed to connect with patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect with Patient</Text>
          <View style={styles.placeholderView} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.instructionText}>
            Enter the patient's email address to connect and view their health
            data.
          </Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Patient Email"
              value={patientEmail}
              onChangeText={setPatientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchPatient}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Found Patient Card */}
          {foundPatient && (
            <View style={styles.patientCardContainer}>
              <View style={styles.patientCard}>
                <View style={styles.avatarContainer}>
                  <FontAwesome name="user-circle" size={50} color="#0F6D66" />
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{foundPatient.name}</Text>
                  <Text style={styles.patientEmail}>{foundPatient.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.connectButton}
                onPress={connectWithPatient}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesome
                      name="link"
                      size={16}
                      color="#FFFFFF"
                      style={styles.connectIcon}
                    />
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#0F6D66",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholderView: {
    width: 30, // To balance the back button
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  instructionText: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  searchButton: {
    backgroundColor: "#0F6D66",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: -1,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  patientCardContainer: {
    alignItems: "center",
  },
  patientCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  patientEmail: {
    fontSize: 16,
    color: "#666666",
    marginTop: 5,
  },
  connectButton: {
    backgroundColor: "#0F6D66",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: "50%",
  },
  connectIcon: {
    marginRight: 8,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ConnectPatient;
