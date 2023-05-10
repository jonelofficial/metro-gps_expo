import React from "react";
import { Button, IconButton, Text, withTheme } from "react-native-paper";
import Screen from "../../../../components/Screen";
import { useState } from "react";
import { useEffect } from "react";
import {
  deleteFromTable,
  insertToTable,
  selectTable,
  updateToTable,
} from "../../../../utility/sqlite";
import { Alert, Keyboard, StyleSheet, View } from "react-native";
import { useStopwatch } from "react-timer-hook";
import useDisclosure from "../../../../hooks/useDisclosure";
import { useDispatch, useSelector } from "react-redux";
import { useCreateDeliveryTripMutation } from "../../../../api/metroApi";
import useToast from "../../../../hooks/useToast";
import taskManager from "../../../../config/taskManager";
import useLocations from "../../../../hooks/useLocations";
import * as Notifications from "expo-notifications";
import { getPathLength } from "geolib";
import LoaderAnimation from "../../../../components/loading/LoaderAnimation";
import DoneModal from "../../../../components/map/DoneModal";
import GasModal from "../../../../components/map/GasModal";
import ArrivedDeliveryModal from "../../../../components/modal/delivery/ArrivedDeliveryModal";
import moment from "moment-timezone";
import AutoSuccessAnimation from "../../../../components/loading/AutoSuccessAnimation";

