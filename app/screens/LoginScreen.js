import { Formik } from "formik";
import React from "react";
import { TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";
import Screen from "../components/Screen";
import { addToken } from "../redux-toolkit/counter/userCounter";
// import "../assets/fonts/Khyay-Regular.ttf";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const onSubmit = async (values) => {
    await fetch(`${process.env.BASEURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch(addToken(data));
      })
      .catch((error) => console.error("Error:", error));
  };
  return (
    <Screen>
      <View style={{ padding: 20, marginTop: 50 }}>
        <Text
          style={{
            fontSize: 40,
            fontWeight: "600",
            fontFamily: "Khyay",
            lineHeight: 45,
          }}
        >
          Login to your
        </Text>
        <Text
          style={{
            fontSize: 40,
            fontWeight: "600",
            fontFamily: "Khyay",
            lineHeight: 45,
          }}
        >
          Account
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <Formik
          initialValues={{ username: "", password: "" }}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <View>
              <TextInput
                mode="outlined"
                label="Username"
                placeholder="Input username"
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                value={values.username}
                autoCorrect={false}
                outlineStyle={{
                  borderRadius: 15,
                }}
              />
              <Divider style={{ height: 15, backgroundColor: "transparent" }} />
              <View style={{ position: "relative" }}>
                <TextInput
                  mode="outlined"
                  label="Password"
                  placeholder="Input password"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  autoCorrect={false}
                  outlineStyle={{
                    borderRadius: 15,
                  }}
                  secureTextEntry
                />
                <TouchableWithoutFeedback onPress={() => console.log("click")}>
                  <MaterialCommunityIcons
                    name={true ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    style={{
                      position: "absolute",
                      right: 0,
                      marginRight: 10,
                      top: 20,
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
              <Divider style={{ height: 20, backgroundColor: "transparent" }} />

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={{ borderRadius: 35 }}
                labelStyle={{
                  fontSize: 18,
                  lineHeight: 35,
                  fontFamily: "Khyay",
                }}
              >
                Sign In
              </Button>
            </View>
          )}
        </Formik>
      </View>
    </Screen>
  );
};

export default LoginScreen;
