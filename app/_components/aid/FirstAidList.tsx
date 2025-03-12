import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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

type NavigationProp = StackNavigationProp<RootStackParamList, "FirstAidList">;

function FirstAidList() {
  const navigation = useNavigation<NavigationProp>();

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Data for First Aid types
  const data = [
    "Cold/Flu",
    "Fever",
    "Cuts/Wounds",
    "Bruises",
    "Fractures",
    "Head Injuries",
  ];

  // Filtered data based on search query
  const filteredData = data.filter((type) =>
    type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
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
        <TouchableOpacity>
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
          First Aid List
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("ProfilePage")}>
          <FontAwesome name="user" size={25} color="black" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          margin: 20,
          padding: 8,
          flexDirection: "row",
          backgroundColor: "#333333",
          borderRadius: 20,
        }}
      >
        <FontAwesome color="white" name="search" size={20} />
        <View style={{ width: 10 }} />
        <TextInput
          style={{ padding: 0, flex: 1, color: "white", fontSize: 16 }}
          placeholder="Find a type"
          placeholderTextColor="white"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      <View style={{ marginLeft: 25, marginTop: 5, marginBottom: 10 }}>
        <Text style={{ fontSize: 21, fontWeight: "bold" }}>Common Types</Text>
      </View>

      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            margin: 10,
            marginLeft: 15,
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          {filteredData.map((type) => (
            <View style={{ flexDirection: "column", margin: 10 }} key={type}>
              <TouchableOpacity
                onPress={() => navigation.navigate("FirstAid", { type })}
              >
                <View
                  style={{
                    backgroundColor: "lightblue",
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                  }}
                ></View>
              </TouchableOpacity>
              <Text style={{ textAlign: "center" }}>{type}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default FirstAidList;
