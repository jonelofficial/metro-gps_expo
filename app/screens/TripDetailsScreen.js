import React from "react";
import { Text } from "react-native-paper";
import Screen from "../components/Screen";

const TripDetailsScreen = ({ route }) => {
  const { item } = route.params;
  console.log(item);
  return (
    <Screen>
      <Text>Trip Details</Text>
    </Screen>
  );
};

export default TripDetailsScreen;
