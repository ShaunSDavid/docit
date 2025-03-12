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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FIREBASE_DB } from "@/FirebaseConfig"; // Import Firestore
import { doc, setDoc } from "firebase/firestore";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ProfilePage: undefined;
  EditInfo: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "EditInfo">;

function EditInfo() {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  const createProfile = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const newEmail = email.toLowerCase();
    setEmail(newEmail);

    try {
      await setDoc(doc(FIREBASE_DB, "users", email), {
        name,
        email,
        phone,
        height,
        weight,
        age,
      });
      alert("Profile Saved Succesfully");
      navigation.navigate("ProfilePage");
    } catch (error: any) {
      alert("Error saving Profile" + error.message);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <FontAwesome
            name="chevron-left"
            size={25}
            onPress={() => navigation.navigate("ProfilePage")}
          ></FontAwesome>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 22 }}>Edit Info</Text>
        <View style={{ width: 30 }} />
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <Text
          style={{ textAlign: "left", padding: 10, width: 70, marginLeft: 8 }}
        >
          Name :
        </Text>
        <TextInput
          onChangeText={(e) => setName(e)}
          style={styles.input}
          placeholder="Enter Name"
        ></TextInput>
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <Text
          style={{ textAlign: "left", padding: 10, width: 70, marginLeft: 8 }}
        >
          E-mail :
        </Text>
        <TextInput
          onChangeText={(e) => setEmail(e)}
          style={styles.input}
          placeholder="Enter Email"
        ></TextInput>
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginRight: 5,
            marginLeft: 10,
          }}
        >
          <Text style={{ textAlign: "left", width: 55, marginLeft: 8 }}>
            Phone
          </Text>
          <Text style={{ textAlign: "left", width: 55, marginLeft: 8 }}>
            num :
          </Text>
        </View>
        <TextInput
          onChangeText={(e) => setPhone(e)}
          style={styles.input}
          placeholder="Enter phone no"
        ></TextInput>
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <Text
          style={{ textAlign: "left", padding: 10, width: 70, marginLeft: 8 }}
        >
          Height :
        </Text>
        <TextInput
          onChangeText={(e) => setHeight(e)}
          style={styles.input}
          placeholder="Enter Height"
        ></TextInput>
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <Text
          style={{ textAlign: "center", padding: 10, width: 70, marginLeft: 8 }}
        >
          Weight:
        </Text>
        <TextInput
          onChangeText={(e) => setWeight(e)}
          style={styles.input}
          placeholder="Enter Weight"
        ></TextInput>
      </View>
      <View style={{ flexDirection: "row", marginTop: 15 }}>
        <Text
          style={{ textAlign: "center", padding: 10, width: 70, marginLeft: 8 }}
        >
          Age :
        </Text>
        <TextInput
          onChangeText={(e) => setAge(e)}
          style={styles.input}
          placeholder="Enter Age"
        ></TextInput>
      </View>

      <TouchableOpacity style={styles.button} onPress={createProfile}>
        <View>
          <Text>Save</Text>
        </View>
      </TouchableOpacity>
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
    height: 25,
    width: 60,
    alignSelf: "center",
    borderRadius: 20,
    marginTop: 30,
  },
});
