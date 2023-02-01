import React from "react";
import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";

import { Text, withTheme } from "react-native-paper";
import { useSelector } from "react-redux";

function OfflineNotice({ theme }) {
  const { colors } = theme;
  const net = useSelector((state) => state.net.value);
  if (!net)
    return (
      <View style={[styles.container, { backgroundColor: colors.danger }]}>
        <Text style={[styles.text, { color: colors.white }]}>
          No Internet Connection
        </Text>
      </View>
    );
  return null;
}
const styles = StyleSheet.create({
  container: {
    padding: 5,
    width: "100%",
    height: 35,
    position: "absolute",
    zIndex: 1,
    elevation: 1,
    top: Constants.statusBarHeight,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    textAlign: "center",

    paddingLeft: 5,
    fontSize: 16,
  },
});

export default withTheme(OfflineNotice);
