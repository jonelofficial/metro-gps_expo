import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, Text, withTheme } from "react-native-paper";
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
          <Text style={{ fontSize: 32 }}>Privacy Policy</Text>
          <Divider style={{ height: 4, backgroundColor: colors.primary }} />
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
        <View style={[styles.textWrapper, { paddingLeft: 16 }]}>
          <Text style={styles.text}>
            2. Foreground Location: Access to your device's location while the
            app is in the foreground allows us to provide real-time updates and
            deliver location-specific information relevant to your tasks and
            operations.
          </Text>
        </View>
        <View style={[styles.textWrapper, { paddingLeft: 16 }]}>
          <Text style={styles.text}>
            3. Background Location: In certain cases, our app may require access
            to your device's location even when the app is running in the
            background. This allows us to continue monitoring your location for
            the purpose of accurate reporting and ensuring seamless
            functionality.
          </Text>
        </View>
        <View style={[styles.textWrapper, { paddingLeft: 16 }]}>
          <Text style={styles.text}>
            4. QR Code Scanning: Our app utilizes the camera to scan QR codes,
            allowing you to start transactions quickly and conveniently. This
            feature streamlines the process and ensures accurate information
            transfer.
          </Text>
        </View>
        <View style={[styles.textWrapper, { paddingLeft: 16 }]}>
          <Text style={styles.text}>
            5. Odometer Image Upload: To facilitate accurate reporting and
            analysis, our app allows you to capture images of the odometer using
            your device's camera. These images are then securely uploaded to our
            servers, enabling us to gather precise data for operational
            purposes.
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
