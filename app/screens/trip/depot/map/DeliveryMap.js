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
import { validatorStatus } from "../../../../redux-toolkit/counter/vaidatorSlice";
import { setDepotTripCateogry } from "../../../../redux-toolkit/counter/depotTripCategorySlice";
import DestinationModal from "../../../../components/modal/DestinationModal";

const DeliveryMap = ({ theme, navigation }) => {
  const { colors } = theme;
  // STATE
  const [trip, setTrip] = useState({ locations: [] });
  // const [totalKm, setTotalKm] = useState(0);
  const [estimateOdo, setEstimateOdo] = useState(0);
  const [points, setPoints] = useState([]);
  const [syncingTrip, setSyncingTrip] = useState(true);
  const [onBackground, setOnBackground] = useState(false);
  const [doneDelivery, setDoneDelivery] = useState(false);
  const [lastLeft, setLastLeft] = useState(false);
  const [currentOdo, setCurrentOdo] = useState(0);

  const dispatch = useDispatch();
  const [createTrip, { isLoading }] = useCreateDeliveryTripMutation();

  // TOAST
  const { showAlert } = useToast();

  // LOCATION
  // const {
  //   location = { coords: { latitude: 0, longitude: 0 } },
  //   showMap,
  //   requestPremissions,
  // } = taskManager((newObj) => reloadRoute(newObj), onBackground);

  // const { handleArrived, handleInterval, handleLeft } = useLocations();

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

  // LAST DELIVERY
  const {
    isOpen: lastDelivery,
    onClose: onCloseLastDelivery,
    onToggle: onToggleLastDelivery,
  } = useDisclosure();

  const {
    isOpen: isOpenDestination,
    onClose: onCloseDestination,
    onToggle: onToggleDestination,
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

    // // HANDLE TRIP INTERVAL
    // const loc = setInterval(() => {
    //   (async () => {
    //     const intervalRes = await handleInterval();
    //     if (intervalRes) {
    //       const newObj = {
    //         ...intervalRes,
    //         date: moment(Date.now()).tz("Asia/Manila"),
    //       };

    //       reloadRoute();
    //     }
    //   })();
    // }, 600000);

    return async () => {
      clearInterval(loc);
      await updateRoute();
      deleteFromTable("route");
      subscription.remove();
    };
  }, []);

  // // PATH OR POINTS AND TOTAL KM
  // useEffect(() => {
  //   (async () => {
  //     if (location && !location?.coords?.speed <= 0 && !syncingTrip) {
  //       setPoints((currentValue) => [
  //         ...currentValue,
  //         {
  //           latitude: location?.coords?.latitude,
  //           longitude: location?.coords?.longitude,
  //         },

  //         insertToTable("INSERT INTO route (points) values (?)", [
  //           JSON.stringify({
  //             latitude: location?.coords?.latitude,
  //             longitude: location?.coords?.longitude,
  //           }),
  //         ]),
  //       ]);
  //     }

  //     // COMPUTE TOTAL KM
  //     const meter = getPathLength(points);
  //     const km = meter / 1000;
  //     // setTotalKm(km.toFixed(1));
  //   })();
  //   return () => {
  //     null;
  //   };
  // }, [location]);

  // HANDLE BACK
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, [trip]);

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
      // setTotalKm(km.toFixed(1));
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

    setCurrentOdo(tripRes[tripRes.length - 1].odometer);

    const locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);

    setDoneDelivery(JSON.parse(tripRes[tripRes.length - 1]?.last_store));
    setLastLeft(JSON.parse(tripRes[tripRes.length - 1]?.last_left));

    const newLocations = locPoint.filter(
      (location) => location.status == "left" || location.status == "arrived"
    );

    newLocations?.length % 2 !== 0 && start(new Date());

    if (locPoint?.length > 0) {
      setTrip({
        locations: [...newLocations],
      });

      if (locPoint?.length % 2 == 0 && locPoint?.length > 1) {
        setCurrentOdo(locPoint[locPoint.length - 1]?.odometer);
      } else if (locPoint?.length % 2 != 0 && locPoint?.length > 1) {
        setCurrentOdo(locPoint[locPoint.length - 2]?.odometer);
      }
    }
  };
  const [lastDestination, setLastDestination] = useState("");
  const sqliteLeft = async (data) => {
    try {
      Keyboard.dismiss();
      startLeftLoading();
      start(new Date());

      console.log("running");

      // const leftRes = await Promise.race([
      //   handleLeft(location),
      //   new Promise((resolve, reject) =>
      //     setTimeout(() => {
      //       reject(new Error("Timeout"));
      //     }, 6000)
      //   ),
      // ]);

      const leftRes = {
        lat: 0,
        long: 0,
        address: [
          {
            postalCode: null,
            country: "Philippines",
            isoCountryCode: "PH",
            subregion: "No Location",
            city: null,
            street: null,
            district: null,
            name: "No Location",
            streetNumber: null,
            region: "No Location",
            timezone: null,
          },
        ],
        status: "left",
      };

      if (leftRes) {
        const newObj = {
          ...leftRes,
          date: moment(Date.now()).tz("Asia/Manila"),
          destination:
            data?.destination === "OTHER LOCATION"
              ? data.destination_name
              : data?.destination || lastDestination,
        };

        // if (doneDelivery) {
        //   await updateToTable(
        //     "UPDATE depot_delivery SET last_left = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
        //     [JSON.stringify(doneDelivery)]
        //   );
        // }

        const delivery = await selectTable(
          "depot_delivery WHERE id = (SELECT MAX(id) FROM depot_delivery)"
        );

        const cratesTransaction = JSON.parse(
          delivery[delivery.length - 1].crates_transaction
        );

        if (!cratesTransaction && !doneDelivery) {
          const newCratesTransaction = [data];
          await updateToTable(
            "UPDATE depot_delivery SET crates_transaction = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
            [JSON.stringify(newCratesTransaction)]
          );
        } else if (!doneDelivery && !lastDelivery) {
          cratesTransaction.push(data);

          await updateToTable(
            "UPDATE depot_delivery SET crates_transaction = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
            [JSON.stringify(cratesTransaction)]
          );
        }

        if (cratesTransaction && lastDelivery) {
          cratesTransaction.push(data);
          await updateToTable(
            "UPDATE depot_delivery SET last_store = (?), crates_transaction = (?), last_left = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
            [
              JSON.stringify(lastDelivery),
              JSON.stringify(cratesTransaction),
              JSON.stringify(doneDelivery),
            ]
          );
        } else if (!cratesTransaction && lastDelivery) {
          const newCratesTransaction = [data];
          await updateToTable(
            "UPDATE depot_delivery SET last_store = (?), crates_transaction = (?), last_left = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
            [
              JSON.stringify(lastDelivery),
              JSON.stringify(newCratesTransaction),
              JSON.stringify(doneDelivery),
            ]
          );
        }

        await reloadRoute(newObj);
        await reloadMapState();
      }
      onCloseDestination();
      stopLefLoading();
      onCloseArrivedModal();
      startLoader();
    } catch (error) {
      console.log("SQLITE LEFT: ", error);
      stopLefLoading();
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

      // const arrivedRes = await Promise.race([
      //   handleArrived(location),
      //   new Promise((resolve, reject) =>
      //     setTimeout(() => reject(new Error("Timeout")), 6000)
      //   ),
      // ]);

      const arrivedRes = {
        lat: 0,
        long: 0,
        address: [
          {
            postalCode: null,
            country: "Philippines",
            isoCountryCode: "PH",
            subregion: "No Location",
            city: null,
            street: null,
            district: null,
            name: "No Location",
            streetNumber: null,
            region: "No Location",
            timezone: null,
          },
        ],
        odometer: data.arrivedOdo,
        status: "arrived",
      };

      setCurrentOdo(data.arrivedOdo);

      if (arrivedRes) {
        const newObj = {
          ...arrivedRes,
          date: moment(Date.now()).tz("Asia/Manila"),
          destination:
            data?.destination === "OTHER LOCATION"
              ? data?.destination_name
              : data?.destination,
        };

        // const delivery = await selectTable(
        //   "depot_delivery WHERE id = (SELECT MAX(id) FROM depot_delivery)"
        // );

        // const cratesTransaction = JSON.parse(
        //   delivery[delivery.length - 1].crates_transaction
        // );

        // if (!cratesTransaction && !doneDelivery) {
        //   const newCratesTransaction = [data];
        //   await updateToTable(
        //     "UPDATE depot_delivery SET crates_transaction = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
        //     [JSON.stringify(newCratesTransaction)]
        //   );
        // } else if (!doneDelivery && !lastDelivery) {
        //   cratesTransaction.push(data);

        //   await updateToTable(
        //     "UPDATE depot_delivery SET crates_transaction = (?) WHERE id = (SELECT MAX (id) FROM depot_delivery)",
        //     [JSON.stringify(cratesTransaction)]
        //   );
        // }

        // if (cratesTransaction && lastDelivery && !doneDelivery) {
        //   cratesTransaction.push(data);
        //   await updateToTable(
        //     "UPDATE depot_delivery SET last_store = (?), crates_transaction = (?)  WHERE id = (SELECT MAX (id) FROM depot_delivery)",
        //     [JSON.stringify(lastDelivery), JSON.stringify(cratesTransaction)]
        //   );
        // } else if (!cratesTransaction && lastDelivery && !doneDelivery) {
        //   const newCratesTransaction = [data];
        //   await updateToTable(
        //     "UPDATE depot_delivery SET last_store = (?), crates_transaction = (?)  WHERE id = (SELECT MAX (id) FROM depot_delivery)",
        //     [JSON.stringify(lastDelivery), JSON.stringify(newCratesTransaction)]
        //   );
        // }

        await reloadRoute(newObj);
        await reloadMapState();
      }
      setLastDestination(
        data?.destination === "Others"
          ? data.destination_name
          : data?.destination
      );
      onCloseDestination();
      stopArrivedLoading();
      onCloseArrivedModal();
      startLoader();
    } catch (error) {
      console.log("SQLITE ARRIVED: ", error);
      stopArrivedLoading();
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

      // const gasObj = {
      //   gas_station_id: data.gas_station_id,
      //   gas_station_name: data.gas_station_name,
      //   odometer: data.odometer,
      //   liter: data.liter,
      //   amount: data.amount,
      //   lat: location?.coords?.latitude,
      //   long: location?.coords?.longitude,
      // };

      const gasObj = {
        gas_station_id: data.gas_station_id,
        gas_station_name: data.gas_station_name,
        odometer: data.odometer,
        liter: data.liter,
        amount: data.amount,
        lat: 0,
        long: 0,
      };

      const tripRes = await selectTable("depot_delivery");
      let gas = JSON.parse(tripRes[tripRes.length - 1]?.gas);
      gas.push(gasObj);

      await updateToTable(
        "UPDATE depot_delivery SET gas = (?) WHERE id = (SELECT MAX(id) FROM depot_delivery)",
        [JSON.stringify(gas)]
      );

      stopGasLoading();
      onCloseGasModal();
      startLoader();
    } catch (error) {
      console.log("SQLITE GAS", error);
      showAlert(`ERROR SQLTIE GAS PROCESS`, "danger");
    }
  };

  const sqliteDone = async (data) => {
    try {
      Keyboard.dismiss();
      startDoneLoading();

      const routeRes = await selectTable("route");
      const mapPoints = [...routeRes.map((item) => JSON.parse(item?.points))];

      const offlineTripInitial = await selectTable(
        "depot_delivery WHERE id = (SELECT MAX(id) FROM depot_delivery)"
      );

      const imgInitial = JSON.parse(offlineTripInitial[0]?.image);
      imgInitial.push({
        name: new Date() + "_odometer",
        uri: data.odometer_image_path?.uri || null,
        type: "image/jpg",
      });

      await updateToTable(
        "UPDATE depot_delivery SET image = (?), odometer_done = (?), points = (?)  WHERE id = (SELECT MAX(id) FROM depot_delivery)",
        [
          JSON.stringify(imgInitial),
          data.odometer_done,
          JSON.stringify(mapPoints),
        ]
      );

      if (net) {
        const offlineTrip = await selectTable(
          "depot_delivery WHERE id = (SELECT MAX(id) FROM depot_delivery)"
        );

        const img = JSON.parse(offlineTrip[0]?.image);
        const form = new FormData();

        form.append("trip_date", JSON.parse(offlineTrip[0]?.date));
        form.append("trip_type", offlineTrip[0]?.trip_type);
        form.append("trip_category", offlineTrip[0]?.trip_category);
        form.append("destination", offlineTrip[0]?.destination);
        form.append("route", offlineTrip[0]?.route);
        form.append("vehicle_id", offlineTrip[0]?.vehicle_id);
        form.append("locations", offlineTrip[0]?.locations);
        form.append("diesels", offlineTrip[0]?.gas);
        // form.append("odometer", JSON.parse(offlineTrip[0]?.odometer));
        // form.append("odometer_done", JSON.parse(data?.odometer_done));
        form.append("odometer", JSON.parse(parseInt(offlineTrip[0]?.odometer)));
        form.append("odometer_done", JSON.parse(parseInt(data?.odometer_done)));
        img !== null && img.map((img) => form.append("images", img));
        form.append("others", offlineTrip[0].others);
        form.append("charging", offlineTrip[0].charging);
        form.append("companion", offlineTrip[0].companion);
        form.append("points", JSON.stringify(mapPoints));
        form.append("temperature", offlineTrip[0].temperature);
        form.append("crates_transaction", offlineTrip[0].crates_transaction);

        const res = await createTrip(form);

        if (res?.data) {
          // Remove offline trip to sqlite database and state
          await deleteFromTable(
            `depot_delivery WHERE id = (SELECT MAX(id) FROM depot_delivery)`
          );
        } else {
          showAlert(res?.error?.error, "warning");
        }
      }

      dispatch(setDepotTripCateogry("delivery"));
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
      console.log("SQLITE DONE: ", error);
      showAlert(`ERROR SQLTIE DONE PROCESS`, "danger");
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
    // leftButton: {
    //   backgroundColor: leftLoading
    //     ? colors.notActive
    //     : trip?.locations?.length % 2 !== 0 && trip?.locations?.length > 0
    //     ? colors.notActive
    //     : lastLeft
    //     ? colors.notActive
    //     : colors.danger,
    // },
    leftButton: {
      backgroundColor: leftLoading
        ? colors.notActive
        : trip?.locations?.length % 2 !== 0 && trip?.locations?.length > 0
        ? colors.notActive
        : doneDelivery
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
    // doneButton: {
    //   backgroundColor:
    //     trip?.locations?.length % 2 !== 0 && trip?.locations?.length > 0
    //       ? colors.notActive
    //       : trip?.locations?.length === 0
    //       ? colors.notActive
    //       : leftLoading
    //       ? colors.notActive
    //       : arrivedLoading
    //       ? colors.notActive
    //       : doneLoading
    //       ? colors.notActive
    //       : trip?.locations?.length % 2 === 0 && !lastLeft
    //       ? colors.notActive
    //       : colors.dark,
    // },
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
          : trip?.locations?.length % 2 === 0 && !doneDelivery
          ? colors.notActive
          : colors.dark,
    },
  });

  // if (!showMap) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>Allow permission for locations</Text>
  //       <Button onPress={requestPremissions}>Request Permission</Button>
  //     </View>
  //   );
  // }

  // if (!location) {
  //   return <LoaderAnimation />;
  // }

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
            {/* <Text>{`  Total KM:  ${totalKm || "0"}`}</Text> */}
          </View>

          {/* LEFT AND ARRIVED BUTTON */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                mode="contained"
                style={styles.leftButton}
                labelStyle={styles.buttonLabelStyle}
                // disabled={
                //   leftLoading ||
                //   arrivedLoading ||
                //   (trip?.locations?.length % 2 !== 0 &&
                //     trip?.locations?.length > 0) ||
                //   lastLeft
                // }
                disabled={
                  leftLoading ||
                  arrivedLoading ||
                  (trip?.locations?.length % 2 !== 0 &&
                    trip?.locations?.length > 0) ||
                  doneDelivery
                }
                loading={leftLoading}
                // onPress={
                //   trip?.locations?.length === 0
                //     ? onToggleDestination
                //     : sqliteLeft
                // }
                onPress={
                  trip?.locations?.length === 0
                    ? onToggleDestination
                    : onToggleArrivedModal
                }
              >
                {/* {trip?.locations?.length === 0 ? "Left" : " Left Store"} */}
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
                // onPress={
                //   doneDelivery ? onToggleDestination : onToggleArrivedModal
                // }
                onPress={onToggleDestination}
              >
                {/* {doneDelivery ? "Arrived" : "Arrived Store"} */}
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
              // disabled={
              //   (trip?.locations?.length % 2 !== 0 &&
              //     trip?.locations?.length > 0) ||
              //   trip?.locations?.length === 0 ||
              //   arrivedLoading ||
              //   leftLoading ||
              //   doneLoading ||
              //   (trip?.locations?.length % 2 === 0 && !lastLeft)
              // }
              disabled={
                (trip?.locations?.length % 2 !== 0 &&
                  trip?.locations?.length > 0) ||
                trip?.locations?.length === 0 ||
                arrivedLoading ||
                leftLoading ||
                doneLoading ||
                (trip?.locations?.length % 2 === 0 && !doneDelivery)
              }
              onPress={onToggleDoneModal}
            >
              Done
            </Button>
          </View>
        </View>
      </Screen>

      {/* DESTINATION MODAL ON LEFT */}
      <DestinationModal
        isOpenDestination={isOpenDestination}
        onCloseDestination={onCloseDestination}
        loading={arrivedLoading || leftLoading}
        // onSubmit={doneDelivery ? sqliteArrived : sqliteLeft}
        onSubmit={trip?.locations.length === 0 ? sqliteLeft : sqliteArrived}
        currentOdo={currentOdo}
        onArrived={trip?.locations.length % 2 === 0 ? false : true}
      />

      {/* DONE MODAL */}
      <DoneModal
        showDoneModal={showDoneModal}
        estimatedOdo={estimateOdo}
        doneLoading={doneLoading || isLoading}
        onCloseDoneModal={onCloseDoneModal}
        onSubmit={sqliteDone}
        currentOdo={currentOdo}
      />

      {/* GAS MODAL */}
      <GasModal
        showGasModal={showGasModal}
        gasLoading={gasLoading}
        onCloseGasModal={onCloseGasModal}
        onSubmit={handleGasSubmit}
      />

      {/* ARRIVED MODAL */}
      {/* <ArrivedDeliveryModal
        arrivedLoading={arrivedLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteArrived}
        checkboxState={{ lastDelivery, onToggleLastDelivery }}
        currentOdo={currentOdo}
        onArrived={trip?.locations.length % 2 === 0 ? false : true}
      /> */}

      <ArrivedDeliveryModal
        arrivedLoading={leftLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteLeft}
        checkboxState={{ lastDelivery, onToggleLastDelivery }}
        currentOdo={currentOdo}
        onArrived={trip?.locations.length % 2 === 0 ? false : true}
      />
    </>
  );
};

export default withTheme(DeliveryMap);
