import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  withTheme,
} from "react-native-paper";
import Screen from "../components/Screen";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
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
import { Formik } from "formik";
import TextField from "../components/form/TextField";
import SubmitButton from "../components/form/SubmitButton";
import { doneModalSchema, gasModalSchema } from "../utility/schema/validation";
import DropDownPicker from "react-native-dropdown-picker";

const OfficeMapScreen = ({ route, theme, navigation }) => {
  const { colors } = theme;

  const [value, setValue] = useState("");
  const [items, setItems] = useState();
  // HOOKS AND CONFIG
  const { location, showMap } = taskManager();
  const { handleInterval, handleLeft, handleArrived } = useLocations();
  const net = useSelector((state) => state.net.value);

  // STATE
  const [totalKm, setTotalKm] = useState(0);
  const [estimatedOdo, setEstimatedOdo] = useState(0);
  const [trip, setTrip] = useState({ locations: [] });
  const [points, setPoints] = useState([]);

  useEffect(() => {
    console.log("TRIP FROM STATE", trip);
    (async () => {
      console.log("TRIP FROM SQLITE", await selectTable("offline_trip"));
      console.log("Gas Station Id: ", value);
    })();

    return () => {
      null;
    };
  }, [trip, points, totalKm, value]);

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

  const {
    isOpen: showDropdown,
    onClose: onCloseDropdown,
    onToggle: onToggleDropdown,
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

      const gasRes = await selectTable("gas_station");
      setItems([...gasRes.map((item) => ({ ...item, value: item._id }))]);
    })();

    return () => {
      deleteFromTable("route");
    };
  }, []);

  // 900000 = 15 minutes
  useEffect(() => {
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
    return () => {
      clearInterval(loc);
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
    let mapPoints = [];
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

    const meter = mapPoints.length > 0 ? getPathLength(mapPoints) : 0;
    const km = meter / 1000;
    const odo = JSON.parse(tripRes[tripRes.length - 1].odometer);
    console.log("ESIMATED ODO: ", parseFloat(km.toFixed(1)) + parseFloat(odo));

    setEstimatedOdo(parseFloat(km.toFixed(1)) + parseFloat(odo));
    console.log(estimatedOdo);
  };

  // SQLITE FUNCTION

  const sqliteLeft = async () => {
    try {
      startLeftLoading();
      // start(new Date());

      const leftRes = await handleLeft();
      const newObj = {
        ...leftRes,
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
        console.log(offlineTrip);

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
        form.append("gas", offlineTrip[0].gas);

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

  const sqliteGas = async (data, { resetForm }) => {
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

      resetForm();
      setValue("");
      stopGasLoading();
      onCloseGasModal();
      onCloseDropdown();
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
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading locations.....</Text>
      </View>
    );
  }
  return (
    <>
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
      <Portal>
        <Modal
          visible={showDoneModal}
          onDismiss={onCloseDoneModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity onPress={onCloseDoneModal}>
              <Ionicons name="ios-close-outline" size={30} />
            </TouchableOpacity>
          </View>

          <Text style={{ textAlign: "center" }}>
            Please input current vehicle odometer.
          </Text>

          <Formik
            initialValues={{
              odometer_done: estimatedOdo.toString(),
            }}
            validationSchema={doneModalSchema}
            onSubmit={sqliteDone}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => {
              return (
                <>
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="odometer_done"
                    label="Odometer Done"
                    keyboardType="numeric"
                    defaultValue={values["odometer_done"]}
                  />
                  <SubmitButton
                    onPress={handleSubmit}
                    title="Done"
                    isLoading={doneLoading}
                    disabled={doneLoading}
                  />
                </>
              );
            }}
          </Formik>
        </Modal>
      </Portal>

      {/* GAS MODAL */}
      <Portal>
        <Modal
          visible={showGasModal}
          onDismiss={() => {
            onCloseGasModal();
            onCloseDropdown();
            setValue("");
          }}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              alignItems: "flex-end",
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                onCloseGasModal();
                onCloseDropdown();
                setValue("");
              }}
            >
              <Ionicons name="ios-close-outline" size={30} />
            </TouchableOpacity>
          </View>
          <Formik
            initialValues={{
              gas_station_id: value,
              odometer: "",
              liter: "",
              amount: "",
              gas_station_name: "",
            }}
            validationSchema={gasModalSchema}
            onSubmit={sqliteGas}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setErrors,
              setFieldValue,
            }) => {
              useEffect(() => {
                if (value) {
                  setFieldValue("gas_station_id", value);
                  setErrors("gas_station_id", null);
                }

                if (value !== "507f191e810c19729de860ea") {
                  setFieldValue("gas_station_name", value);
                  setErrors("gas_station_name", null);
                } else {
                  setFieldValue("gas_station_name", "");
                  setErrors("gas_station_name", null);
                }

                return () => {
                  null;
                };
              }, [value]);
              return (
                <>
                  <DropDownPicker
                    open={showDropdown}
                    value={value}
                    items={items}
                    onChangeValue={handleChange}
                    setOpen={onToggleDropdown}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select gas station"
                    textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
                    // labelStyle={{ color: "red", fontSize: 28 }}
                    style={{
                      borderRadius: 15,
                      borderColor: errors["gas_station"]
                        ? colors.danger
                        : colors.light,
                      marginBottom:
                        touched.gas_station_id && errors.gas_station_id
                          ? 0
                          : 12,
                    }}
                    dropDownContainerStyle={{
                      borderColor: errors["gas_station"]
                        ? colors.danger
                        : colors.light,
                      maxHeight: 150,
                    }}
                  />
                  {touched.gas_station_id && errors.gas_station_id && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 14,
                        padding: 5,
                      }}
                    >
                      {errors.gas_station_id}
                    </Text>
                  )}
                  {value === "507f191e810c19729de860ea" && (
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="gas_station_name"
                      label="Gas Station Name"
                      keyboardType="numeric"
                    />
                  )}
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="odometer"
                    label="Odometer"
                    keyboardType="numeric"
                  />

                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="liter"
                    label="Liter"
                    keyboardType="numeric"
                    defaultValue={values["odometer_done"]}
                  />
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="amount"
                    label="Amount"
                    keyboardType="numeric"
                    defaultValue={values["odometer_done"]}
                  />
                  <SubmitButton
                    onPress={handleSubmit}
                    title="Done"
                    isLoading={doneLoading}
                    disabled={doneLoading}
                  />
                </>
              );
            }}
          </Formik>
        </Modal>
      </Portal>
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
