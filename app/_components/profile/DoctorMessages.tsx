import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type RootStackParamList = {
  DoctorMessages: undefined;
  ProfilePage: undefined;
};
type DoctorMessagesProps = {
  navigation: any;
};
const DoctorMessages = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    { id: string; timestamp: string; content?: string; from?: string }[]
  >([]);
  const auth = getAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const patientId = currentUser.email; // Use email as ID based on your Firestore structure
      const db = getFirestore();

      // Query the messages collection for messages sent to this patient
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("to", "==", patientId),
        where("toType", "==", "patient"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const messagesList: {
        id: string;
        timestamp: string;
        content?: string;
        from?: string;
      }[] = [];

      querySnapshot.forEach((doc) => {
        const msgData = doc.data();
        messagesList.push({
          id: doc.id,
          ...msgData,
          timestamp: msgData.timestamp
            ? new Date(msgData.timestamp.toDate()).toLocaleString()
            : "Unknown time",
        });

        // Mark the message as read if it wasn't already
        if (!msgData.read) {
          updateDoc(doc.ref, { read: true });
        }
      });

      setMessages(messagesList);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: { id: string; timestamp: string; content?: string; from?: string };
  }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <View style={styles.doctorInfo}>
          <FontAwesome
            name="user-md"
            size={24}
            color="#0F6D66"
            style={styles.doctorIcon}
          />
          <Text style={styles.fromText}>
            From: Dr. {item.from?.split("@")[0] ?? "Unknown"}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="inbox" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No messages from your doctor yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Messages</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchMessages}>
          <FontAwesome name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0F6D66" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  refreshButton: {
    padding: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorIcon: {
    marginRight: 8,
  },
  fromText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888888",
  },
  messageContent: {
    paddingVertical: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
    marginTop: 20,
    textAlign: "center",
  },
});

export default DoctorMessages;
