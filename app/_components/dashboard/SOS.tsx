import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import Constants from "expo-constants";

export default function SOSButton() {
  const makeEmergencyCall = async () => {
    try {
      // @ts-ignore: debuggerHost exists only in Expo Go development mode
      const debuggerHost =
        Constants.manifest2?.extra?.expoClient?.hostUri ||
        Constants.manifest?.debuggerHost;
      const devIP = debuggerHost?.split(":")[0];

      if (!devIP) {
        throw new Error("Could not determine local IP address.");
      }

      const message =
        "Your patient might be in dire need of an emergency, Please respond immediately";
      const backendBaseURL = `http://${devIP}:3001`;

      // Trigger Call
      const callResponse = await fetch(`${backendBaseURL}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const callData = await callResponse.json();

      // Trigger SMS
      const smsResponse = await fetch(`${backendBaseURL}/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const smsData = await smsResponse.json();

      if (callData.success && smsData.success) {
        Alert.alert(
          "Emergency Triggered",
          `📞 Call SID: ${callData.callSid}\n📩 SMS SID: ${smsData.sid}`
        );
      } else {
        Alert.alert(
          "Error",
          `Call: ${callData.error || "OK"}\nSMS: ${smsData.error || "OK"}`
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Request Failed", error.message);
      } else {
        Alert.alert("Request Failed", "An unknown error occurred.");
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        onPress={makeEmergencyCall}
        style={{
          backgroundColor: "red",
          padding: 20,
          borderRadius: 50,
          width: 150,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          🚨 SOS
        </Text>
      </TouchableOpacity>
    </View>
  );
}
