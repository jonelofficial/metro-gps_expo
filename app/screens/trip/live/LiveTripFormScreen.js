import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, withTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import useDisclosure from "../../../hooks/useDisclosure";
import { BackHandler, Keyboard, TouchableOpacity, View } from "react-native";
import { insertToTable, selectTable } from "../../../utility/sqlite";
import { removeImage } from "../../../redux-toolkit/counter/imageSlice";
import { removeCompanion } from "../../../redux-toolkit/counter/companionSlice";
import Screen from "../../../components/Screen";
import { StyleSheet } from "react-native";
import AppCamera from "../../../components/AppCamera";
import Scanner from "../../../components/Scanner";
import { Formik } from "formik";
import { liveFormSchema } from "../../../utility/schema/validation";
import TextField from "../../../components/form/TextField";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import PrivacyPolicyComponent from "../../../components/PrivacyPolicyComponent";
import SubmitButton from "../../../components/form/SubmitButton";
import { Image } from "react-native";
import { ScrollView } from "react-native";
import moment from "moment-timezone";

const LiveTripFormScreen = ({ theme, route: navigationRoute, navigation }) => {
  const { colors } = theme;
  const { vehicle_id } = navigationRoute.params;

  const image = useSelector((state) => state.image.value);
  const companion = useSelector((state) => state.companion.value);
  const user = useSelector((state) => state.token.userDetails);
  const dispatch = useDispatch();

  // STATE
  const [departments, setDepartments] = useState([]);
  const [value, setValue] = useState(user?.department);

  useEffect(() => {
    // HANDLE BACK
    BackHandler.addEventListener("hardwareBackPress", backAction);

    (async () => {
      const res = await selectTable("department");
      // console.log(res);
      // let data = [];

      const data = JSON.parse(res[0]?.data);

      setDepartments(
        data &&
          departments.length === 0 && [
            ...data.map((item) => ({
              value: item?.department_name,
              label: item?.department_name,
            })),
          ]
      );

      const filterData = (data) => {
        return data.filter((obj) => obj.trip_template === "Live");
      };

      // TRIP TYPE
      const tripType = await selectTable("trip_type");

      const liveTripType = filterData(tripType).filter(
        (obj) => obj.trip_category === "Delivery"
      );

      setTripType([
        ...liveTripType.map((obj) => {
          return { value: obj.type, label: obj.type };
        }),
      ]);
    })();
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
      dispatch(removeImage());
      dispatch(removeCompanion());
    };
  }, []);

  const backAction = () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.navigate("DashboardStack");
      return true;
    }
    return false;
  };

  // TRIP TYPE - HAULING
  const [tripType, setTripType] = useState([]);
  const [tripTypeValue, setTripTypeValue] = useState(user?.trip_type);

  const {
    isOpen: showTripTypeDropdown,
    onClose: onCloseTripTypeDropdown,
    onToggle: onToggleTripTypeDropdown,
  } = useDisclosure();

  const chexboxState = useDisclosure();

  const {
    isOpen: showDropdown,
    onClose: onCloseDropdown,
    onToggle: onToggleDropdown,
  } = useDisclosure();

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

  const {
    isOpen: showLoadingBtn,
    onClose: onCloseLoadingBtn,
    onToggle: onToggleLoadingBtn,
  } = useDisclosure();

  const onSubmit = async (data, { resetForm }) => {
    onToggleLoadingBtn();
    Keyboard.dismiss();

    await insertToTable(
      "INSERT INTO live (user_id,vehicle_id, odometer, image, companion, others, locations, gas, date, charging, total_bags, trip_type) values (?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        user?.userId,
        vehicle_id._id,
        data.odometer,
        JSON.stringify([
          {
            name: new Date() + "_odometer",
            uri: data.odometer_image_path?.uri || null,
            type: "image/jpg",
          },
        ]),
        JSON.stringify(companion),
        data.others,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(moment(Date.now()).tz("Asia/Manila")),
        data?.charging,
        data?.total_bags,
        data?.trip_type,
      ]
    );

    resetForm();
    dispatch(removeImage());
    onCloseLoadingBtn();

    navigation.navigate("OfficeMap");
  };

  const Errors = ({ children }) => {
    return (
      <Text style={{ color: "red", fontSize: 14, padding: 5 }}>{children}</Text>
    );
  };

  return (
    <>
      <Screen>
        <ScrollView
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
            <Text>Vehicle Plate: {vehicle_id?.plate_no}</Text>
          </View>

          <View>
            <Text style={{ fontSize: 13, color: colors.light }}>
              If the autofill does not match the actual odometer, please edit
              based on the actual odometer
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
                charging: value,
                trip_type: tripTypeValue,
                total_bags: "",
              }}
              validationSchema={liveFormSchema}
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
                    setFieldValue("odometer_image_path", image);
                    setErrors("odometer_image_path", null);
                  } else {
                    setFieldValue("odometer_image_path", null);
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

                useEffect(() => {
                  if (value !== "") {
                    setFieldValue("charging", value);
                    setErrors("charging", null);
                  }

                  return () => {
                    null;
                  };
                }, [value]);

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
                        keyboardType="numeric"
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

                      <Text style={[styles.text, { marginBottom: 10 }]}>
                        Trip Type:
                      </Text>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={showTripTypeDropdown}
                        value={tripTypeValue}
                        items={tripType}
                        onChangeValue={(value) => {
                          setFieldValue("trip_type", value);
                        }}
                        setOpen={onToggleTripTypeDropdown}
                        setValue={setTripTypeValue}
                        setItems={setTripType}
                        placeholder="Select Trip Type"
                        textStyle={{
                          fontFamily: "Khyay",
                          fontSize: 16,
                        }}
                        style={{
                          borderRadius: 15,
                          borderColor: colors.light,
                          marginBottom:
                            touched.trip_type && errors.trip_type ? 0 : 12,
                          zIndex: 0,
                        }}
                        dropDownContainerStyle={{
                          borderColor: colors.light,
                          maxHeight: 150,
                          // zIndex: 99,
                        }}
                        zIndex={3000}
                        zIndexInverse={1000}
                      />
                      {/* TRIP TYPE ERROR HANDLING */}
                      {touched?.trip_type && errors?.trip_type && (
                        <Errors>{errors.trip_type}</Errors>
                      )}

                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="total_bags"
                        label="Total Bags"
                        keyboardType="numeric"
                      />
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

                      {/* CHARGING */}
                      <Text style={{ marginBottom: 8 }}>Charging:</Text>
                      {departments && departments.length !== 0 && (
                        <DropDownPicker
                          open={showDropdown}
                          value={value}
                          items={departments}
                          onChangeValue={handleChange}
                          setOpen={onToggleDropdown}
                          setValue={setValue}
                          setItems={setDepartments}
                          placeholder="Select department"
                          textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
                          style={{
                            borderRadius: 15,
                            borderColor: colors.light,
                            marginBottom:
                              touched.charging && errors.charging ? 0 : 12,
                          }}
                          dropDownContainerStyle={{
                            borderColor: colors.light,
                            maxHeight: 150,
                          }}
                        />
                      )}
                      {touched?.charging && errors?.charging && (
                        <Text
                          style={{
                            color: "red",
                            fontSize: 14,
                            padding: 5,
                          }}
                        >
                          {errors.charging}
                        </Text>
                      )}

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

                      <PrivacyPolicyComponent
                        navigation={navigation}
                        checkboxState={chexboxState}
                      />
                    </View>

                    <View>
                      <SubmitButton
                        onPress={handleSubmit}
                        title="Drive"
                        isLoading={showLoadingBtn}
                        style={{
                          backgroundColor: !chexboxState.isOpen
                            ? colors.notActive
                            : colors.primary,
                        }}
                        disabled={!chexboxState.isOpen}
                      />
                    </View>
                  </>
                );
              }}
            </Formik>
          </View>
        </ScrollView>
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

export default withTheme(LiveTripFormScreen);
