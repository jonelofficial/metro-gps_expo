import React, { useEffect, useState } from "react";
import { Button, IconButton, Text, withTheme } from "react-native-paper";
import Screen from "../components/Screen";

import { StyleSheet, View } from "react-native";
import taskManager from "../config/taskManager";
import { getPathLength } from "geolib";
import {
  deleteFromTable,
  insertToTable,
  selectTable,
  updateToTable,
} from "../utility/sqlite";
import useLocations from "../hooks/useLocations";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import useDisclosure from "../hooks/useDisclosure";

const OfficeMapScreen = ({ route, theme }) => {
  const { colors } = theme;
  // HOOKS AND CONFIG
  const { location, showMap } = taskManager();
  const { handleInterval, handleLeft, handleArrived } = useLocations();
  const net = useSelector((state) => state.net.value);

  // STATE
  const [totalKm, setTotalKm] = useState(0);
  const [trip, setTrip] = useState({ locations: [] });
  const [points, setPoints] = useState([]);

  useEffect(() => {
    console.log("haveINTERNET: ", net);
    console.log("TRIP FROM STATE", trip);
    (async () => {
      console.log("TRIP FROM SQLITE", await selectTable("offline_trip"));
    })();

    return () => {
      null;
    };
  }, [trip]);

  const {
    isOpen: leftLoading,
    onClose: stopLefLoading,
    onToggle: startLeftLoading,
  } = useDisclosure();

  const {
    isOpen: arrivedLoading,
    onClose: stopArrivedLoading,
    onToggle: startArrivedLoading,
  } = useDisclosure();

  const {
    isOpen: gasLoading,
    onClose: stopGasLoading,
    onToggle: startGasLoading,
  } = useDisclosure();

  const {
    isOpen: doneLoading,
    onClose: stopDoneLoading,
    onToggle: startDoneLoading,
  } = useDisclosure();

  // REDUX
  const dispatch = useDispatch();

  // FOR UNMOUNTING
  useEffect(() => {
    (async () => {
      if (trip?.locations?.length <= 0 || trip == undefined) {
        await reloadMapState();
      }
    })();

    return () => {
      deleteFromTable("route");
    };
  }, []);

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
        const meter = getPathLength(points);
        const km = meter / 1000;
        setTotalKm(km.toFixed(1));
      })();
    }
    return () => {
      null;
    };
  }, [location]);

  // FUNCTION

  const reloadMapState = async () => {
    const tripRes = await selectTable("offline_trip");
    const locPoint = JSON.parse(tripRes[tripRes.length - 1].locations);
    if (locPoint?.length > 0) {
      setTrip({
        locations: [
          ...locPoint
            .filter(
              (item) => item.status === "left" || item.status === "arrived"
            )
            .map((filterItem) => {
              return filterItem;
            }),
        ],
      });
    } else {
      await sqliteLeft();
    }
  };

  const reloadRoute = async (newObj) => {
    let mapPoints;
    const routeRes = await selectTable("route");
    if (routeRes.length > 0) {
      setPoints((prevState) => [
        ...prevState,
        ...routeRes.map((item) => {
          return JSON.parse(item.points);
        }),
      ]);

      mapPoints = [...routeRes.map((item) => JSON.parse(item.points))];
    }

    const tripRes = await selectTable("offline_trip");
    let locPoint = JSON.parse(tripRes[tripRes.length - 1].locations);
    locPoint.push(newObj);

    await updateToTable(
      "UPDATE offline_trip SET points = (?) , locations = (?)  WHERE id = (SELECT MAX(id) FROM offline_trip)",
      [JSON.stringify(mapPoints), JSON.stringify(locPoint)]
    );
  };

  // SQLITE FUNCTION

  const sqliteLeft = async () => {
    console.log("sqlite");
    try {
      startLeftLoading();
      // start(new Date());

      const leftRes = await handleLeft();
      const newObj = {
        ...leftRes,
        trip_id: trip._id,
        date: moment(Date.now()).tz("Asia/Manila"),
      };

      await reloadRoute(newObj);
      await reloadMapState();

      stopLefLoading();
    } catch (error) {
      alert("ERROR SQLITE LEFT");
      console.log("ERROR SQLITE LEFT PROCESS: ", error);
    }
  };

  const sqliteArrived = async () => {
    try {
      startArrivedLoading();
      // pause();

      const arrivedRes = await handleArrived();
      const newObj = {
        ...arrivedRes,
        trip_id: trip._id,
        date: moment(Date.now()).tz("Asia/Manila"),
      };

      await reloadRoute(newObj);
      await reloadMapState();

      stopArrivedLoading();
    } catch (error) {
      alert("ERROR SQLITE ARRIVED");
      console.log("ERROR SQLITE ARRIVED PROCESS: ", error);
    }
  };

  const sqliteDone = async (vehicle_data) => {
    try {
      Keyboard.dismiss();
      // setDoneLoading(true);
      // let mapPoints = [];

      // await routeRes.map((item) => {
      //   mapPoints.push(JSON.parse(item.points));
      // });

      const routeRes = await selectTable("route");
      const mapPoints = [...routeRes.map((item) => JSON.parse(item.points))];

      await updateToTable(
        "UPDATE offline_trip SET odometer_done = (?), points = (?)  WHERE id = (SELECT MAX(id) FROM offline_trip)",
        [JSON.stringify(vehicle_data.odometer_done), JSON.stringify(mapPoints)]
      );

      if (net) {
        const offlineTrip = await selectTable(
          "offline_trip WHERE id = (SELECT MAX(id) FROM offline_trip)"
        );

        const img = JSON.parse(offlineTrip[0].image);
        const form = new FormData();
        form.append("vehicle_id", offlineTrip[0].vehicle_id);
        form.append("odometer", JSON.parse(offlineTrip[0].odometer));
        form.append("odometer_done", JSON.parse(vehicle_data.odometer_done));
        img?.uri !== null && form.append("image", img);
        form.append("companion", offlineTrip[0].companion);
        form.append("points", JSON.stringify(mapPoints));
        form.append("others", offlineTrip[0].others);
        form.append("trip_date", JSON.parse(offlineTrip[0].date));

        console.log(form);

        // const tripRes = await createTrip(form, token);
        // if (tripRes?.data._id) {
        //   // const locations = await createBulkLocation(
        //   //   JSON.parse(offlineTrip[0].locations),
        //   //   tripRes.data._id,
        //   //   token
        //   // );
        //   // // console.log(locations);
        //   // const diesels = await gasCarBulk(
        //   //   JSON.parse(offlineTrip[0].gas),
        //   //   tripRes.data._id,
        //   //   token
        //   // );
        //   // // console.log(diesels);
        //   // if ((locations.tally === true) & (diesels.tally === true)) {
        //   //   await deleteFromTable(
        //   //     `offline_trip WHERE id = (SELECT MAX(id) FROM offline_trip)`
        //   //   );
        //   // } else {
        //   //   await deleteTrip(tripRes.data._id, token);
        //   //   alert(
        //   //     `Syncing ${
        //   //       !locations.tally ? "locations" : "diesels"
        //   //     } not match. Please try again`
        //   //   );
        //   // }
        // }
      }

      // doneReset();
      // setDoneLoading(false);
      // setUnfinishTrip(false);

      // navigation.reset({
      //   routes: [{ index: 0, name: routes.DASHBOARD }],
      // });
    } catch (error) {
      alert("ERROR DONE PROCESS");
      console.log("ERROR DONE PROCESS: ", error);
    }
  };

  if (!showMap) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Please allow locations to map and reload</Text>
      </View>
    );
  }

  if (!location || trip?.locations?.length < 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading locations.....</Text>
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
              style={{
                backgroundColor: leftLoading
                  ? colors.notActive
                  : trip?.locations?.length % 2 !== 0 &&
                    trip?.locations?.length > 0
                  ? colors.notActive
                  : colors.danger,
              }}
              labelStyle={styles.buttonLabelStyle}
              disabled={
                leftLoading ||
                arrivedLoading ||
                (trip?.locations.length % 2 !== 0 && trip?.locations.length > 0)
              }
              loading={leftLoading}
              onPress={sqliteLeft}
            >
              Left
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={{
                backgroundColor: leftLoading
                  ? colors.notActive
                  : trip?.locations?.length % 2 === 0 &&
                    trip?.locations?.length > 0
                  ? colors.notActive
                  : colors.success,
              }}
              labelStyle={styles.buttonLabelStyle}
              disabled={
                arrivedLoading ||
                leftLoading ||
                (trip?.locations.length % 2 === 0 && trip?.locations.length > 0)
              }
              loading={arrivedLoading}
              onPress={sqliteArrived}
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
            size={45}
            iconColor={colors.white}
            containerColor={
              arrivedLoading || leftLoading ? colors.notActive : colors.primary
            }
            style={{ borderRadius: 10 }}
            disabled={arrivedLoading || leftLoading}
            loading={true}
            onPress={() => console.log("gas")}
          />
        </View>

        {/* DONE BUTTON */}
        <View style={styles.doneButton}>
          <Button
            mode="contained"
            style={{
              backgroundColor:
                trip?.locations.length % 2 !== 0 && trip?.locations.length > 0
                  ? colors.notActive
                  : trip?.locations.length === 0 && trip?.locations.length > 0
                  ? colors.notActive
                  : leftLoading
                  ? colors.notActive
                  : arrivedLoading
                  ? colors.notActive
                  : colors.dark,
            }}
            labelStyle={styles.buttonLabelStyle}
            loading={doneLoading}
            disabled={
              (trip?.locations.length % 2 !== 0 &&
                trip?.locations.length > 0) ||
              (trip?.locations.length === 0 && trip?.locations.length > 0) ||
              arrivedLoading ||
              leftLoading
            }
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
