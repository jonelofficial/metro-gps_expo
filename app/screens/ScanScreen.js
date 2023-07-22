import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import ViewFinder from "react-native-view-finder";
import { useSelector } from "react-redux";
import useAuth from "../auth/useAuth";
import ScanToast from "../components/ScanToast";
import Screen from "../components/Screen";
import useDisclosure from "../hooks/useDisclosure";
import useToast from "../hooks/useToast";
import { selectTable } from "../utility/sqlite";

const ScanScreen = () => {
  const { height, width } = Dimensions.get("screen");
  const [permission, setPermission] = useState(null);
  const [vehicleData, setVehicleData] = useState({});

  const { showAlert } = useToast();

  const {
    isOpen: isLoading,
    onToggle: onLoadingToggle,
    onClose: onLoadingClose,
  } = useDisclosure();
  const {
    isOpen: showScan,
    onClose: onScanClose,
    onToggle: onScanToggle,
  } = useDisclosure();

  const {
    isOpen: showToast,
    onToggle: onToastToggle,
    onClose: onToastClose,
  } = useDisclosure();

  const token = useSelector((state) => state.token.value);
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      const { granted } = await BarCodeScanner.requestPermissionsAsync();
      setPermission(granted);
    })();
    return () => {
      null;
    };
  }, []);

  const handleScan = async ({ type, data }) => {
    try {
      onLoadingToggle();

      const json = await JSON.parse(data);

      if (json.username && json.password && !token) {
        await login(json);
      } else if (json.vehicle_id && token) {
        const vehicles = await selectTable("vehicles");
        const vehicle = vehicles.find(
          (vehicle) => vehicle.plate_no === json.vehicle_id.toUpperCase()
        );
        if (vehicle) {
          setVehicleData(vehicle);
          onScanToggle();
          onToastToggle();
        } else {
          showAlert("No vehicle found", "danger");
          onScanToggle();
        }
      } else if (json.vehicle_id && !token) {
        showAlert("Please use account QR Code", "danger");
      } else if (json.username && json.password && token) {
        showAlert("Please scan vehicle QR Code to start trip", "danger");
      } else {
        showAlert("QR not valid", "danger");
      }
      onLoadingClose();
    } catch (error) {
      showAlert("Sorry, can't read the QR code", "danger");
      console.log(error);
    }
  };

  if (permission == null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Requesting for camera permission.</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Accept Camera permission and try again.</Text>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.scanWrapper}>
        <BarCodeScanner
          onBarCodeScanned={showScan || isLoading ? undefined : handleScan}
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
          loading={isLoading}
        />
        {showScan && (
          <Button
            onPress={() => {
              onScanClose();
              onToastClose();
              onLoadingClose();
            }}
          >
            Tap to Scan Again
          </Button>
        )}
      </View>

      {/* TOAST */}

      <ScanToast
        showToast={showToast}
        vehicleData={vehicleData}
        onToastClose={onToastClose}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  scanWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  snackbarText: {
    fontSize: 14,
    color: "#fff",
  },
});

export default ScanScreen;
