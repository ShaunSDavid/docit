import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/FirebaseConfig"; // Import Firestore
import { doc, setDoc, getDoc } from "firebase/firestore";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ProfilePage: undefined;
  EditInfo: { from?: string };
  Dashboard: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "EditInfo">;
type RouteProps = {
  key: string;
  name: string;
  params?: { from?: string };
};

function EditInfo() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  // Get the source of navigation (default to 'register' if not specified)
  const navigatedFrom = route.params?.from || "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing user data if they're editing their profile
    const fetchUserData = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      try {
        const userRef = doc(FIREBASE_DB, "users", user.email!);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || "");
          setHeight(userData.height || "");
          setWeight(userData.weight || "");
          setAge(userData.age || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const createProfile = async () => {
    const user = FIREBASE_AUTH.currentUser;
    // If no user is authenticated, show an error
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const newEmail = user.email!.toLowerCase();
    setEmail(newEmail);

    try {
      await setDoc(doc(FIREBASE_DB, "users", user.email!), {
        name,
        email: user.email,
        phone,
        height,
        weight,
        age,
      });
      alert("Profile Saved Succesfully");
      if (navigatedFrom === "profile") {
        navigation.navigate("ProfilePage");
      } else {
        navigation.navigate("Dashboard");
      }
    } catch (error: any) {
      alert("Error saving Profile" + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Go back to the source screen
            if (navigatedFrom === "profile") {
              navigation.navigate("ProfilePage");
            } else {
              navigation.goBack();
            }
          }}
        >
          <FontAwesome
            name="chevron-left"
            size={25}
            onPress={() => navigation.navigate("ProfilePage")}
          ></FontAwesome>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 22 }}>Edit Info</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading profile data...</Text>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Text style={styles.label}>Name :</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter Name"
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Text style={styles.label}>E-mail :</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter Email"
              editable={false} // Email should not be editable (from auth)
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <View style={styles.phoneLabel}>
              <Text style={{ textAlign: "left", width: 55, marginLeft: 8 }}>
                Phone
              </Text>
              <Text style={{ textAlign: "left", width: 55, marginLeft: 8 }}>
                num :
              </Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="Enter phone no"
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Text style={styles.label}>Height :</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              style={styles.input}
              placeholder="Enter Height"
              keyboardType="numeric"
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Text style={styles.label}>Weight:</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
              placeholder="Enter Weight"
              keyboardType="numeric"
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Text style={styles.label}>Age :</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              style={styles.input}
              placeholder="Enter Age"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={createProfile}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default EditInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F5F1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 75,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  label: {
    textAlign: "left",
    padding: 10,
    width: 70,
    marginLeft: 8,
  },
  phoneLabel: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 15,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 30,
  },
  button: {
    backgroundColor: "#26C3A6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 150,
    alignSelf: "center",
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
