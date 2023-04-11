import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import TripDetailsScreen from "../../screens/TripDetailsScreen";
import DashboardNavigator from "./dashboard/DashboardNavigator";
import TripNavigator from "./trip/TripNavigator";
import { useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const user = useSelector((state) => state.token.userDetails);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="Office" component={TripNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
