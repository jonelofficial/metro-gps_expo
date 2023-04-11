import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OfficeMapScreen from "../../../screens/trip/sg/OfficeMapScreen";
import TripFormScreen from "../../../screens/trip/sg/TripFormScreen";

const Stack = createNativeStackNavigator();

const TripNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OfficeTripForm" component={TripFormScreen} />
      <Stack.Screen name="OfficeMap" component={OfficeMapScreen} />
    </Stack.Navigator>
  );
};

export default TripNavigator;
