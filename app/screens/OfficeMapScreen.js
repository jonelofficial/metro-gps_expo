import React, { useEffect, useState } from "react";
import { Text } from "react-native-paper";
import Screen from "../components/Screen";

import { View } from "react-native";
import taskManager from "../config/taskManager";
import { getPathLength } from "geolib";
import { deleteFromTable, insertToTable, selectTable } from "../utility/sqlite";
import useLocations from "../hooks/useLocations";
import { useDispatch } from "react-redux";

const OfficeMapScreen = ({ route }) => {
  // STATE
  const [totalKm, setTotalKm] = useState(0);

  // REDUX
  const dispatch = useDispatch();

  // HOOKS AND CONFIG
  const { location, showMap } = taskManager();
  const { handleInterval, offlineHandleArrived, offlineHandleLeft } =
    useLocations();

  // PATH OR POINTS AND TOTAL KM USEEFFECT
  useEffect(() => {
    if (location) {
      (async () => {
        // INSERT POINTS OR PATH TO SQLITE
        if (location && location?.coords?.speed >= 1.4) {
          insertToTable("INSERT INTO route (points) values (?)", [
            JSON.stringify({
              latitude: location?.coords?.latitude,
              longitude: location?.coords?.longitude,
            }),
          ]);
        }

        // COMPUTE AUTO FILL TOTAL KM
        const routeRes = await selectTable("route");

        if (routeRes.length > 0) {
          const points = [
            ...routeRes.map((item) => {
              return JSON.parse(item.points);
            }),
          ];

          const meter = getPathLength(points);
          const km = meter / 1000;
          setTotalKm(km.toFixed(1));
        }
      })();
    }
    return () => {
      deleteFromTable("route");
    };
  }, [location]);

  if (!showMap) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Please allow locations to map and reload</Text>
      </View>
    );
  }
  return (
    <Screen>
      <Text>Office Map</Text>
      {location && <Text>Latitude: {location.coords.latitude}</Text>}
      {location && <Text>Longitude: {location.coords.longitude}</Text>}
    </Screen>
  );
};

export default OfficeMapScreen;
