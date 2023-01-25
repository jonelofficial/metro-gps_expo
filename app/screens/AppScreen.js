import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text } from "react-native-paper";

import { useSelector } from "react-redux";
import AuthNavigator from "../utility/navigation/AuthNavigator";
import AppNavigator from "../utility/navigation/AppNavigator";

const AppScreen = () => {
  const token = useSelector((state) => state.token.value);
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
