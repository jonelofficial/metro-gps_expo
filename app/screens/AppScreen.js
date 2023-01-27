import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text } from "react-native-paper";

import { useDispatch, useSelector } from "react-redux";
import AuthNavigator from "../utility/navigation/AuthNavigator";
import AppNavigator from "../utility/navigation/AppNavigator";
import useStorage from "../auth/useStorage";
import { addToken, addUser } from "../redux-toolkit/counter/userCounter";
import useDisclosure from "../hooks/useDisclosure";
import { View } from "react-native";
import runSQLite from "../config/runSQLite";

const AppScreen = () => {
  const dispatch = useDispatch();
  const { getToken, getUser, removeToken, removeUser } = useStorage();
  const { isOpen, onToggle, onClose } = useDisclosure();

  runSQLite();

  useEffect(() => {
    (async () => {
      const user = await JSON.parse(await getUser());
      const token = await JSON.parse(await getToken());

      dispatch(addUser(user));
      dispatch(addToken({ token: token }));
      onToggle();
    })();

    return () => {
      null;
    };
  }, []);

  const token = useSelector((state) => state.token.value);

  if (!isOpen) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="dark" />
        <Text>Checking token</Text>
      </View>
    );
  }
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        {token ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
};

export default AppScreen;
