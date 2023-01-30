import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, withTheme } from "react-native-paper";
import SubmitButton from "../components/form/SubmitButton";
import TextField from "../components/form/TextField";
import Screen from "../components/Screen";
import useDisclosure from "../hooks/useDisclosure";
import { Ionicons } from "@expo/vector-icons";
import AppCamera from "../components/AppCamera";
import { useDispatch, useSelector } from "react-redux";
import { removeImage } from "../redux-toolkit/counter/imageSlice";
import Scanner from "../components/Scanner";
import { officeFormSchema } from "../utility/schema/validation";
import { spliceCompanion } from "../redux-toolkit/counter/companionSlice";

const TripFormScreen = ({ theme }) => {
  const { colors } = theme;
  const image = useSelector((state) => state.image.value);
  const companion = useSelector((state) => state.companion.value);
  const dispatch = useDispatch();

  const {
    isOpen: showCamera,
    onClose: onCloseCamera,
    onToggle: onToggleCamera,
  } = useDisclosure();

  const {
    isOpen: showScanner,
    onClose: onCloseScanner,
    onToggle: onToggleScanner,
  } = useDisclosure();

  const onSubmit = async (data) => {
    console.log(data);
  };

  return (
    <>
      <Screen>
        <View
          style={{
            margin: 15,
            flex: 1,
          }}
        >
          <View
            style={[
              styles.plateContainer,
              {
                borderColor: colors.primary,
                backgroundColor: colors.white,
              },
            ]}
          >
            <Text>Vehicle Plate: AAL4975</Text>
          </View>

          <View>
            <Text style={{ fontSize: 13, color: colors.light }}>
              If the autofill does not match the actual odometer, please edit
              based pn the actual odometer
            </Text>
          </View>

          <View
            style={{
              paddingVertical: 5,
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <Formik
              initialValues={{
                odometer: "",
                others: "",
                odometer_image_path: image,
                companion: companion,
              }}
              validationSchema={officeFormSchema}
              onSubmit={onSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                setErrors,
              }) => {
                useEffect(() => {
                  if (image) {
                    console.log("working");
                    setFieldValue("odometer_image_path", image);
                    setErrors("odometer_image_path", null);
                  }

                  return () => {
                    null;
                  };
                }, [image]);
                useEffect(() => {
                  if (companion) {
                    setFieldValue("companion", companion);
                    setErrors("companion", null);
                  }

                  return () => {
                    null;
                  };
                }, [companion]);

                return (
                  <>
                    <View>
                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="odometer"
                        label="Odometer"
                      />

                      {/* IMAGE */}
                      <Text style={{ marginBottom: 8 }}>Odometer Picture:</Text>
                      <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        {image && (
                          <Image
                            source={{ uri: image?.uri }}
                            style={{
                              width: 100,
                              height: 100,
                              marginRight: 10,
                              borderRadius: 10,
                            }}
                          />
                        )}

                        <TouchableOpacity
                          onPress={() => {
                            if (image) {
                              dispatch(removeImage());
                              onToggleCamera();
                            } else {
                              Keyboard.dismiss();
                              onToggleCamera();
                            }
                          }}
                        >
                          <Ionicons
                            name={image ? "ios-camera-reverse" : "ios-camera"}
                            size={40}
                          />
                        </TouchableOpacity>
                      </View>
                      {touched.odometer_image_path &&
                        errors.odometer_image_path && (
                          <Text
                            style={{ color: "red", fontSize: 14, padding: 5 }}
                          >
                            {errors?.odometer_image_path &&
                              "Odometer Picture is a required field"}
                          </Text>
                        )}

                      {/* IMAGE */}
                      <Text style={{ marginBottom: 8 }}>Companion:</Text>
                      <View style={{ marginBottom: 8 }}>
                        <TouchableOpacity onPress={onToggleScanner}>
                          {companion.length > 0 &&
                            companion.map((item, i) => (
                              <View
                                key={i}
                                style={{
                                  marginBottom: 5,
                                  flexDirection: "row",
                                }}
                              >
                                <Text style={{ marginRight: 10 }}>
                                  {item.first_name}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => dispatch(spliceCompanion(i))}
                                >
                                  <Ionicons
                                    name={"close-circle"}
                                    size={20}
                                    color={colors.danger}
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                          <Text style={{ fontSize: 14, color: colors.primary }}>
                            Add Companion
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="others"
                        label="Others"
                        multiline={true}
                        numberOfLines={3}
                      />
                    </View>

                    <View>
                      <SubmitButton
                        onPress={handleSubmit}
                        title="Drive"
                        isLoading={null}
                      />
                    </View>
                  </>
                );
              }}
            </Formik>
          </View>
        </View>
      </Screen>
      {showCamera && <AppCamera onCloseCamera={onCloseCamera} />}
      {showScanner && <Scanner onCloseScanner={onCloseScanner} />}
    </>
  );
};

const styles = StyleSheet.create({
  plateContainer: {
    padding: 30,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
  },
});

export default withTheme(TripFormScreen);