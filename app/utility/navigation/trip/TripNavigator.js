import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OfficeMapScreen from "../../../screens/trip/sg/OfficeMapScreen";
import DepotMapScreen from "../../../screens/trip/depot/DepotMapScreen";
import LiveMapScreen from "../../../screens/trip/live/LiveMapScreen";

import TripFormScreen from "../../../screens/trip/sg/TripFormScreen";
import DepotTripFormScreen from "../../../screens/trip/depot/DepotTripFormScreen";
import LiveTripFormScreen from "../../../screens/trip/live/LiveTripFormScreen";
import { useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

const TripNavigator = () => {
  const user = useSelector((state) => state.token.userDetails);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="OfficeTripForm"
        component={
          user?.trip_template === "Service Vehicle"
            ? TripFormScreen
            : user?.trip_template === "Depot"
            ? DepotTripFormScreen
            : LiveTripFormScreen
        }
      />
      <Stack.Screen
        name="OfficeMap"
        component={
          user?.trip_template === "Service Vehicle"
            ? OfficeMapScreen
            : user?.trip_template === "Depot"
            ? DepotMapScreen
            : LiveMapScreen
        }
      />
    </Stack.Navigator>
  );
};

export default TripNavigator;
