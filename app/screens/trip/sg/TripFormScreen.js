import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import {
  BackHandler,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { Text, withTheme } from "react-native-paper";
import SubmitButton from "../../../components/form/SubmitButton";
import TextField from "../../../components/form/TextField";
import Screen from "../../../components/Screen";
import useDisclosure from "../../../hooks/useDisclosure";
import { Ionicons } from "@expo/vector-icons";
import AppCamera from "../../../components/AppCamera";
import { useDispatch, useSelector } from "react-redux";
import { removeImage } from "../../../redux-toolkit/counter/imageSlice";
import Scanner from "../../../components/Scanner";
import { officeFormSchema } from "../../../utility/schema/validation";
import {
  removeCompanion,
  spliceCompanion,
} from "../../../redux-toolkit/counter/companionSlice";
import moment from "moment-timezone";
import { insertToTable, selectTable } from "../../../utility/sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import PrivacyPolicyComponent from "../../../components/PrivacyPolicyComponent";

const TripFormScreen = ({ theme, route, navigation }) => {
  const { colors } = theme;
  const { vehicle_id } = route.params;
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
    })();
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
      dispatch(removeImage());
      dispatch(removeCompanion());
    };
  }, []);

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
      "INSERT INTO offline_trip (user_id,vehicle_id, odometer, image, companion, others, locations, gas, date, charging) values (?,?,?,?,?,?,?,?,?,?)",
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
      ]
    );
    resetForm();
    dispatch(removeImage());
    onCloseLoadingBtn();

    navigation.navigate("OfficeMap");
  };

  const backAction = () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.navigate("DashboardStack");
      return true;
    }
    return false;
  };

  return (
    <>
      <Screen>
        <FlatList
          data={[{ id: "1" }]}
          renderItem={() => (
            <View
              style={{
                margin: 15,
                flex: 1,
                height: "100%",
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
                  If the autofill does not match the actual odometer, please
                  edit based on the actual odometer
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
                      <View>
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
                          <Text style={{ marginBottom: 8 }}>
                            Odometer Picture:
                          </Text>
                          <View
                            style={{ flexDirection: "row", marginBottom: 8 }}
                          >
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
                                name={
                                  image ? "ios-camera-reverse" : "ios-camera"
                                }
                                size={40}
                              />
                            </TouchableOpacity>
                          </View>
                          {touched.odometer_image_path &&
                            errors.odometer_image_path && (
                              <Text
                                style={{
                                  color: "red",
                                  fontSize: 14,
                                  padding: 5,
                                }}
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
                                      onPress={() =>
                                        dispatch(spliceCompanion(i))
                                      }
                                    >
                                      <Ionicons
                                        name={"close-circle"}
                                        size={20}
                                        color={colors.danger}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                              <Text
                                style={{ fontSize: 14, color: colors.primary }}
                              >
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
                      </View>
                    );
                  }}
                </Formik>
              </View>
            </View>
          )}
        />
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
