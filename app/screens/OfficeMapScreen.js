import React, { useEffect, useState } from "react";
import { Button, IconButton, Text, withTheme } from "react-native-paper";
import Screen from "../components/Screen";
import {
  Alert,
  AppState,
  BackHandler,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
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
import * as Notifications from "expo-notifications";
import {
  setColor,
  setMsg,
  setVisible,
} from "../redux-toolkit/counter/snackbarSlice";
import GasModal from "../components/map/GasModal";
import DoneModal from "../components/map/DoneModal";
import { useStopwatch } from "react-timer-hook";
import LoaderAnimation from "../components/loading/LoaderAnimation";
import SuccessAnimation from "../components/loading/SuccessAnimation";

const OfficeMapScreen = ({ theme, navigation }) => {
  const { colors } = theme;
  const user = useSelector((state) => state.token.userDetails);
  // TIMER
  const { seconds, minutes, hours, start, pause } = useStopwatch({
    autoStart: true,
  });

  // HOOKS AND CONFIG
  const { location, showMap } = taskManager();
  const { handleInterval, handleLeft, handleArrived } = useLocations();
  const net = useSelector((state) => state.net.value);

  // STATE
  const [totalKm, setTotalKm] = useState(0);
  const [estimatedOdo, setEstimatedOdo] = useState(0);
  const [trip, setTrip] = useState({ locations: [] });
  const [points, setPoints] = useState([]);

  // SUCCESS LOADER

  const {
    isOpen: showLoader,
    onClose: stopLoader,
    onToggle: startLoader,
  } = useDisclosure();

  // BUTTON LOADER

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

  // GAS DISCLOSURE

  const {
    isOpen: gasLoading,
    onClose: stopGasLoading,
    onToggle: startGasLoading,
  } = useDisclosure();

  const {
    isOpen: showGasModal,
    onClose: onCloseGasModal,
    onToggle: onToggleGasModal,
  } = useDisclosure();

  // DONE DISCLOSURE

  const {
    isOpen: doneLoading,
    onClose: stopDoneLoading,
    onToggle: startDoneLoading,
  } = useDisclosure();

  const {
    isOpen: showDoneModal,
    onClose: onCloseDoneModal,
    onToggle: onToggleDoneModal,
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

    // HANDLE APP STATE
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // HANDLE TRIP INTERVAL. 900000 = 15 minutes
    const loc = setInterval(() => {
      (async () => {
        const intervalRes = await handleInterval();
        const newObj = {
          ...intervalRes,
          date: moment(Date.now()).tz("Asia/Manila"),
        };

        reloadRoute(newObj);
      })();
    }, 900000);

    return async () => {
      await reloadRoute();
      deleteFromTable("route");
      clearInterval(loc);
      subscription.remove();
    };
  }, []);

  // PATH OR POINTS AND TOTAL KM USEEFFECT
  useEffect(() => {
    if (location) {
      (async () => {
        // INSERT POINTS OR PATH TO SQLITE
        if (location && location?.coords?.speed >= 1.4) {
          setPoints((currentValue) => [
            ...currentValue,
            {
              latitude: location?.coords?.latitude,
              longitude: location?.coords?.longitude,
            },
          ]);
          insertToTable("INSERT INTO route (points) values (?)", [
            JSON.stringify({
              latitude: location?.coords?.latitude,
              longitude: location?.coords?.longitude,
            }),
          ]);
        }

        // COMPUTE TOTAL KM
        const meter = getPathLength(points);
        const km = meter / 1000;
        setTotalKm(km.toFixed(1));
      })();
    }
    return () => {
      null;
    };
  }, [location]);

  // HANDLE BACK
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, [trip]);

  // HANDLE BACK
  const backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        text: "YES",
        onPress: async () => {
          if (trip?.locations.length % 2 !== 0 && !location) {
            await sqliteArrived();
            onToggleDoneModal();
          } else if (trip?.locations.length % 2 === 0 && !location) {
            onToggleDoneModal();
          } else {
            dispatch(setMsg(`Please finish the map loading`));
            dispatch(setVisible(true));
            dispatch(setColor("warning"));
          }
        },
      },
    ]);
    return true;
  };

  // APPSTATE HANDLE WHEN APP IS ON BACKGROUND
  const handleAppStateChange = async (nextAppState) => {
    let notif;
    if (nextAppState === "background") {
      const content = {
        title: `Fresh Morning ${
          user.first_name[0].toUpperCase() +
          user.first_name.substring(1).toLowerCase()
        } `,
        body: "You have an existing transaction. Please go back to the Metro app and finish it.",
      };

      notif = Notifications.scheduleNotificationAsync({
        content,
        trigger: { seconds: 1 },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync(notif);
    }
  };

  // FUNCTION

  const handleSuccess = () => {
    startLoader();

    setTimeout(() => {
      stopLoader();
    }, 2000);
  };

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
    let mapPoints = [];
    const routeRes = await selectTable("route");
    if (routeRes.length > 0) {
      mapPoints = [...routeRes.map((item) => JSON.parse(item.points))];
      setPoints(mapPoints);
      const meter = getPathLength(mapPoints);
      const km = meter / 1000;
      setTotalKm(km.toFixed(1));
    }

    const tripRes = await selectTable("offline_trip");

    let locPoint = JSON.parse(tripRes[tripRes.length - 1].locations);
    newObj && locPoint.push(newObj);

    await updateToTable(
      "UPDATE offline_trip SET points = (?) , locations = (?)  WHERE id = (SELECT MAX(id) FROM offline_trip)",
      [JSON.stringify(mapPoints), JSON.stringify(locPoint)]
    );

    const meter = mapPoints.length > 0 ? getPathLength(mapPoints) : 0;
    const km = meter / 1000;
    const odo = JSON.parse(tripRes[tripRes.length - 1].odometer);

    setEstimatedOdo(parseFloat(km.toFixed(1)) + parseFloat(odo));
  };

  // SQLITE FUNCTION

  const sqliteLeft = async () => {
    try {
      startLeftLoading();
      start(new Date());

      const leftRes = await handleLeft();
      const newObj = {
        ...leftRes,
        date: moment(Date.now()).tz("Asia/Manila"),
      };

      await reloadRoute(newObj);
      await reloadMapState();

      stopLefLoading();
      handleSuccess();
    } catch (error) {
      alert("ERROR SQLITE LEFT");
      console.log("ERROR SQLITE LEFT PROCESS: ", error);
    }
  };

  const sqliteArrived = async () => {
    try {
      startArrivedLoading();
      pause();

      const arrivedRes = await handleArrived();
      const newObj = {
        ...arrivedRes,
        date: moment(Date.now()).tz("Asia/Manila"),
      };

      await reloadRoute(newObj);
      await reloadMapState();

      stopArrivedLoading();
      handleSuccess();
    } catch (error) {
      alert("ERROR SQLITE ARRIVED");
      console.log("ERROR SQLITE ARRIVED PROCESS: ", error);
    }
  };

  const sqliteDone = async (vehicle_data) => {
    try {
      Keyboard.dismiss();
      startDoneLoading();

      const routeRes = await selectTable("route");
      const mapPoints = [...routeRes.map((item) => JSON.parse(item.points))];

      await updateToTable(
        "UPDATE offline_trip SET odometer_done = (?), points = (?)  WHERE id = (SELECT MAX(id) FROM offline_trip)",
        [vehicle_data.odometer_done, JSON.stringify(mapPoints)]
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
        form.append("locations", offlineTrip[0].locations);
        form.append("diesels", offlineTrip[0].gas);

        console.log(form);
      }

      stopDoneLoading();

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Dashboard",
            params: { screen: "DashboardStack" },
          },
        ],
      });
    } catch (error) {
      alert("ERROR DONE PROCESS");
      console.log("ERROR DONE PROCESS: ", error);
    }
  };

  const sqliteGas = async (data) => {
    try {
      Keyboard.dismiss();
      startGasLoading();

      const gasObj = {
        gas_station_id: data.gas_station_id,
        gas_station_name: data.gas_station_name,
        odometer: data.odometer,
        liter: data.liter,
        amount: data.amount,
        lat: location?.coords?.latitude,
        long: location?.coords?.longitude,
      };

      const tripRes = await selectTable("offline_trip");
      let gas = JSON.parse(tripRes[tripRes.length - 1].gas);
      gas.push(gasObj);

      await updateToTable(
        "UPDATE offline_trip SET gas = (?)WHERE id = (SELECT MAX(id) FROM offline_trip)",
        [JSON.stringify(gas)]
      );

      stopGasLoading();
      onCloseGasModal();
      handleSuccess();
    } catch (error) {
      alert("ERROR SQLTIE GAS PROCESS");
      console.log("ERROR SQLTIE GAS PROCESS: ", error);
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
    return <LoaderAnimation />;
  }
  return (
    <>
      {showLoader && <SuccessAnimation />}
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
            <Text>{`Trip Time: ${hours > 0 ? `${hours}:` : ""}${
              minutes < 10 ? `0${minutes}` : minutes >= 10 ? minutes : "00"
            }:${
              seconds < 10 ? `0${seconds}` : seconds >= 10 && seconds
            }`}</Text>
            <Text>{`  Total KM: ${totalKm || "0"}`}</Text>
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
                  (trip?.locations.length % 2 !== 0 &&
                    trip?.locations.length > 0)
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
                  (trip?.locations.length % 2 === 0 &&
                    trip?.locations.length > 0)
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
                arrivedLoading || leftLoading
                  ? colors.notActive
                  : colors.primary
              }
              style={{ borderRadius: 10 }}
              disabled={arrivedLoading || leftLoading}
              loading={true}
              onPress={onToggleGasModal}
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
                    : doneLoading
                    ? colors.notActive
                    : colors.dark,
              }}
              labelStyle={styles.buttonLabelStyle}
              disabled={
                (trip?.locations.length % 2 !== 0 &&
                  trip?.locations.length > 0) ||
                (trip?.locations.length === 0 && trip?.locations.length > 0) ||
                arrivedLoading ||
                leftLoading ||
                doneLoading
              }
              onPress={onToggleDoneModal}
            >
              Done
            </Button>
          </View>
        </View>
      </Screen>

      {/* DONE MODAL */}
      <DoneModal
        showDoneModal={showDoneModal}
        estimatedOdo={estimatedOdo}
        doneLoading={doneLoading}
        onCloseDoneModal={onCloseDoneModal}
        onSubmit={sqliteDone}
      />

      {/* GAS MODAL */}
      <GasModal
        showGasModal={showGasModal}
        gasLoading={gasLoading}
        onCloseGasModal={onCloseGasModal}
        onSubmit={sqliteGas}
      />
    </>
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
    justifyContent: "center",
    flexDirection: "row",
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
  container: {
    padding: 16,
  },
  label: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  picker: {
    padding: 0,
    margin: 0,
  },
});

export default withTheme(OfficeMapScreen);
