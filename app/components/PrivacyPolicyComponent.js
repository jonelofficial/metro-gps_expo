import React from "react";
import { View } from "react-native";
import { Checkbox, Text, withTheme } from "react-native-paper";

const PrivacyPolicyComponent = ({ navigation, checkboxState, theme }) => {
  const { colors } = theme;
  const { isOpen: isTrue, onToggle } = checkboxState;
  return (
    <>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Text
          style={{
            textAlign: "justify",
            fontSize: 14,
          }}
        >
          By continuing to use Metro GPS, I acknowledge and agree that accessing
          my device's location data is necessary for generating accurate
          reports.
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "10%",
          }}
        >
          <Checkbox
            status={isTrue ? "checked" : "unchecked"}
            onPress={onToggle}
          />
        </View>
        <Text
          style={{
            textAlign: "justify",
            fontSize: 14,
            width: "90%",
          }}
        >
          I agree with Metro GPS{" "}
          <Text
            style={{
              color: colors.primary,
              fontSize: 14,
              textDecorationLine: "underline",
            }}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </>
  );
};

export default withTheme(PrivacyPolicyComponent);
