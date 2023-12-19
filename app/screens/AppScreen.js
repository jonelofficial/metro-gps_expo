import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as TaskManager from "expo-task-manager";

import { useDispatch, useSelector } from "react-redux";
import AuthNavigator from "../utility/navigation/AuthNavigator";
import AppNavigator from "../utility/navigation/AppNavigator";
import useStorage from "../auth/useStorage";
import { addToken, addUser } from "../redux-toolkit/counter/userCounter";
import runSQLite from "../config/runSQLite";
import { useNetInfo } from "@react-native-community/netinfo";
import { netStatus } from "../redux-toolkit/counter/netSlice";
import { Snackbar, Text, withTheme } from "react-native-paper";
import { setVisible } from "../redux-toolkit/counter/snackbarSlice";
import OfflineNotice from "../components/OfflineNotice";
import { deleteFromTable, selectTable } from "../utility/sqlite";
import { useKeepAwake } from "expo-keep-awake";
import { Alert, Linking, Platform, ToastAndroid } from "react-native";

import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Network from "expo-network";
import { Camera } from "expo-camera";
import Constants from "expo-constants";

SplashScreen.preventAutoHideAsync();

const AppScreen = ({ theme }) => {
  const netInfo = useNetInfo();
  const { colors } = theme;
  useKeepAwake();
  runSQLite();

  const AppVersion = Constants?.manifest?.version;

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const snackbar = useSelector((state) => state.snackbar.value);

  const { getToken, getUser, removeToken, removeUser } = useStorage();
  const [isOpen, setIsOpen] = useState(false);

  // CHECK CREDENTIALS

  const handleUser = async () => {
    try {
      // console.log(await selectTable("depot_hauling"));
      // await deleteFromTable("depot_delivery");
      // await deleteFromTable("vehicles");
      // await removeToken();
      // await removeUser();
      const user = await JSON.parse(await getUser());
      const token = await JSON.parse(await getToken());

      if (!token) return null;

      dispatch(addUser(user));
      dispatch(addToken({ token: token }));
    } catch (error) {
      console.log(error);
    } finally {
      SplashScreen.hideAsync();
      setIsOpen(true);
    }
  };

  // CHECKING OF INTERNET

  useEffect(() => {
    (async () => {
      const net = await Network.getNetworkStateAsync();
      dispatch(netStatus(net?.isConnected));
    })();

    return () => {
      null;
    };
  }, [netInfo]);

  // PERMISSION

  useEffect(() => {
    (async () => {
      // if (
      //   (await TaskManager?.isTaskRegisteredAsync(
      //     "background-location-task"
      //   )) ||
      //   (await TaskManager?.isTaskRegisteredAsync("interval"))
      // ) {
      //   Location?.stopLocationUpdatesAsync("background-location-task");
      //   Location?.stopLocationUpdatesAsync("interval");
      // }

      if (
        (await TaskManager?.isTaskDefined("background-location-task")) ||
        (await TaskManager?.isTaskDefined("interval"))
      ) {
        TaskManager?.unregisterTaskAsync("background-location-task");
        TaskManager?.unregisterTaskAsync("interval");
      }

      Platform?.OS === "android" &&
        ToastAndroid.show(`Metro GPS v${AppVersion}`, ToastAndroid.SHORT);

      try {
        const camera = await Camera.requestCameraPermissionsAsync();
        const media = await MediaLibrary.requestPermissionsAsync();
        // const location = await Location.requestForegroundPermissionsAsync();
        // const backgroundLoc = await Location.requestBackgroundPermissionsAsync();
        const notifications = await Notifications.requestPermissionsAsync();

        // // REMOVE THIS IF NO LOCATION
        // const location = await Location.requestForegroundPermissionsAsync();
        // const backgroundLoc =
        //   await Location.requestBackgroundPermissionsAsync();
        // //  END

        if (
          camera.status === "granted" &&
          media.status === "granted" &&
          // location.status === "granted" &&
          // backgroundLoc.status === "granted" &&
          notifications.status === "granted"
          // // REMOVE THIS IF NO LOCATION
          // location.status === "granted" &&
          // backgroundLoc.status === "granted"
          // //  END
        ) {
          await handleUser();
        } else {
          // // REMOVE THIS IF NO LOCATION
          // Alert.alert(
          //   "Request Permission",
          //   `Please accept permission for ${
          //     camera.status === "denied" ? "CAMERA " : ""
          //   }${media.status === "denied" ? "MEDIA LIBRARY " : ""}${
          //     location.status === "denied" ? "LOCATION" : ""
          //   }${backgroundLoc.status === "denied" ? "BACKGROUND LOCATION" : ""}${
          //     notifications.status === "denied" ? "NOTIFICATION" : ""
          //   } to run the app.\n \nGo to phone setting > Application > Metro GPS > Permission or click OPEN PERMISSION then restart app. Thank you`,
          //   [
          //     { text: "OK", onPress: () => null, style: "cancel" },
          //     {
          //       text: "OPEN PERMISSION",
          //       onPress: () => Linking.openSettings(),
          //     },
          //   ]
          // );
          // // END
          Alert.alert(
            "Request Permission",
            `Please accept permission for ${
              camera.status === "denied" ? "CAMERA " : ""
            }${media.status === "denied" ? "MEDIA LIBRARY " : ""}${
              notifications.status === "denied" ? "NOTIFICATION" : ""
            } to run the app.\n \nGo to phone setting > Application > Metro GPS > Permission or click OPEN PERMISSION then restart app. Thank you`,
            [
              { text: "OK", onPress: () => null, style: "cancel" },
              {
                text: "OPEN PERMISSION",
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.log("APP-SCREEN ERROR: ", error);
      }
    })();

    return () => {
      null;
    };
  }, []);

  if (!isOpen) {
    return null;
  }
  return (
    <>
      <StatusBar style="dark" />
      <OfflineNotice />
      <NavigationContainer>
        {token ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      {/* FOR ERROR OR SUCCESS MESSAGE */}
      <Snackbar
        style={{
          backgroundColor: colors[snackbar.color],
          justifyContent: "center",
          alignItems: "center",
        }}
        visible={snackbar.visible}
        onDismiss={() => dispatch(setVisible(false))}
        action={{
          label: "close",
          onPress: () => {
            dispatch(setVisible(false));
          },
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#fff",
          }}
        >
          {snackbar.msg}
        </Text>
      </Snackbar>
    </>
  );
};

export default withTheme(AppScreen);
