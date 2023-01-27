import React, { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { Button, Text, withTheme } from "react-native-paper";

const ScanToast = ({ showToast, theme }) => {
  const { colors } = theme;
  const fadeAnim = useRef(new Animated.Value(300)).current;

  const slideIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 300,
      useNativeDriver: true,
      duration: 300,
    }).start();
  };

  useEffect(() => {
    if (showToast) {
      slideIn();
    } else {
      slideOut();
    }
  }, [showToast]);
  return (
    <Animated.View
      style={{
        transform: [{ translateY: fadeAnim }],
        backgroundColor: colors.white,
        padding: 25,
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
    >
      <View
        style={{
          padding: 15,
          borderColor: colors.primary,
          borderWidth: 1,
          borderRadius: 10,
          marginBottom: 20,
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: 57,
            height: 55,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
            }}
            source={require("../assets/placeholder/car_placeholder.png")}
          />
        </View>
        <View
          style={{
            marginHorizontal: 15,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.primary,
              textTransform: "uppercase",
              fontSize: 20,
            }}
          >
            testing
          </Text>
          <Text
            style={{
              color: colors.light,
              textTransform: "capitalize",
            }}
          >
            test test
          </Text>
        </View>
      </View>
      <Button
        mode="contained"
        style={{ padding: 5 }}
        labelStyle={{ fontSize: 18, textTransform: "uppercase" }}
      >
        Drive
      </Button>
    </Animated.View>
  );
};

export default withTheme(ScanToast);
