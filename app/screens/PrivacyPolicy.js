import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, withTheme } from "react-native-paper";
import Screen from "../components/Screen";
import { Image } from "react-native";

const PrivacyPolicy = ({ theme }) => {
  const { colors } = theme;

  const styles = StyleSheet.create({
    textWrapper: { marginBottom: 16 },
    text: { textAlign: "justify" },
  });
  return (
    <Screen>
      <ScrollView style={{ padding: 16, flex: 1 }}>
        <View style={styles.textWrapper}>
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>
            Privacy Policy
          </Text>
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            At Metro GPS{" "}
            <Text style={{ fontStyle: "italic" }}>(Company Use Only)</Text>, we
            are dedicated to providing a seamless and efficient experience for
            our company users. To ensure accurate reporting and improve the
            functionality of our app, we require access to your device's
            location, both in the foreground and background. Please note the
            following details regarding the use of location data:
          </Text>
        </View>

        <View style={[styles.textWrapper, { paddingLeft: 16 }]}>
          <Text style={styles.text}>
            1. Accurate Reports: Our app utilizes your location data to generate
            precise reports, enabling our company to effectively track and
            analyze various aspects of our operations.
          </Text>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            We understand the importance of data privacy and want to assure you
            that we handle your location information responsibly. We strictly
            adhere to industry standards and applicable privacy laws to protect
            the confidentiality and security of your personal data.
          </Text>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            If you have any concerns or questions regarding the use of location
            data, please refer to our privacy policy or contact our support team
            at{" "}
            <Text style={{ color: colors.primary }}>
              MIS Support 09190895847
            </Text>
            . We value your feedback and are committed to addressing any
            inquiries you may have.
          </Text>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            Please note that granting access to location services is essential
            for the proper functioning of our app and to ensure accurate
            reporting. If you prefer not to grant location access, some features
            of our app may be limited or unavailable.
          </Text>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            Thank you for using Metro GPS for company purposes. We appreciate
            your trust in our app and assure you that your privacy and data
            security remain our top priorities.
          </Text>
        </View>

        <View
          style={[
            styles.textWrapper,
            {
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 36,
              flexDirection: "row",
            },
          ]}
        >
          <Image
            source={require("../../app/assets/RDF-Logo.png")}
            style={{ width: 120, height: 60 }}
          />
          <Image
            source={require("../../app/assets/MIS-Logo.png")}
            style={{ width: 60, height: 60 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

export default withTheme(PrivacyPolicy);
