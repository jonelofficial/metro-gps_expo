import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SuccessAnimation = ({ theme }) => {
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
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
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
          width: 100,
          height: 100,
        }}
        source={require("../../animations/success.json")}
      />
    </SafeAreaView>
  );
};

export default SuccessAnimation;
