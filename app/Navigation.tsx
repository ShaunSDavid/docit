import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./_components/login/HomeScreen";
import LoginScreen from "./_components/login/LoginScreen";
import RegisterScreen from "./_components/login/RegisterScreen";
import Dashboard from "./_components/dashboard/Dashboard";
import ProfilePage from "./_components/profile/ProfilePage";
import EditInfo from "./_components/profile/EditInfo";
import MapScreen from "./_components/location/MapScreen";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "@/FirebaseConfig";

const Stack = createStackNavigator();

const EntryNavigation = () => {
  // const [user, setUser] = useState<User | null>(null);
  // useEffect(() => {
  //   onAuthStateChanged(FIREBASE_AUTH, (user) => {
  //     setUser(user);
  //   });
  // }, []);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      <Stack.Screen name="EditInfo" component={EditInfo} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
};

export default EntryNavigation;
