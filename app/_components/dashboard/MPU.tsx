import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const SensorDataScreen = () => {
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        const ws = new WebSocket("ws://192.168.23.4:3000"); 

        ws.onopen = () => {
            console.log("✅ Connected to WebSocket Server");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.gyroscope) {
                    setGyroData(data.gyroscope); 
                }
            } catch (error) {
                console.error("❌ Error parsing WebSocket message:", error);
            }
        };

        ws.onclose = () => {
            console.log("❌ WebSocket Disconnected");
        };

        return () => {
            ws.close(); 
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Live Gyroscope Data</Text>
            <View style={styles.dataBox}>
                <Text style={styles.data}>X: {gyroData.x}</Text>
                <Text style={styles.data}>Y: {gyroData.y}</Text>
                <Text style={styles.data}>Z: {gyroData.z}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 20,
    },
    dataBox: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    data: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#00FF00",
        marginVertical: 5,
    },
});

export default SensorDataScreen;
