import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  FirstAidList: undefined;
  FirstAid: { type: string };
  ProfilePage: undefined;
  EditInfo: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "FirstAid">;

function FirstAid({ route }: { route: any }) {
  const navigation = useNavigation<NavigationProp>();
  const { type } = route.params; // Get the type passed from the query parameter

  return (
    <View style={{ flex: 1 }}>
      {/* <View style={{ flex: 1, alignItems: 'center',marginTop:7 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{type}</Text>
        <Button title="Go Back" onPress={()=>router.back()}/>
      </View> */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 75,
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstAid", { type })}
        >
          <FontAwesome name="chevron-left" size={25} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
            marginHorizontal: 10,
          }}
        >
          {" "}
          {type}{" "}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate("ProfilePage")}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#0F6D66",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#0F6D66",
    borderWidth: 2,
  },
  signupButtonText: {
    color: "#0F6D66",
  },
});
export default FirstAid;
