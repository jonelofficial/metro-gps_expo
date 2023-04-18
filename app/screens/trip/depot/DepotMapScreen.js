import React from "react";
import HaulingMap from "./map/HaulingMap";
import DeliveryMap from "./map/DeliveryMap";

const DepotMapScreen = ({ route }) => {
  const { trip_type } = route.params;

  if (trip_type === "hauling") {
    return <HaulingMap />;
  } else {
    return <DeliveryMap />;
  }
};

export default DepotMapScreen;
