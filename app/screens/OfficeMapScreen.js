import React, { useEffect, useState } from "react";
import { Button, IconButton, Text, withTheme } from "react-native-paper";
import Screen from "../components/Screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { StyleSheet, TouchableOpacity, View } from "react-native";
import taskManager from "../config/taskManager";
import { getPathLength } from "geolib";
import { deleteFromTable, insertToTable, selectTable } from "../utility/sqlite";
import useLocations from "../hooks/useLocations";
import { useDispatch } from "react-redux";

const OfficeMapScreen = ({ route, theme }) => {
  const { colors } = theme;
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
      <View
        style={[
          styles.firstContainer,
          {
            borderColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.accent }]}>
          M E T R O{"   "}G P S
        </Text>
        <View>
          {location && <Text>Latitude: {location.coords.latitude}</Text>}
          {location && <Text>Longitude: {location.coords.longitude}</Text>}
        </View>
      </View>

      <View style={styles.secondContainer}>
        {/* TIMER */}
        <View
          style={[
            styles.timer,
            {
              borderColor: colors.primary,
            },
          ]}
        >
          <Text>Timer Here</Text>
        </View>

        {/* LEFT AND ARRIVED BUTTON */}
        <View style={styles.buttonWrapper}>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={{ backgroundColor: colors.danger }}
              labelStyle={styles.buttonLabelStyle}
              onPress={() => console.log("LEFT")}
            >
              Left
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={{ backgroundColor: colors.success }}
              labelStyle={styles.buttonLabelStyle}
              onPress={() => console.log("ARRVIED")}
            >
              Arrived
            </Button>
          </View>
        </View>

        {/* GAS BUTTON */}
        <View>
          <IconButton
            mode="contained"
            icon="gas-station"
            size={47}
            iconColor={colors.white}
            containerColor={colors.primary}
            style={{ borderRadius: 10 }}
            onPress={() => console.log("GAS")}
          />
        </View>

        {/* DONE BUTTON */}
        <View style={styles.doneButton}>
          <Button
            mode="contained"
            style={{ backgroundColor: colors.dark }}
            labelStyle={styles.buttonLabelStyle}
            onPress={() => console.log("DONE")}
          >
            Done
          </Button>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
  },
  secondContainer: {
    flex: 0.5,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  timer: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  buttonWrapper: {
    marginTop: 15,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: { width: "48%" },
  buttonLabelStyle: {
    fontSize: 18,
    lineHeight: 35,
  },
  doneButton: { position: "absolute", bottom: 0, left: 0, right: 0 },
});

export default withTheme(OfficeMapScreen);
