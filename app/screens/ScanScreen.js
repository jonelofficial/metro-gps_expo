import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Snackbar, Text, withTheme } from "react-native-paper";
import ViewFinder from "react-native-view-finder";
import { useSelector } from "react-redux";
import useAuth from "../auth/useAuth";
import Screen from "../components/Screen";
import useDisclosure from "../hooks/useDisclosure";

const ScanScreen = ({ theme }) => {
  const { colors } = theme;
  const { height, width } = Dimensions.get("screen");
  const [permission, setPermission] = useState(null);
  const [error, setError] = useState();

  const { isOpen: isLoading, onToggle, onClose } = useDisclosure();
  const {
    isOpen: scan,
    onClose: onScanClose,
    onToggle: onScanToggle,
  } = useDisclosure();
  const {
    isOpen: isShow,
    onToggle: onShowToggle,
    onClose: onShowClose,
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
      onToggle();

      onScanToggle();
      const json = await JSON.parse(data);

      if (json.username && json.password && !token) {
        login(json);
      } else if (json.vehicle_id && token) {
        onShowToggle();
        setError("Valid");
      } else if (json.vehicle_id && !token) {
        onShowToggle();
        setError("Please use account QR Code");
      } else if (json.username && json.password && token) {
        onShowToggle();
        setError("Please scan vehicle QR Code to start trip");
      } else {
        onShowToggle();
        setError("QR not valid");
      }
      onClose();

      setTimeout(() => {
        onScanClose();
      }, 3000);
    } catch (error) {
      setError("Sorry, can't read the QR code.");
      console.log(error);
    }
  };

  if (permission == null) {
    return (
      <View>
        <Text>Requesting for camera permission.</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View>
        <Text>Accept Camera permission and try again.</Text>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.scanWrapper}>
        <BarCodeScanner
          onBarCodeScanned={scan ? undefined : handleScan}
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
      </View>
      <Snackbar
        style={{
          backgroundColor: colors.danger,
          justifyContent: "center",
          alignItems: "center",
        }}
        visible={isShow}
        onDismiss={onShowClose}
        action={{
          label: "close",
          onPress: () => {
            onShowClose();
          },
        }}
      >
        <Text style={styles.snackbarText}>{error}</Text>
      </Snackbar>
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

export default withTheme(ScanScreen);
