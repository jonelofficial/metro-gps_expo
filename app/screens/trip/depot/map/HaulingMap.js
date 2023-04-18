import React from "react";
import { Button, IconButton, Text, withTheme } from "react-native-paper";
import Screen from "../../../../components/Screen";
import { useState } from "react";
import { useEffect } from "react";
import { selectTable } from "../../../../utility/sqlite";
import { StyleSheet, View } from "react-native";
import { useStopwatch } from "react-timer-hook";
import useDisclosure from "../../../../hooks/useDisclosure";

const HaulingMap = ({ theme }) => {
  const { colors } = theme;
  // STATE
  const [trip, setTrip] = useState([]);

  // TIMER
  const { seconds, minutes, hours, start, pause } = useStopwatch({});

  useEffect(() => {
    (async () => {
      const res = await selectTable("depot_hauling");
      setTrip(res[res.length - 1]);
      console.log(res[res.length - 1]);
    })();

    return () => {};
  }, []);

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

  // DONE MODAL

  const {
    isOpen: showDoneModal,
    onClose: onCloseDoneModal,
    onToggle: onToggleDoneModal,
  } = useDisclosure();

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

  return (
    <>
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
            <Text>{`  Total KM: totalKm || ${"0"}`}</Text>
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
    </>
  );
};

export default withTheme(HaulingMap);
