import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  DoctorProfile: undefined;
  EditProfile: { from?: string };
  DoctorDashboard: undefined;
  ConnectPatient: undefined;
  Appointments: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "DoctorProfile">;

const profileImg = require("@/assets/images/photo.jpeg"); // Using the same image for now

const DoctorProfile = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState<string | null>("Doctor");
  const [specialty, setSpecialty] = useState<string | null>("Specialist");
  const [connectedPatients, setConnectedPatients] = useState(0);
  const [fetching, setFetching] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const checkAndCreateDoctorProfile = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        navigation.replace("Login");
        return;
      }

      try {
        // First try to get from AsyncStorage for quick loading
        const cachedDoctorName = await AsyncStorage.getItem("doctorName");
        const cachedSpecialty = await AsyncStorage.getItem("doctorSpecialty");

        if (cachedDoctorName && cachedSpecialty) {
          setDoctorName(cachedDoctorName);
          setSpecialty(cachedSpecialty);
          // Still fetch from Firestore in background to update cache
          fetchDoctorDataInBackground(user.email);
        } else {
          // Check if doctor exists in Firestore
          const doctorsRef = collection(db, "doctors");
          const q = query(doctorsRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Doctor exists, get data
            const doctorData = querySnapshot.docs[0].data();
            setDoctorName(doctorData.name);
            setSpecialty(doctorData.specialty || "General");

            // Cache the data
            await AsyncStorage.setItem("doctorName", doctorData.name);
            await AsyncStorage.setItem(
              "doctorSpecialty",
              doctorData.specialty || "General"
            );

            // Count connected patients
            if (doctorData.connectedPatients) {
              setConnectedPatients(doctorData.connectedPatients.length);
            }
          } else {
            // Doctor doesn't exist, create initial profile
            await createInitialDoctorProfile(user.email!);
          }
        }
      } catch (error: any) {
        Alert.alert("Error", "Failed to load doctor profile: " + error.message);
      } finally {
        setFetching(false);
      }
    };

    checkAndCreateDoctorProfile();
  }, []);

  const fetchDoctorDataInBackground = async (email: string | null) => {
    if (!email) return;

    try {
      const doctorsRef = collection(db, "doctors");
      const q = query(doctorsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doctorData = querySnapshot.docs[0].data();

        // Update state if data has changed
        if (doctorData.name !== doctorName) {
          setDoctorName(doctorData.name);
          await AsyncStorage.setItem("doctorName", doctorData.name);
        }

        if (doctorData.specialty !== specialty) {
          setSpecialty(doctorData.specialty || "General");
          await AsyncStorage.setItem(
            "doctorSpecialty",
            doctorData.specialty || "General"
          );
        }

        // Update connected patients count
        if (doctorData.connectedPatients) {
          setConnectedPatients(doctorData.connectedPatients.length);
        }
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    }
  };

  const createInitialDoctorProfile = async (email: string) => {
    try {
      // Create a basic doctor profile
      const doctorData = {
        name: "New Doctor",
        specialty: "General",
        email: email,
        createdAt: new Date(),
        connectedPatients: [], // Array to store patient IDs/emails
      };

      // Find a unique ID for the doctor (using email as ID)
      const doctorRef = doc(db, "doctors", email);
      await setDoc(doctorRef, doctorData);

      // Update state and cache
      setDoctorName(doctorData.name);
      setSpecialty(doctorData.specialty);
      await AsyncStorage.setItem("doctorName", doctorData.name);
      await AsyncStorage.setItem("doctorSpecialty", doctorData.specialty);

      Alert.alert(
        "Welcome",
        "Your doctor profile has been created. Please update your professional information.",
        [
          {
            text: "Update Now",
            onPress: () =>
              navigation.navigate("EditProfile", { from: "initial" }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", "Failed to create doctor profile: " + error.message);
    }
  };

  const confirmLogout = () => {
    setModalVisible(false);
    FIREBASE_AUTH.signOut()
      .then(() => {
        AsyncStorage.clear();
        navigation.replace("Login");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to sign out: " + error.message);
      });
  };

  const cancelLogout = () => {
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E6F5F1" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 75,
          marginBottom: 10,
          paddingHorizontal: 30,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("DoctorDashboard")}
        >
          <FontAwesome name="chevron-left" size={25} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Doctor Profile</Text>
        <View style={{ width: 20 }} />
      </View>

      <View
        style={{
          alignItems: "center",
          paddingVertical: 40,
          backgroundColor: "#0F6D66",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <Image
          source={profileImg}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 20, color: "#fff", fontWeight: "600" }}>
          Dr. {doctorName}
        </Text>
        <Text style={{ fontSize: 16, color: "#E6F5F1", marginTop: 5 }}>
          {specialty}
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{connectedPatients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() =>
            navigation.navigate("EditProfile", { from: "profile" })
          }
        >
          <FontAwesome
            name="user-md"
            size={20}
            color="#0F6D66"
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 16, color: "#333" }}>
            Edit Professional Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("ConnectPatient")}
        >
          <FontAwesome
            name="user-plus"
            size={20}
            color="#0F6D66"
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 16, color: "#333" }}>
            Connect with Patients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("Appointments")}
        >
          <FontAwesome
            name="calendar"
            size={20}
            color="#0F6D66"
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 16, color: "#333" }}>
            Appointments Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#FF6B6B",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome
            name="sign-out"
            size={20}
            color="#fff"
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 16, color: "#fff", fontWeight: "500" }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("ConnectPatient")}
        >
          <FontAwesome name="users" size={24} color="#999999" />
          <Text style={styles.navText}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("DoctorDashboard")}
        >
          <FontAwesome name="home" size={24} color="#999999" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("DoctorProfile")}
        >
          <FontAwesome name="user-md" size={24} color="#0F6D66" />
          <Text style={styles.activeNavText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Confirm Logout
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Are you sure you want to logout?
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Pressable
                onPress={cancelLogout}
                style={{
                  flex: 1,
                  marginRight: 10,
                  paddingVertical: 10,
                  backgroundColor: "#26C3A6",
                  borderRadius: 5,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmLogout}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  paddingVertical: 10,
                  backgroundColor: "#FF6B6B",
                  borderRadius: 5,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DoctorProfile;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    height: 60,
    paddingBottom: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  statsContainer: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#E6F5F1",
    marginTop: 2,
  },
});
