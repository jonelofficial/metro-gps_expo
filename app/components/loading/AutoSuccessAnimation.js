import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const AutoSuccessAnimation = ({ loop, stop }) => {
  const [isAnimationFinished, setIsAnimationFinished] = useState(!loop);
  const handleAnimationFinish = () => {
    setIsAnimationFinished(true);
    stop();
  };
  if (isAnimationFinished && loop) {
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
          style={{
            width: 100,
            height: 100,
          }}
          source={require("../../animations/success.json")}
          onAnimationFinish={handleAnimationFinish}
          autoPlay
          loop={!isAnimationFinished}
        />
      </SafeAreaView>
    );
  }
};

export default AutoSuccessAnimation;
