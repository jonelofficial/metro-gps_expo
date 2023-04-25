import React from "react";
import HaulingMap from "./map/HaulingMap";
import DeliveryMap from "./map/DeliveryMap";

const DepotMapScreen = ({ route, navigation }) => {
  const { trip_type } = route.params;

  if (trip_type === "hauling") {
    return <HaulingMap navigation={navigation} />;
  } else {
    return <DeliveryMap navigation={navigation} />;
  }
};

export default DepotMapScreen;
