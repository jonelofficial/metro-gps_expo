import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../../../screens/dashboard/DashboardScreen";
import DashboardDepotScreen from "../../../screens/dashboard/DashboardDepotScreen";
import DashboardLiveScreen from "../../../screens/dashboard/DashboardLiveScreen";
import ScanScreen from "../../../screens/ScanScreen";
import { useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

const DashboardNavigator = () => {
  const user = useSelector((state) => state.token.userDetails);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DashboardStack"
        component={
          user?.trip_template === "Service Vehicle"
            ? DashboardScreen
            : user?.trip_template === "Depot"
            ? DashboardDepotScreen
            : DashboardLiveScreen
        }
      />
      <Stack.Screen
        name="DashboardStackScan"
        component={ScanScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