const DeliveryMap = ({ theme, navigation }) => {
  const { colors } = theme;
  // STATE
  const [trip, setTrip] = useState({ locations: [] });
  const [totalKm, setTotalKm] = useState(0);
  const [estimateOdo, setEstimateOdo] = useState(0);
  const [points, setPoints] = useState([]);
  const [syncingTrip, setSyncingTrip] = useState(true);
  const [onBackground, setOnBackground] = useState(false);

  const dispatch = useDispatch();
  const [createTrip, { isLoading }] = useCreateDeliveryTripMutation();

  // TOAST
  const { showAlert } = useToast();

  // LOCATION
  const { location, showMap, requestPremissions } = taskManager();

  const { handleArrived, handleInterval, handleLeft } = useLocations();

  // NET
  const net = useSelector((state) => state.net.value);

  // TIMER
  const { seconds, minutes, hours, start, pause } = useStopwatch({});

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
    isOpen: showLeftModal,
    onClose: onCloseLeftModal,
    onToggle: onToggleLeftModal,
  } = useDisclosure();

  const {
    isOpen: arrivedLoading,
    onClose: stopArrivedLoading,
    onToggle: startArrivedLoading,
  } = useDisclosure();

  const {
    isOpen: showArrivedModal,
    onClose: onCloseArrivedModal,
    onToggle: onToggleArrivedModal,
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

  // DONE MODAL

  const {
    isOpen: showDoneModal,
    onClose: onCloseDoneModal,
    onToggle: onToggleDoneModal,
  } = useDisclosure();

  // FOR UNMOUNTING

  useEffect(() => {
    (async () => {
      await deleteFromTable("route");
    })();

    return () => {};
  }, []);

  const backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      { text: "Cancel", onPress: null, style: "cancel" },
      {
        text: "YES",
        onPress: async () => {
          if (trip) {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Dashboard",
                  params: { screen: "DashboardStack" },
                },
              ],
            });
          } else {
            showAlert("Please finish the map loading", "warning");
          }
        },
      },
    ]);
  };

  const handleAppStateChange = async (nextAppState) => {
    let notif;

    if (nextAppState === "background") {
      setOnBackground(true);
      const conten = {
        title: `Fresh Mornig ${
          user?.first_name[0].toUpperCase() +
          user?.first_name.subString(1).toLowerCase()
        }`,
        body: "You have an existing transaction. Please go back to the Metro app and finish it.",
      };

      notif = Notifications.scheduleNotificationAsync({
        content,
        trigger: { seconds: 1 },
      });
    } else {
      setOnBackground(false);
      await Notifications.cancelAllScheduledNotificationsAsync(notif);
    }
  };

  const reloadRoute = async (newObj) => {
    let mapPoints = [];

    const routeRes = await selectTable("route");
    if (routeRes.length > 0) {
      mapPoints = [...routeRes.map((item) => JSON.parse(item?.points))];
      setPoints(mapPoints);

      const meter = getPathLength(mapPoints);
      const km = meter / 1000;
      setTotalKm(km.toFixed(1));
    }

    const tripRes = await selectTable("depot_delivery");
    if (newObj) {
      let locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);
      locPoint.push(newObj);

      await updateToTable(
        "UPDATE depot_delivery SET points = (?) , locations = (?) WHERE id = (SELECT MAX(id) FROM depot_delivery)",
        [JSON.stringify(mapPoints), JSON.stringify(locPoint)]
      );
    }

    const meter = mapPoints.length > 0 ? getPathLength(mapPoints) : 0;
    const km = meter / 1000;
    const odo = JSON.parse(tripRes[tripRes?.length - 1]?.odometer);
    setEstimateOdo(parseFloat(km.toFixed(1)) + parseFloat(odo));
  };

  const updateRoute = async () => {
    const routeRes = await selectTable("route");

    const mapPoints = [
      ...(await routeRes.map((item) => JSON.parse(item?.points))),
    ];

    await updateToTable(
      "UPDATE depot_delivery SET points = (?) WHERE id = (SELECT MAX(id) FROM depot_delivery)",
      [JSON.stringify(mapPoints)]
    );
  };

  const getRoute = async () => {
    setSyncingTrip(true);
    const tripRes = await selectTable("depot_delivery");
    const points = JSON.parse(tripRes[tripRes.length - 1]?.points);

    if (points?.length > 0) {
      points?.map((point) => {
        setPoints((currentValue) => [
          ...currentValue,
          { latitude: point?.latitude, longitude: point?.longitude },
        ]);
      });
      insertToTable("INSERT INTO route (points) values (?)", [
        JSON.stringify({
          latitude: point?.latitude,
          longitude: point?.longitude,
        }),
      ]);
    }
    setSyncingTrip(false);
  };

  const reloadMapState = async () => {
    const tripRes = await selectTable("depot_delivery");

    const locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);

    const newLocations = locPoint.filter(
      (location) => location.status == "left" || locations.status == "arrived"
    );

    newLocations?.length % 2 !== 0 && start(new Date());

    if (locPoint?.length > 0) {
      setTrip({
        locations: [...newLocations],
      });
    }
  };

  const sqliteLeft = async () => {
    try {
      Keyboard.dismiss();
      startLeftLoading();
      start(new Date());

      const leftRes = await Promise.race([
        handleLeft(location),
        new Promise((resolve, reject) =>
          setTimeout(() => {
            reject(new Error("Timeout"));
          }, 6000)
        ),
      ]);

      if (leftRes) {
        const newObj = {
          ...leftRes,
          date: moment(Date.now()).tz("Asia/Manila"),
        };

        await reloadRoute(newObj);
        await reloadMapState();
      }

      stopLefLoading();
      startLoader();
    } catch (error) {
      stopLefLoading();
      showAlert(
        "Left not process. Please try again or reload app if still not processing",
        "danger"
      );
    }
  };

  const sqliteArrived = async () => {};

  const handleGasSubmit = async () => {};

  const sqliteDone = async () => {};

  const styles = StyleSheet.create({
    firstContainer: {
      flex: 0.5,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 15,
      marginBottom: 15,
      borderWidth: 2,
      borderRadius: 10,
      borderColor: colors.primary,
    },
    //
    secondContainer: { flex: 0.5, marginHorizontal: 15, marginBottom: 15 },
    timer: {
      borderWidth: 2,
      borderRadius: 10,
      padding: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      borderColor: colors.primary,
    },
    buttonContainer: {
      marginTop: 15,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    buttonWrapper: {
      width: "48%",
    },
    buttonLabelStyle: {
      fontSize: 18,
      lineHeight: 35,
    },
    leftButton: {
      backgroundColor: leftLoading
        ? colors.notActive
        : trip?.locations?.length % 2 !== 0 && trip?.locations?.length > 0
        ? colors.notActive
        : colors.danger,
    },
    arrivedButton: {
      backgroundColor:
        arrivedLoading ||
        trip?.locations?.length % 2 === 0 ||
        trip?.locations?.length === 0
          ? colors.notActive
          : colors.success,
    },
    doneContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
    doneButton: {
      backgroundColor:
        trip?.locations?.length % 2 !== 0 && trip?.locations?.length > 0
          ? colors.notActive
          : trip?.locations?.length === 0
          ? colors.notActive
          : leftLoading
          ? colors.notActive
          : arrivedLoading
          ? colors.notActive
          : doneLoading
          ? colors.notActive
          : colors.dark,
    },
  });

  if (!showMap) {
    return (
      <View>
        <Text>Allow permission for locations</Text>
        <Button onPress={requestPremissions}>Request Permission</Button>
      </View>
    );
  }

  if (!location) {
    return <LoaderAnimation />;
  }

  return (
    <>
      <AutoSuccessAnimation loop={showLoader} stop={stopLoader} />
      <Screen>
        <View style={styles.firstContainer}>
          <Text>
            M E T R O {"  "} G P S {"  "} D E L I V E R Y
          </Text>
        </View>

        <View style={styles.secondContainer}>
          {/* TIMER */}
          <View style={styles.timer}>
            <Text>{`Trip Time: ${hours > 0 ? `${hours}:` : ""}${
              minutes < 10 ? `0${minutes}` : minutes >= 10 ? minutes : "00"
            }:${
              seconds < 10 ? `0${seconds}` : seconds >= 10 && seconds
            }`}</Text>
            <Text>{`  Total KM:  ${totalKm || "0"}`}</Text>
          </View>

          {/* LEFT AND ARRIVED BUTTON */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                mode="contained"
                style={styles.leftButton}
                labelStyle={styles.buttonLabelStyle}
                disabled={
                  leftLoading ||
                  arrivedLoading ||
                  (trip?.locations?.length % 2 !== 0 &&
                    trip?.locations?.length > 0)
                }
                loading={leftLoading}
                onPress={() => console.log("left")}
              >
                Left
              </Button>
            </View>

            <View style={styles.buttonWrapper}>
              <Button
                mode="contained"
                style={styles.arrivedButton}
                labelStyle={styles.buttonLabelStyle}
                disabled={
                  arrivedLoading ||
                  leftLoading ||
                  trip?.locations?.length % 2 === 0 ||
                  trip?.locations?.length === 0
                }
                loading={arrivedLoading}
                onPress={() => console.log("arrived")}
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
              onPress={() => console.log("gas")}
            />
          </View>

          {/* DONE BUTTON */}
          <View style={styles.doneContainer}>
            <Button
              mode="contained"
              style={styles.doneButton}
              labelStyle={styles.buttonLabelStyle}
              disabled={
                (trip?.locations?.length % 2 !== 0 &&
                  trip?.locations?.length > 0) ||
                trip?.locations?.length === 0 ||
                arrivedLoading ||
                leftLoading ||
                doneLoading
              }
              onPress={() => console.log("done")}
            >
              Done
            </Button>
          </View>
        </View>
      </Screen>

      {/* DONE MODAL */}
      <DoneModal
        showDoneModal={showDoneModal}
        estimatedOdo={estimateOdo}
        doneLoading={doneLoading || isLoading}
        onCloseDoneModal={onCloseDoneModal}
        onSubmit={sqliteDone}
      />

      {/* GAS MODAL */}
      <GasModal
        showGasModal={showGasModal}
        gasLoading={gasLoading}
        onCloseGasModal={onCloseGasModal}
        onSubmit={handleGasSubmit}
      />

      {/* ARRIVED MODAL */}
      <ArrivedDeliveryModal
        arrivedLoading={arrivedLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteArrived}
      />
    </>
  );
};

export default withTheme(DeliveryMap);
