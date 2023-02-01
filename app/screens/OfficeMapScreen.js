import React from "react";
import { Text } from "react-native-paper";
import Screen from "../components/Screen";
import { selectTable } from "../utility/sqlite";

const OfficeMapScreen = () => {
  (async () => {
    console.log(await selectTable("offline_trip"));
  })();
  return (
    <Screen>
      <Text>Office Map</Text>
    </Screen>
  );
};

export default OfficeMapScreen;
