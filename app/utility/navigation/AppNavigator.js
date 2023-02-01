import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import TripDetailsScreen from "../../screens/TripDetailsScreen";
import DashboardNavigator from "./DashboardNavigator";
import OfficeNavigator from "./OfficeNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="Office" component={OfficeNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
