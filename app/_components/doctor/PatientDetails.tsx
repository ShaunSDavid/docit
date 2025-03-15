import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type RootStackParamList = {
  DoctorDashboard: undefined;
  PatientDetails: { patientId: string };
};

type PatientDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "PatientDetails"
>;
type NavigationProp = StackNavigationProp<RootStackParamList, "PatientDetails">;

type HealthData = {
  heartRate?: string;
  bloodPressure?: string;
  bloodOxygen?: string;
  bloodGlucose?: string;
  updatedAt?: string;
};

const PatientDetails = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientDetailsScreenRouteProp>();
  const { patientId } = route.params;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<{
    id: string;
    name: string;
    email: string;
    age?: string;
    gender?: string;
    condition?: string;
    healthData?: HealthData;
  } | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const db = getFirestore();
        const patientDoc = await getDoc(doc(db, "users", patientId));

        if (patientDoc.exists()) {
          const data = patientDoc.data();
          setPatient({
            id: patientDoc.id,
            name: data.name || "Unknown",
            email: data.email || "No email",
            age: data.age || "N/A",
            gender: data.gender || "Not specified",
            condition: data.condition || "Not specified",
            healthData: data.healthData || {
              heartRate: "No data",
              bloodPressure: "No data",
              bloodOxygen: "No data",
              bloodGlucose: "No data",
              updatedAt: "Never",
            },
          });
        } else {
          Alert.alert("Error", "Patient not found");
          navigation.goBack();
        }
      } catch (error: any) {
        console.error("Error fetching patient details:", error);
        Alert.alert("Error", "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  const healthMetrics = [
    {
      id: 1,
      title: "Heart Rate",
      color: "#FF4B8C",
      data: patient?.healthData?.heartRate || "No data",
      icon: "❤️",
    },
    {
      id: 2,
      title: "Blood pressure",
      color: "#FFA726",
      data: patient?.healthData?.bloodPressure || "No data",
      icon: "💊",
    },
    {
      id: 3,
      title: "Blood oxygen",
      color: "#5677FC",
      data: patient?.healthData?.bloodOxygen || "No data",
      icon: "O₂",
    },
    {
      id: 4,
      title: "Blood Glucose",
      color: "#FF4B8C",
      data: patient?.healthData?.bloodGlucose || "No data",
      icon: "🩸",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={styles.placeholderView} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0F6D66" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Patient Info Card */}
          <View style={styles.patientInfoCard}>
            <View style={styles.avatarContainer}>
              <FontAwesome name="user-circle" size={80} color="#0F6D66" />
            </View>
            <Text style={styles.patientName}>{patient?.name}</Text>
            <Text style={styles.patientEmail}>{patient?.email}</Text>

            <View style={styles.divider} />

            <View style={styles.patientDetailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{patient?.age}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{patient?.gender}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{patient?.condition}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {patient?.healthData?.updatedAt || "Never"}
                </Text>
              </View>
            </View>
          </View>

          {/* Health Metrics Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>

            {healthMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { borderColor: metric.color },
                    ]}
                  >
                    <Text
                      style={[styles.metricIconText, { color: metric.color }]}
                    >
                      {metric.icon}
                    </Text>
                  </View>
                  <Text style={[styles.metricTitle, { color: metric.color }]}>
                    {metric.title}
                  </Text>
                </View>
                <View style={styles.metricDataContainer}>
                  <Text style={[styles.metricData, { color: metric.color }]}>
                    {metric.data}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome
                name="comment"
                size={20}
                color="#FFFFFF"
                style={styles.actionIcon}
              />
              <Text style={styles.actionButtonText}>Message Patient</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <FontAwesome
                name="file-text-o"
                size={20}
                color="#0F6D66"
                style={styles.actionIcon}
              />
              <Text style={styles.secondaryButtonText}>
                View Medical History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notes Section - Placeholder */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Doctor's Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesPlaceholder}>
                No notes have been added yet. Add notes during or after patient
                consultation.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  placeholderView: {
    width: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  patientInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    margin: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  patientName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  patientEmail: {
    fontSize: 16,
    color: "#777777",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    width: "100%",
    marginVertical: 15,
  },
  patientDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  detailItem: {
    width: "48%",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#888888",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginTop: 3,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metricIconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metricDataContainer: {
    alignItems: "flex-end",
  },
  metricData: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#0F6D66",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0F6D66",
  },
  actionIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#0F6D66",
    fontSize: 16,
    fontWeight: "bold",
  },
  notesContainer: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  notesCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
  },
  notesPlaceholder: {
    color: "#999999",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
});

export default PatientDetails;
