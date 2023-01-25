import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DashboardScreen from "../../screens/DashboardScreen";

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
    </Stack.Navigator>
  );
};

export default AppNavigator;
