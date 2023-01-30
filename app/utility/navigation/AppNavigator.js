import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DashboardScreen from "../../screens/DashboardScreen";
import ScanScreen from "../../screens/ScanScreen";
import TripDetailsScreen from "../../screens/TripDetailsScreen";
import TripFormScreen from "../../screens/TripFormScreen";
import DashboardNavigator from "./DashboardNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen name="TripForm" component={TripFormScreen} />
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
