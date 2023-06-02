import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import TripDetailsScreen from "../../screens/trip/sg/TripDetailsScreen";
import DepotDetailsScreen from "../../screens/trip/depot/DepotDetailsScreen";
import LiveDetailsScreen from "../../screens/trip/live/LiveDetailsScreen";
import DashboardNavigator from "./dashboard/DashboardNavigator";
import TripNavigator from "./trip/TripNavigator";
import PrivacyPolicy from "../../screens/PrivacyPolicy";
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
      <Stack.Screen
        name="TripDetails"
        component={
          user?.trip_template === "Service Vehicle"
            ? TripDetailsScreen
            : user?.trip_template === "Depot"
            ? DepotDetailsScreen
            : LiveDetailsScreen
        }
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="Office" component={TripNavigator} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
