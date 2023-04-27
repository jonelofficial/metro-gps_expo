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
import {
  Alert,
  AppState,
  BackHandler,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { useStopwatch } from "react-timer-hook";
import useDisclosure from "../../../../hooks/useDisclosure";
import GasModal from "../../../../components/map/GasModal";
import useToast from "../../../../hooks/useToast";
import taskManager from "../../../../config/taskManager";
import LoaderAnimation from "../../../../components/loading/LoaderAnimation";
import useLocations from "../../../../hooks/useLocations";
import AutoSuccessAnimation from "../../../../components/loading/AutoSuccessAnimation";
import LeftModal from "../../../../components/modal/hauling/LeftModal";
import ArrivedModal from "../../../../components/modal/hauling/ArrivedModal";
import DoneModal from "../../../../components/map/DoneModal";
import { useDispatch, useSelector } from "react-redux";
import { getPathLength } from "geolib";
import * as Notifications from "expo-notifications";
import moment from "moment-timezone";
import { validatorStatus } from "../../../../redux-toolkit/counter/vaidatorSlice";
import { useCreateHaulingTripMutation } from "../../../../api/metroApi";

const HaulingMap = ({ theme, navigation }) => {
  const { colors } = theme;
  // STATE
  const [trip, setTrip] = useState({ locations: [] });
  const [totalKm, setTotalKm] = useState(0);
  const [estimatedOdo, setEstimatedOdo] = useState(0);
  const [points, setPoints] = useState([]);
  const [syncingTrip, setSyncingTrip] = useState(true);
  const [onBackground, setOnBackground] = useState(false);

  const dispatch = useDispatch();
  const [createTrip, { isLoading }] = useCreateHaulingTripMutation();

  // TOAST
  const { showAlert } = useToast();

  // LOCATION
  const { location, showMap, requestPremissions } = taskManager(
    (newObj) => reloadRoute(newObj),
    onBackground
  );

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
      await reloadMapState();
      await getRoute();
    })();

    // HANDLE APP STATE

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // HANDLE TRIP INTERVAL. 300000 = 5 minutes
    const loc = setInterval(() => {
      (async () => {
        const intervalRes = await handleInterval();
        if (intervalRes) {
          const newObj = {
            ...intervalRes,
            date: moment(Date.now()).tz("Asia/Manila"),
          };

          reloadRoute(newObj);
        }
      })();
    }, 600000);

    return async () => {
      clearInterval(loc);
      await updateRoute();
      deleteFromTable("route");
      subscription.remove();
    };
  }, []);

  // PATH OR POINTS AND TOTAL KM USEEFFECT
  useEffect(() => {
    if (location) {
      (async () => {
        if (location && !location?.coords?.speed <= 0 && !syncingTrip) {
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
    return true;
  };
  const handleAppStateChange = async (nextAppState) => {
    let notif;

    if (nextAppState === "background") {
      setOnBackground(true);
      const content = {
        title: `Fresh Morning ${
          user?.first_name[0].toUpperCase() +
          user?.first_name.substring(1).toLowerCase()
        }`,
        body: "You have an existing transaction. Please go back to the Metro app and finish it.",
      };

      notif = Notifications.scheduleNotificationAsync({
        content,
        trigger: { seconds: 1 },
      });
      reloadRoute();
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

    const tripRes = await selectTable("depot_hauling");

    if (newObj) {
      let locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);
      locPoint.push(newObj);

      await updateToTable(
        "UPDATE depot_hauling SET points = (?) , locations = (?) WHERE id = (SELECT MAX(id) FROM depot_hauling)",
        [JSON.stringify(mapPoints), JSON.stringify(locPoint)]
      );
    }

    const meter = mapPoints.length > 0 ? getPathLength(mapPoints) : 0;
    const km = meter / 1000;
    const odo = JSON.parse(tripRes[tripRes?.length - 1]?.odometer);

    setEstimatedOdo(parseFloat(km.toFixed(1)) + parseFloat(odo));
  };

  const updateRoute = async () => {
    const routeRes = await selectTable("route");

    const mapPoints = [
      ...(await routeRes?.map((item) => JSON.parse(item?.points))),
    ];

    await updateToTable(
      "UPDATE depot_hauling SET points = (?) WHERE id = (SELECT MAX(id) FROM depot_hauling)",
      [JSON.stringify(mapPoints)]
    );
  };

  const getRoute = async () => {
    setSyncingTrip(true);
    const tripRes = await selectTable("depot_hauling");
    const points = JSON.parse(tripRes[tripRes.length - 1]?.points);

    points?.length > 0 &&
      points?.map((point) => {
        setPoints((currentValue) => [
          ...currentValue,
          {
            latitude: point?.latitude,
            longitude: point?.longitude,
          },
        ]);

        insertToTable("INSERT INTO route (points) values (?)", [
          JSON.stringify({
            latitude: point?.latitude,
            longitude: point?.longitude,
          }),
        ]);
      });
    setSyncingTrip(false);
  };

  const reloadMapState = async () => {
    const tripRes = await selectTable("depot_hauling");

    const locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);

    const newLocations = locPoint.filter(
      (location) => location.status == "left" || location.status == "arrived"
    );

    newLocations?.length % 2 !== 0 && start(new Date());

    if (locPoint?.length > 0) {
      setTrip({
        locations: [...newLocations],
      });
    }
  };

  const handleLeftButton = async (data) => {
    try {
      Keyboard.dismiss();
      startLeftLoading();
      start(new Date());

      const leftRes = await Promise.race([
        handleLeft(location),
        new Promise((resolve, reject) =>
          setTimeout(() => {
            reject(new Error("Timeout"));
          }, 60000)
        ),
      ]);

      if (leftRes) {
        const newObj = {
          ...leftRes,
          date: moment(Date.now()).tz("Asia/Manila"),
        };

        await reloadRoute(newObj);
        await reloadMapState();

        const tripRes = await selectTable("depot_hauling");

        let tare_weight = JSON.parse(tripRes[tripRes.length - 1]?.tare_weight);

        let gross_weight = JSON.parse(
          tripRes[tripRes.length - 1]?.gross_weight
        );

        let net_weight = JSON.parse(tripRes[tripRes.length - 1]?.net_weight);

        let temperature = JSON.parse(tripRes[tripRes.length - 1]?.temperature);

        tare_weight.push(data?.tare_weight);
        gross_weight.push(data?.gross_weight);
        net_weight.push(data?.net_weight);
        temperature.push(data?.temperature);

        await updateToTable(
          `UPDATE depot_hauling SET 
          tare_weight = (?) , 
          gross_weight = (?) , 
          net_weight = (?) , 
          temperature = (?) 
          WHERE id = (SELECT MAX(id) FROM depot_hauling)`,
          [
            JSON.stringify(tare_weight),
            JSON.stringify(gross_weight),
            JSON.stringify(net_weight),
            JSON.stringify(temperature),
          ]
        );
      }

      stopLefLoading();
      onCloseLeftModal();
      startLoader();
    } catch (error) {
      stopLefLoading();
      console.log(error);
      showAlert(
        "Left not process. Please try again or reload app if still not processing",
        "danger"
      );
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
          }, 60000)
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
      console.log(error);
      showAlert(
        "Left not process. Please try again or reload app if still not processing",
        "danger"
      );
    }
  };

  const sqliteArrived = async (data) => {
    try {
      Keyboard.dismiss();
      startArrivedLoading();
      pause();

      const arrivedRes = await Promise.race([
        handleArrived(location),
        new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 6000)
        ),
      ]);

      if (arrivedRes) {
        onCloseArrivedModal();
        const newObj = {
          ...arrivedRes,
          date: moment(Date.now()).tz("Asia/Manila"),
        };

        await reloadRoute(newObj);
        await reloadMapState();

        const tripRes = await selectTable("depot_hauling");
        if (trip?.locations?.length <= 1) {
          let tare_weight = JSON.parse(
            tripRes[tripRes.length - 1]?.tare_weight
          );

          let temperature = JSON.parse(
            tripRes[tripRes.length - 1]?.temperature
          );

          tare_weight.push(data?.tare_weight);
          temperature.push(data?.temperature);

          await updateToTable(
            `UPDATE depot_hauling SET 
            tare_weight = (?) ,
            temperature = (?) 
            WHERE id = (SELECT MAX(id) FROM depot_hauling)`,
            [JSON.stringify(tare_weight), JSON.stringify(temperature)]
          );
        } else {
          let tare_weight = JSON.parse(
            tripRes[tripRes.length - 1]?.tare_weight
          );

          let gross_weight = JSON.parse(
            tripRes[tripRes.length - 1]?.gross_weight
          );

          let net_weight = JSON.parse(tripRes[tripRes.length - 1]?.net_weight);

          let temperature = JSON.parse(
            tripRes[tripRes.length - 1]?.temperature
          );

          tare_weight.push(data?.tare_weight);
          gross_weight.push(data?.gross_weight);
          net_weight.push(data?.net_weight);
          temperature.push(data?.temperature);

          await updateToTable(
            `UPDATE depot_hauling SET 
            tare_weight = (?) , 
            gross_weight = (?) , 
            net_weight = (?) , 
            doa_count = (?) , 
            temperature = (?) 
            WHERE id = (SELECT MAX(id) FROM depot_hauling)`,
            [
              JSON.stringify(tare_weight),
              JSON.stringify(gross_weight),
              JSON.stringify(net_weight),
              data?.doa_count,
              JSON.stringify(temperature),
            ]
          );
        }
      }

      stopArrivedLoading();
      onCloseArrivedModal();
      startLoader();
    } catch (error) {
      stopArrivedLoading();
      console.log(error);
      showAlert(
        "Arrived not process. Please try again or reload app if still not processing",
        "danger"
      );
    }
  };

  const handleGasSubmit = async (data) => {
    try {
      Keyboard.dismiss();
      startGasLoading();

      stopGasLoading();
      onCloseGasModal();
    } catch (error) {
      showAlert(`ERROR SQLTIE GAS PROCESS`, "danger");
    }
  };

  const sqliteDone = async (data) => {
    try {
      Keyboard.dismiss();
      startDoneLoading();

      const routeRes = await selectTable("route");
      const mapPoints = [...routeRes.map((item) => JSON.parse(item?.points))];

      await updateToTable(
        "UPDATE depot_hauling SET odometer_done = (?), points = (?)  WHERE id = (SELECT MAX(id) FROM depot_hauling)",
        [data.odometer_done, JSON.stringify(mapPoints)]
      );

      if (net) {
        const offlineTrip = await selectTable(
          "depot_hauling WHERE id = (SELECT MAX(id) FROM depot_hauling)"
        );

        const img = JSON.parse(offlineTrip[0]?.image);
        const form = new FormData();

        form.append("trip_date", JSON.parse(offlineTrip[0]?.date));
        form.append("trip_type", offlineTrip[0]?.trip_type);
        form.append("destination", offlineTrip[0]?.destination);
        form.append("farm", offlineTrip[0]?.farm);
        form.append("vehicle_id", offlineTrip[0]?.vehicle_id);
        form.append("locations", offlineTrip[0]?.locations);
        form.append("diesels", offlineTrip[0]?.gas);
        form.append("odometer", JSON.parse(offlineTrip[0]?.odometer));
        form.append("odometer_done", JSON.parse(data?.odometer_done));
        img?.uri !== null && form.append("image", img);
        form.append("others", offlineTrip[0].others);
        form.append("charging", offlineTrip[0].charging);
        form.append("companion", offlineTrip[0].companion);
        form.append("points", JSON.stringify(mapPoints));
        form.append("temperature", offlineTrip[0].temperature);
        form.append("tare_weight", offlineTrip[0].tare_weight);
        form.append("gross_weight", offlineTrip[0].gross_weight);
        form.append("net_weight", offlineTrip[0].net_weight);
        form.append("doa_count", offlineTrip[0].doa_count);

        const res = await createTrip(form);

        if (res?.data) {
          // Remove offline trip to sqlite database and state
          await deleteFromTable(
            `depot_hauling WHERE id = (SELECT MAX(id) FROM depot_hauling)`
          );
        } else {
          showAlert(res?.error?.error, "warning");
        }
      }

      dispatch(validatorStatus(true));
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
      console.log("ERROR DONE PROCESS: ", error);
    }
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
        : trip?.locations?.length > 3
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
        trip?.locations?.length < 4 && trip?.locations?.length > 0
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
            M E T R O {"  "} G P S {"  "} H A U L I N G
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
                    trip?.locations?.length > 0) ||
                  trip?.locations?.length > 3
                }
                loading={leftLoading}
                onPress={async () => {
                  if (trip?.locations?.length <= 0) {
                    await sqliteLeft();
                  } else {
                    onToggleLeftModal();
                  }
                }}
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
                onPress={onToggleArrivedModal}
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
          <View style={styles.doneContainer}>
            <Button
              mode="contained"
              style={styles.doneButton}
              labelStyle={styles.buttonLabelStyle}
              disabled={
                (trip?.locations?.length < 4 && trip?.locations?.length > 0) ||
                trip?.locations?.length === 0 ||
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

      {/* LEFT MODAL */}
      <LeftModal
        leftLoading={leftLoading}
        onCloseLeftModal={onCloseLeftModal}
        showLeftModal={showLeftModal}
        onSubmit={handleLeftButton}
      />

      {/* ARRIVED MODAL */}
      <ArrivedModal
        arrivedLoading={arrivedLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteArrived}
        trip={trip}
      />
    </>
  );
};

export default withTheme(HaulingMap);
