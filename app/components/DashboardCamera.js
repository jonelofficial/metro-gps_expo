import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { withTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DashboardCamera = ({ theme }) => {
  const navigation = useNavigation();
  const { colors } = theme;
  return (
    <BlurView intensity={90} tint="light" style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("DashboardStackScan")}
      >
        <LinearGradient
          start={[0, 1]}
          end={[1, 0]}
          colors={[
            colors.accent,
            colors.accent,
            colors.secondary,
            colors.primary,
            colors.main,
            colors.main,
          ]}
          style={styles.gradient}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={30}
            color={colors.white}
          />
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    height: 50,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    width: 65,
    height: 65,
    borderRadius: 50,
    marginTop: -30,
  },
});

export default withTheme(DashboardCamera);
