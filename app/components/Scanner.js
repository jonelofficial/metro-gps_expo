import { Alert, BackHandler, Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import ViewFinder from "react-native-view-finder";
import { Button, Text } from "react-native-paper";
import useDisclosure from "../hooks/useDisclosure";
import { useDispatch } from "react-redux";
import { setCompanion } from "../redux-toolkit/counter/companionSlice";
import useToast from "../hooks/useToast";

const Scanner = ({ onCloseScanner }) => {
  const dispatch = useDispatch();
  const { showAlert } = useToast();

  const { height, width } = Dimensions.get("screen");
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const {
    isOpen: showLoading,
    onClose: onCloseLoading,
    onToggle: onToggleLoading,
  } = useDisclosure();

  const backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        text: "YES",
        onPress: () => onCloseScanner(),
      },
    ]);
    return true;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    onToggleLoading();
    const json = await JSON.parse(data);
    if (json.first_name) {
      dispatch(setCompanion(json));
      setScanned(true);
      onCloseScanner();
    } else {
      showAlert("QR code not valid. Use ID QR code", "danger");
    }
    onCloseLoading();

    setScanned(true);
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.getPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    // HANDLE BACK
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.cameraPermission}>
        <Text style={{ textAlign: "center" }}>
          Requesting for camera permission
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.cameraPermission}>
        <Text
          style={{
            textAlign: "center",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          Accept Camera permission and try again
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container]}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          ratio="16:9"
          style={[
            StyleSheet.absoluteFillObject,
            {
              width: width * 1.8,
              height: height * 1.1,
              position: "absolute",
              left: "-30%",
            },
          ]}
        />

        <ViewFinder
          height={250}
          width={250}
          borderLength={50}
          borderRadius={15}
          loading={showLoading}
        />

        {scanned && (
          <Button
            onPress={() => {
              setScanned(false);
              onCloseLoading();
            }}
          >
            Tap to Scan Again
          </Button>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, position: "absolute", top: 0, bottom: 0 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  cameraPermission: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdfdfd",
  },
});

export default Scanner;
