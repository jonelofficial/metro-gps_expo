import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SyncingAnimation = ({ theme }) => {
  const animation = useRef();

  useEffect(() => {
    animation.current?.play();
    return () => {
      null;
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: "#eeeeee",
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 999,
      }}
    >
      <AnimatedLottieView
        ref={animation}
        autoPlay
        loop
        style={{
          width: 200,
          height: 200,
          backgroundColor: "#eeeeee",
        }}
        source={require("../../animations/syncing.json")}
      />
    </SafeAreaView>
  );
};

export default SyncingAnimation;
