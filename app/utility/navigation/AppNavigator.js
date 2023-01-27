import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DashboardScreen from "../../screens/DashboardScreen";
import ScanScreen from "../../screens/ScanScreen";
import TripDetailsScreen from "../../screens/TripDetailsScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
