import React from "react";
import { Formik } from "formik";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Divider, Text, TextInput } from "react-native-paper";
import Screen from "../components/Screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useDisclosure from "../hooks/useDisclosure";
import { withTheme } from "react-native-paper";
import { loginSchema } from "../utility/schema/validation";
import TextField from "../components/form/TextField";
import SubmitButton from "../components/form/SubmitButton";
import useAuth from "../auth/useAuth";

const LoginScreen = ({ navigation, theme }) => {
  const { colors } = theme;

  const { isOpen, onToggle } = useDisclosure();
  const { login, isLoading } = useAuth();

  const onSubmit = async (values) => {
    await login(values);
  };
  return (
    <Screen>
      <View style={{ padding: 20, marginTop: 50 }}>
        <Text style={styles.title}>Login to your</Text>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.formWrapper}>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View>
              <TextField
                touched={touched}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                values={values}
                name="username"
                label="Username"
              />

              <View style={styles.passwordWrapper}>
                <TextInput
                  mode="outlined"
                  label="Password"
                  placeholder="Input password"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  autoCorrect={false}
                  autoCapitalize={false}
                  outlineStyle={{
                    borderRadius: 15,
                  }}
                  secureTextEntry={!isOpen}
                />
                <TouchableWithoutFeedback onPress={onToggle}>
                  <MaterialCommunityIcons
                    name={!isOpen ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    style={styles.icon}
                  />
                </TouchableWithoutFeedback>
                {touched.password && errors.password ? (
                  <Text style={styles.textError}>{errors.password}</Text>
                ) : (
                  <Divider style={styles.divider} />
                )}
              </View>

              <View style={styles.scanWrapper}>
                <TouchableOpacity onPress={() => navigation.navigate("Scan")}>
                  <Text style={{ color: colors.primary }}>Scan ID</Text>
                </TouchableOpacity>
              </View>
              <Divider style={styles.divider} />

              <SubmitButton
                onPress={handleSubmit}
                title="Sign In"
                isLoading={isLoading}
                disabled={isLoading}
              />
            </View>
          )}
        </Formik>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    fontWeight: "600",
    lineHeight: 45,
  },
  formWrapper: {
    padding: 20,
  },
  passwordWrapper: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 0,
    marginRight: 10,
    top: 20,
    zIndex: 2,
  },
  textError: {
    color: "red",
    fontSize: 14,
    padding: 5,
  },
  divider: {
    height: 10,
    backgroundColor: "transparent",
  },
  scanWrapper: {
    alignItems: "flex-end",
    marginRight: 10,
  },
});

export default withTheme(LoginScreen);
