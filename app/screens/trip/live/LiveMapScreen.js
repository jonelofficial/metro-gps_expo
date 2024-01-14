import React from "react";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
  withTheme,
} from "react-native-paper";
import Screen from "../../../components/Screen";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import useToast from "../../../hooks/useToast";
import useLocations from "../../../hooks/useLocations";
import taskManager from "../../../config/taskManager";
import useDisclosure from "../../../hooks/useDisclosure";
import { useCreateLiveTripMutation } from "../../../api/metroApi";
import {
  deleteFromTable,
  insertToTable,
  selectTable,
  updateToTable,
} from "../../../utility/sqlite";
import {
  Alert,
  AppState,
  BackHandler,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import moment from "moment-timezone";
import { getPathLength } from "geolib";
import * as Notifications from "expo-notifications";
import LoaderAnimation from "../../../components/loading/LoaderAnimation";
import SuccessAnimation from "../../../components/loading/SuccessAnimation";
import DestinationModal from "../../../components/modal/DestinationModal";
import DoneModal from "../../../components/map/DoneModal";
import GasModal from "../../../components/map/GasModal";
import { validatorStatus } from "../../../redux-toolkit/counter/vaidatorSlice";
import ArrivedModal from "../../../components/modal/live/ArrivedLiveModal";

const LiveMapScreen = ({ theme, navigation }) => {
  const { colors } = theme;
  const user = useSelector((state) => state.token.userDetails);

  // STATE
  // const [totalKm, setTotalKm] = useState(0);
  const [estimatedOdo, setEstimatedOdo] = useState(0);
  const [trip, setTrip] = useState({ locations: [] });
  const [points, setPoints] = useState([]);
  const [syncingTrip, setSyncingTrip] = useState(true);
  const [onBackground, setOnBackground] = useState(false);
  const [totalBagsDelivered, setTotalBagsDelivered] = useState(0);
  const [currentOdo, setCurrentOdo] = useState(0);

  const [lastDestination, setLastDestination] = useState("");
  const [doneDelivery, setDoneDelivery] = useState(false);
  const [lastLeft, setLastLeft] = useState(false);

  const [totalBags, setTotalBags] = useState(0);
  const [currentBags, setCurrentBags] = useState(0);

  // TIMER
  const { seconds, minutes, hours, start, pause } = useStopwatch({});

  // HOOKS AND CONFIG

  const { showAlert } = useToast();
  // const { handleInterval, handleLeft, handleArrived } = useLocations();

  // for background interval

  // const {
  //   location = { coords: { latitude: 0, longitude: 0 } },
  //   showMap,
  //   requestPremissions,
  // } = taskManager((newObj) => reloadRoute(newObj), onBackground);

  const net = useSelector((state) => state.net.value);

  // SUCCESS LOADER

  const {
    isOpen: showLoader,
    onClose: stopLoader,
    onToggle: startLoader,
  } = useDisclosure();

  // DESTINATION DISCLOSSURE

  const {
    isOpen: isOpenDestination,
    onClose: onCloseDestination,
    onToggle: onToggleDestination,
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

  // LIVE MODAL
  const {
    isOpen: showArrivedModal,
    onClose: onCloseArrivedModal,
    onToggle: onToggleArrivedModal,
  } = useDisclosure();

  // LAST DELIVERY
  const {
    isOpen: lastDelivery,
    onClose: onCloseLastDelivery,
    onToggle: onToggleLastDelivery,
  } = useDisclosure();

  // REDUX
  const dispatch = useDispatch();
  const [createLiveTrip, { isLoading }] = useCreateLiveTripMutation();

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
    //       reloadRoute(newObj);
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

  // // PATH OR POINTS AND TOTAL KM USEEFFECT
  // useEffect(() => {
  //   if (location) {
  //     (async () => {
  //       if (location && !location?.coords?.speed <= 0 && !syncingTrip) {
  //         setPoints((currentValue) => [
  //           ...currentValue,
  //           {
  //             latitude: location?.coords?.latitude,
  //             longitude: location?.coords?.longitude,
  //           },
  //         ]);
  //         insertToTable("INSERT INTO route (points) values (?)", [
  //           JSON.stringify({
  //             latitude: location?.coords?.latitude,
  //             longitude: location?.coords?.longitude,
  //           }),
  //         ]);
  //       }

  //       // COMPUTE TOTAL KM
  //       const meter = getPathLength(points);
  //       const km = meter / 1000;
  //       // setTotalKm(km.toFixed(1));
  //     })();
  //   }
  //   return () => {
  //     null;
  //   };
  // }, [location]);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, [trip]);

  const backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      { text: "Cancel", onPress: () => null, style: "cancel" },
      {
        text: "YES",
        onPress: async () => {
          if (trip) {
            navigation.reset({
              index: 0,
              routes: [
                { name: "Dashboard", params: { screen: "DashboardStack" } },
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
      const content = {
        title: `Fresh Morning ${
          user.first_name[0].toUpperCase() +
          user.first_name.substring(1).toLowerCase()
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

  // FUNCTION

  const handleSuccess = () => {
    startLoader();
    setTimeout(() => {
      stopLoader();
    }, 1900);
  };

  // UPDATING ROUTE IF TRIP ALREADY HAVE POINTS OR ROUTE
  const getRoute = async () => {
    setSyncingTrip(true);
    const tripRes = await selectTable("live");
    const points = JSON.parse(tripRes[0]?.points);

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

  // WHEN UNMOUNT THIS CODE UPDATE THE TRIP ROUTE OR POINTS
  const updateRoute = async () => {
    const routeRes = await selectTable("route");

    const mapPoints = [
      ...(await routeRes?.map((item) => JSON.parse(item?.points))),
    ];

    await updateToTable(
      "UPDATE live SET points = (?) WHERE id = (SELECT MAX(id) FROM live)",
      [JSON.stringify(mapPoints)]
    );
  };

  const reloadMapState = async () => {
    const tripRes = await selectTable("live");
    setTotalBags(tripRes[tripRes.length - 1]?.total_bags);
    const transactions = JSON.parse(tripRes[tripRes.length - 1]?.transactions);
    if (transactions?.length > 0) {
      const totalBagsDelivered = transactions.reduce(
        (accumulator, transaction) => {
          // Check if the property exists before adding to the sum
          if (transaction.total_bags_delivered) {
            return accumulator + parseInt(transaction.total_bags_delivered, 10);
          } else {
            return accumulator;
          }
        },
        0
      );

      setCurrentBags(totalBagsDelivered);
    }

    setCurrentOdo(tripRes[tripRes.length - 1].odometer);

    const locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);

    setDoneDelivery(JSON.parse(tripRes[tripRes.length - 1]?.last_delivery));
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

    const tripRes = await selectTable("live");

    if (newObj) {
      let locPoint = JSON.parse(tripRes[tripRes.length - 1]?.locations);
      locPoint.push(newObj);

      await updateToTable(
        "UPDATE live SET points = (?) , locations = (?)  WHERE id = (SELECT MAX(id) FROM live)",
        [JSON.stringify(mapPoints), JSON.stringify(locPoint)]
      );
    }

    const meter = mapPoints.length > 0 ? getPathLength(mapPoints) : 0;
    const km = meter / 1000;
    const odo = JSON.parse(tripRes[tripRes?.length - 1]?.odometer);

    setEstimatedOdo(parseFloat(km.toFixed(1)) + parseFloat(odo));
  };

  // SQLITE FUNCTION

  const sqliteLeft = async (data) => {
    try {
      startLeftLoading();
      start(new Date());

      console.log("SQLITE LEFT WORKING");

      // const leftRes = await Promise.race([
      //   handleLeft(location),
      //   new Promise((resolve, reject) =>
      //     setTimeout(() => reject(new Error("Timeout")), 60000)
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
        //     "UPDATE live SET last_left = (?) WHERE id = (SELECT MAX (id) FROM live)",
        //     [JSON.stringify(doneDelivery)]
        //   );
        // }

        const delivery = await selectTable(
          "live WHERE id = (SELECT MAX(id) FROM live)"
        );

        const transactions = JSON.parse(
          delivery[delivery.length - 1].transactions
        );

        if (!transactions && !doneDelivery) {
          const newTransaction = [data];
          await updateToTable(
            "UPDATE live SET transactions = (?) WHERE id = (SELECT MAX (id) FROM live)",
            [JSON.stringify(newTransaction)]
          );
        } else if (!doneDelivery && !lastDelivery) {
          transactions.push(data);
          await updateToTable(
            "UPDATE live SET transactions = (?) WHERE id = (SELECT MAX (id) FROM live)",
            [JSON.stringify(transactions)]
          );
        }

        if (transactions && lastDelivery) {
          transactions.push(data);

          await updateToTable(
            "UPDATE live SET last_delivery = (?), transactions = (?) , last_left = (?) WHERE id = (SELECT MAX (id) FROM live)",
            [
              JSON.stringify(lastDelivery),
              JSON.stringify(transactions),
              JSON.stringify(doneDelivery),
            ]
          );
        } else if (!transactions && lastDelivery) {
          const newCratesTransaction = [data];

          await updateToTable(
            "UPDATE live SET last_delivery = (?), transactions = (?) , last_left = (?)  WHERE id = (SELECT MAX (id) FROM live)",
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

      // resetForm();
      onCloseDestination();
      stopLefLoading();
      onCloseArrivedModal();
      handleSuccess();
    } catch (error) {
      stopLefLoading();

      showAlert(
        "Left not process. Please try again or reload app if still not processing",
        "danger"
      );
      console.log("ERROR SQLITE LEFT PROCESS: ", error);
    }
  };

  const handleArrivedModal = (data) => {
    setTotalBagsDelivered(data?.total_bags_delivered);
    onCloseArrivedModal();
    onToggleDestination();
  };

  const sqliteArrived = async (data, { resetForm }) => {
    try {
      startArrivedLoading();
      pause();

      console.log("SQLITE ARRIVED WORKING");

      // const arrivedRes = await Promise.race([
      //   handleArrived(location),
      //   new Promise((resolve, reject) =>
      //     setTimeout(() => reject(new Error("Timeout")), 60000)
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
              ? data.destination_name
              : data?.destination,
        };

        // const delivery = await selectTable(
        //   "live WHERE id = (SELECT MAX(id) FROM live)"
        // );

        // const transactions = JSON.parse(
        //   delivery[delivery.length - 1].transactions
        // );

        // if (!transactions && !doneDelivery) {
        //   const newTransaction = [data];
        //   await updateToTable(
        //     "UPDATE live SET transactions = (?) WHERE id = (SELECT MAX (id) FROM live)",
        //     [JSON.stringify(newTransaction)]
        //   );
        // } else if (!doneDelivery && !lastDelivery) {
        //   transactions.push(data);
        //   await updateToTable(
        //     "UPDATE live SET transactions = (?) WHERE id = (SELECT MAX (id) FROM live)",
        //     [JSON.stringify(transactions)]
        //   );
        // }

        // if (transactions && lastDelivery && !doneDelivery) {
        //   transactions.push(data);

        //   await updateToTable(
        //     "UPDATE live SET last_delivery = (?), transactions = (?)  WHERE id = (SELECT MAX (id) FROM live)",
        //     [JSON.stringify(lastDelivery), JSON.stringify(transactions)]
        //   );
        // } else if (!transactions && lastDelivery && !doneDelivery) {
        //   const newCratesTransaction = [data];

        //   await updateToTable(
        //     "UPDATE live SET last_delivery = (?), transactions = (?)  WHERE id = (SELECT MAX (id) FROM live)",
        //     [JSON.stringify(lastDelivery), JSON.stringify(newCratesTransaction)]
        //   );
        // }

        // await updateToTable(
        //   `UPDATE live SET
        //   total_bags_delivered = (?)
        //   WHERE id = (SELECT MAX(id) FROM live)`,
        //   [totalBagsDelivered]
        // );

        await reloadRoute(newObj);
        await reloadMapState();
      }
      setLastDestination(
        data?.destination === "Others"
          ? data.destination_name
          : data?.destination
      );
      // resetForm();
      onCloseDestination();
      stopArrivedLoading();
      onCloseArrivedModal();
      handleSuccess();
    } catch (error) {
      stopArrivedLoading();

      showAlert(
        "Arrived not process. Please try again or reload app if still not processing",
        "danger"
      );
      console.log("ERROR SQLITE ARRIVED PROCESS: ", error);
    }
  };

  const sqliteGas = async (data) => {
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

      const tripRes = await selectTable("live");
      let gas = JSON.parse(tripRes[tripRes.length - 1]?.gas);
      gas.push(gasObj);

      await updateToTable(
        "UPDATE live SET gas = (?)WHERE id = (SELECT MAX(id) FROM live)",
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

  const sqliteDone = async (vehicle_data) => {
    try {
      Keyboard.dismiss();
      startDoneLoading();

      const routeRes = await selectTable("route");
      const mapPoints = [...routeRes.map((item) => JSON.parse(item?.points))];

      const offlineTrip = await selectTable(
        "live WHERE id = (SELECT MAX(id) FROM live)"
      );

      const img = JSON.parse(offlineTrip[0]?.image);
      img.push({
        name: new Date() + "_odometer",
        uri: vehicle_data.odometer_image_path?.uri || null,
        type: "image/jpg",
      });

      await updateToTable(
        "UPDATE live SET image = (?), odometer_done = (?), points = (?)  WHERE id = (SELECT MAX(id) FROM live)",
        [
          JSON.stringify(img),
          vehicle_data.odometer_done,
          JSON.stringify(mapPoints),
        ]
      );

      if (net) {
        const ifOfflineTrip = await selectTable(
          "live WHERE id = (SELECT MAX(id) FROM live)"
        );

        const totalBagDelivered = JSON.parse(
          ifOfflineTrip[0]?.transactions
        )?.reduce(
          (acc, value) =>
            acc +
            (value?.total_bags_delivered
              ? parseFloat(value.total_bags_delivered)
              : 0),
          0
        );

        const ifImg = JSON.parse(ifOfflineTrip[0]?.image);
        const form = new FormData();
        form.append("trip_date", JSON.parse(ifOfflineTrip[0]?.date));
        form.append("vehicle_id", ifOfflineTrip[0].vehicle_id);
        form.append("odometer", JSON.parse(ifOfflineTrip[0]?.odometer));
        form.append("odometer_done", JSON.parse(vehicle_data?.odometer_done));
        ifImg !== null && ifImg.map((img) => form.append("images", img));
        form.append("companion", ifOfflineTrip[0].companion);
        form.append("points", JSON.stringify(mapPoints));
        form.append("others", ifOfflineTrip[0].others);
        form.append("locations", ifOfflineTrip[0].locations);
        form.append("diesels", ifOfflineTrip[0].gas);
        form.append("charging", ifOfflineTrip[0].charging);
        form.append("trip_type", ifOfflineTrip[0].trip_type);
        form.append("total_bags", ifOfflineTrip[0].total_bags);
        form.append("total_bags_delivered", totalBagDelivered);
        form.append("destination", ifOfflineTrip[0].destination);
        form.append("transactions", ifOfflineTrip[0].transactions);

        const res = await createLiveTrip(form);

        if (res?.data) {
          // Remove offline trip to sqlite database and state
          await deleteFromTable(`live WHERE id = (SELECT MAX(id) FROM live)`);
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

  // if (!showMap) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>Allow permission for locations.</Text>
  //       <Button onPress={requestPremissions}>Request Permission</Button>
  //     </View>
  //   );
  // }

  // if (!location) {
  //   return <LoaderAnimation />;
  // }

  // const styles = StyleSheet.create({
  //   firstContainer: {
  //     flex: 0.5,
  //     justifyContent: "center",
  //     alignItems: "center",
  //     marginHorizontal: 15,
  //     marginBottom: 15,
  //     borderWidth: 2,
  //     borderRadius: 10,
  //   },
  //   title: {
  //     fontSize: 18,
  //     marginBottom: 10,
  //   },
  //   secondContainer: {
  //     flex: 0.5,
  //     marginHorizontal: 15,
  //     marginBottom: 15,
  //   },
  //   timer: {
  //     borderWidth: 2,
  //     borderRadius: 10,
  //     padding: 15,
  //     alignItems: "center",
  //     justifyContent: "center",
  //     flexDirection: "row",
  //   },
  //   buttonWrapper: {
  //     marginTop: 15,
  //     marginBottom: 8,
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //   },
  //   buttonContainer: { width: "48%" },
  //   buttonLabelStyle: {
  //     fontSize: 18,
  //     lineHeight: 35,
  //   },
  //   doneButton: { position: "absolute", bottom: 0, left: 0, right: 0 },
  //   container: {
  //     padding: 16,
  //   },
  //   label: {
  //     color: "#333",
  //     fontSize: 14,
  //     fontWeight: "bold",
  //     marginBottom: 8,
  //   },
  //   picker: {
  //     padding: 0,
  //     margin: 0,
  //   },
  // });

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
    doneContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
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

  return (
    <>
      {syncingTrip && (
        <View
          style={{
            position: "absolute",
            zIndex: 999,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator animating={true} color={colors.primary} />
        </View>
      )}
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
          {/* <View>
            {location && <Text>Latitude: {location.coords.latitude}</Text>}
            {location && <Text>Longitude: {location.coords.longitude}</Text>}
          </View> */}
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
            {/* <Text>{`  Total KM: ${totalKm || "0"}`}</Text> */}
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
                {/* {trip?.locations?.length === 0 ? "Left" : " Left"} */}
                Left
              </Button>
            </View>

            <View style={styles.buttonWrapper}>
              <Button
                mode="contained"
                style={styles.arrivedButton}
                labelStyle={styles.buttonLabelStyle}
                // disabled={
                //   arrivedLoading ||
                //   leftLoading ||
                //   trip?.locations?.length % 2 === 0 ||
                //   trip?.locations?.length === 0
                // }
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
              //   (trip?.locations.length % 2 !== 0 &&
              //     trip?.locations.length > 0) ||
              //   trip?.locations.length === 0 ||
              //   arrivedLoading ||
              //   leftLoading ||
              //   doneLoading ||
              //   (trip?.locations?.length % 2 === 0 && !lastLeft)
              // }
              disabled={
                (trip?.locations.length % 2 !== 0 &&
                  trip?.locations.length > 0) ||
                trip?.locations.length === 0 ||
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

      {/* DESTINATION MODAL */}
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
        estimatedOdo={estimatedOdo}
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
        onSubmit={sqliteGas}
      />

      {/* ARRIVED MODAL */}
      {/* <ArrivedModal
        arrivedLoading={arrivedLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteArrived}
        checkboxState={{ lastDelivery, onToggleLastDelivery }}
        currentOdo={currentOdo}
        onArrived={trip?.locations.length % 2 === 0 ? false : true}
      /> */}

      <ArrivedModal
        arrivedLoading={leftLoading}
        onCloseArrivedModal={onCloseArrivedModal}
        showArrivedModal={showArrivedModal}
        onSubmit={sqliteLeft}
        checkboxState={{ lastDelivery, onToggleLastDelivery }}
        currentOdo={currentOdo}
        onArrived={trip?.locations.length % 2 === 0 ? false : true}
        totalBags={totalBags}
        currentBags={currentBags}
      />
    </>
  );
};

export default withTheme(LiveMapScreen);
