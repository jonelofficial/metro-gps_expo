import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OfficeMapScreen from "../../screens/OfficeMapScreen";
import TripFormScreen from "../../screens/TripFormScreen";

const Stack = createNativeStackNavigator();

const OfficeNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="OfficeTripForm" component={TripFormScreen} />
    <Stack.Screen name="OfficeMap" component={OfficeMapScreen} />
  </Stack.Navigator>
);

export default OfficeNavigator;
