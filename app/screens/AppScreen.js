import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

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
import { deleteFromTable } from "../utility/sqlite";
import { useKeepAwake } from "expo-keep-awake";

SplashScreen.preventAutoHideAsync();

const AppScreen = ({ theme }) => {
  const netInfo = useNetInfo();
  const { colors } = theme;
  useKeepAwake();
  runSQLite();

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  const snackbar = useSelector((state) => state.snackbar.value);

  const { getToken, getUser, removeToken, removeUser } = useStorage();
  const [isOpen, setIsOpen] = useState(false);

  // CHECKING OF INTERNET
  useEffect(() => {
    if (netInfo.type !== "unknown" && netInfo.isInternetReachable === false) {
      return dispatch(netStatus(false));
    }

    dispatch(netStatus(true));
    return () => {
      null;
    };
  }, [netInfo]);

  // CHECKING IF ALREADY LOGIN
  useEffect(() => {
    (async () => {
      try {
        // await deleteFromTable("offline_trip");
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
