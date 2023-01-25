import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";

const Screen = ({ children }) => {
  // useEffect(() => {
  //   (async () => {
  //     useFonts({
  //       Khyay: require("../assets/fonts/Khyay-Regular.ttf"),
  //     });
  //   })();
  // }, []);

  const [loaded] = useFonts({
    Khyay: require("../assets/fonts/Khyay-Regular.ttf"),
  });
  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {children}
    </SafeAreaView>
  );
};

export default Screen;
