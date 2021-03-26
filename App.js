import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Pedometer } from "expo-sensors";

export default function App() {
  const [pastStepCount, setPastStepCount] = useState(8340);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("Checking");

  const [stepGoal, setStepGoal] = useState(10000);
  const [goalPercent, setGoalPercent] = useState(0);
  const [goalReached, setGoalReached] = useState(false);

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    Pedometer.isAvailableAsync().then(
      (result) => {
        console.log("isAvailableAsyncResult:", result);
        setIsPedometerAvailable(String(result));
      },
      (error) => {
        console.log("isAvailableAsyncError:", error);
      }
    );

    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(endDate.getDate() - 1);

    Pedometer.getStepCountAsync(startDate, endDate).then(
      (result) => {
        console.log("getStepCountAsyncResult:", result);
        setPastStepCount(result.steps);
      },
      (error) => {
        console.log("getStepCountAsyncError:", error);
      }
    );

    // Sett lytter lytter
    const subscription = Pedometer.watchStepCount((result) => {
      console.log("Watch:", result);
      setCurrentStepCount(result.steps);
    });

    // Avslutt lytter
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    setGoalPercent((pastStepCount / stepGoal) * 100);
    pastStepCount >= stepGoal && setGoalReached(true);
  }, [pastStepCount, stepGoal]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          Alert.prompt("Username", "Set a new username", (input) =>
            setUserName(input)
          )
        }
      >
        <Text style={styles.username}>{userName}</Text>
      </TouchableOpacity>

      <Text style={styles.metadata}>
        {new Date(Date.now()).toLocaleDateString()}
      </Text>
      <Text style={styles.metadata}>Step count today</Text>
      <View
        style={[
          styles.dataContainer,
          { backgroundColor: goalReached ? "lime" : "#e0e0de" },
        ]}
      >
        <Text style={styles.count}>
          {pastStepCount} / {stepGoal}
        </Text>
      </View>
      <View
        style={{
          height: 20,
          width: "80%",
          backgroundColor: "#e0e0de",
          borderRadius: 50,
          margin: 50,
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: goalPercent >= 100 ? "100%" : `${goalPercent}%`,
            backgroundColor: goalPercent >= 100 ? "lime" : "darkgrey",
            position: "absolute",
            borderRadius: 50,
            textAlign: "right",
          }}
        >
          <Text>{Math.floor(goalPercent)}%</Text>
        </View>
      </View>
      <Button
        title="Set new goal"
        onPress={() =>
          Alert.prompt("New goal", "Set a new daily step goal", (input) =>
            setStepGoal(Number(input))
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dataContainer: {
    padding: 20,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  metadata: {
    margin: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
