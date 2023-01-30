import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Screen = ({ children }) => {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: "#eeeeee" }]}>
      {children}
    </SafeAreaView>
  );
};

export default Screen;
