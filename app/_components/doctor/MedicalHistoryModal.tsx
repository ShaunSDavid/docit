import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

type MedicalHistoryModalProps = {
  isVisible: boolean;
  onClose: () => void;
  patientEmail: string;
};

const MedicalHistoryModal = ({
  isVisible,
  onClose,
  patientEmail,
}: MedicalHistoryModalProps) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  // Keep track of whether we've tried to fetch data for this session
  const [hasFetched, setHasFetched] = useState(false);

  // Use this to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up the cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset fetched flag when modal closes
    if (!isVisible) {
      setHasFetched(false);
    }

    // Only fetch when modal is visible, we have a valid email, and haven't already fetched
    if (isVisible && patientEmail && patientEmail !== "" && !hasFetched) {
      console.log("Fetching medical history for:", patientEmail);
      fetchMedicalHistory();
      setHasFetched(true);
    }
  }, [isVisible, patientEmail, hasFetched]);

  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const db = getFirestore();

      // Create a query against the history collection
      const historyQuery = query(
        collection(db, "history"),
        where("patientEmail", "==", patientEmail)
        // Temporarily remove the orderBy to rule out index issues
        // orderBy("timestamp", "desc")
      );

      console.log("Executing history query for:", patientEmail);
      const querySnapshot = await getDocs(historyQuery);
      const items: any[] = [];

      querySnapshot.forEach((doc) => {
        console.log("History doc data:", doc.data());
        items.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Found ${items.length} history records`);

      // Only update state if the component is still mounted
      if (isMounted.current) {
        setHistoryData(items);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching medical history:", error);
      Alert.alert("Error", "Failed to load medical history records");
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Date not specified";

    // Handle Firestore timestamp object
    if (timestamp && typeof timestamp.toDate === "function") {
      try {
        return timestamp.toDate().toLocaleDateString();
      } catch (e) {
        console.error("Error formatting timestamp:", e);
        return "Invalid date";
      }
    }

    // Handle string dates
    if (typeof timestamp === "string") {
      return timestamp;
    }

    // Handle date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    return "Date format unknown";
  };

  // Force a render to show the actual state data
  const renderData = historyData.map((item) => ({
    ...item,
    // Make sure timestamp is properly handled for rendering
    formattedDate:
      item.date || (item.timestamp ? formatDate(item.timestamp) : "No date"),
  }));
  console.log("About to render with data:", renderData);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Medical History ({renderData.length} record)
          </Text>

          {/* Simple debug view */}
          {renderData.map((item) => (
            <View
              key={item.id}
              style={{
                padding: 10,
                marginVertical: 5,
                backgroundColor: "#f0f0f0",
                borderRadius: 5,
              }}
            >
              <Text style={styles.historyItemheader}>
                {item.doctor} {item.formattedDate}
              </Text>
              <Text style={styles.historyItemTitle}>Problem: {item.title}</Text>
              <Text style={styles.historyItemTitle}>
                Description: {item.description}
              </Text>
              <Text style={styles.historyItemTitle}>
                Presciption: {item.medication}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={onClose}
            style={{ alignSelf: "center", marginTop: 20, padding: 10 }}
          >
            <Text style={{ color: "#0F6D66", fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F6D66",
  },
  closeButton: {
    padding: 5,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  historyItemheader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F6D66",
  },

  historyItemTitle: {
    fontSize: 17,
  },
  loader: {
    marginVertical: 20,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#777777",
    fontStyle: "italic",
    padding: 20,
  },
});

export default MedicalHistoryModal;
