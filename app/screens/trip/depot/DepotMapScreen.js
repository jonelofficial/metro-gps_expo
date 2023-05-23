import React from "react";
import HaulingMap from "./map/HaulingMap";
import DeliveryMap from "./map/DeliveryMap";

const DepotMapScreen = ({ route, navigation }) => {
  const { trip_category } = route.params;

  if (trip_category.toLowerCase() === "hauling") {
    return <HaulingMap navigation={navigation} />;
  } else {
    return <DeliveryMap navigation={navigation} />;
  }
};

export default DepotMapScreen;
