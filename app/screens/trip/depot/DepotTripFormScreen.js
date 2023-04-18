import React, { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, withTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { removeImage } from "../../../redux-toolkit/counter/imageSlice";
import {
  removeCompanion,
  spliceCompanion,
} from "../../../redux-toolkit/counter/companionSlice";
import { insertToTable, selectTable } from "../../../utility/sqlite";
import useDisclosure from "../../../hooks/useDisclosure";
import Screen from "../../../components/Screen";
import { Formik } from "formik";
import SubmitButton from "../../../components/form/SubmitButton";
import TextField from "../../../components/form/TextField";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { haulingFormSchema } from "../../../utility/schema/validation";
import AppCamera from "../../../components/AppCamera";
import Scanner from "../../../components/Scanner";
import moment from "moment-timezone";

const DepotTripFormScreen = ({ theme, route, navigation }) => {
  const { colors } = theme;
  const { vehicle_id } = route.params;
  const image = useSelector((state) => state.image.value);
  const companion = useSelector((state) => state.companion.value);
  const user = useSelector((state) => state.token.userDetails);
  const dispatch = useDispatch();

  // CHARGING
  const [departments, setDepartments] = useState([]);
  const [value, setValue] = useState(user?.department);

  const {
    isOpen: showDropdown,
    onClose: onCloseDropdown,
    onToggle: onToggleDropdown,
  } = useDisclosure();

  //

  // TRIP TYPE
  const [tripType, setTripType] = useState([
    { value: "hauling", label: "Hauling" },
    { value: "delivery", label: "Delivery" },
  ]);
  const [tripTypeValue, setTripTypeValue] = useState(user?.trip_type);

  const {
    isOpen: showTripTypeDropdown,
    onClose: onCloseTripTypeDropdown,
    onToggle: onToggleTripTypeDropdown,
  } = useDisclosure();

  //

  // DESTINATION
  const [destinations, setDestinations] = useState([
    { value: "hauling", label: "Hauling" },
    { value: "delivery", label: "Delivery" },
  ]);
  const [destination, setDestination] = useState();

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

  //

  const backAction = () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.navigate("DashboardStack");
      return true;
    }
    return false;
  };

  useEffect(() => {
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

    console.log(data);

    await insertToTable(
      `
    INSERT INTO depot_hauling (
      user_id,
      vehicle_id,
      odometer,
      image,
      companion,
      others,
      locations,
      gas,
      date,
      charging,
      trip_type,
      destination,
      farm,
      temperature,
      tare_weight,
      gross_weight,
      net_weight
    )
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
      [
        user?.userId,
        vehicle_id._id,
        data.odometer,
        JSON.stringify({
          name: new Date() + "_odometer",
          uri: data.odometer_image_path?.uri || null,
          type: "image/jpg",
        }),
        JSON.stringify(companion),
        data.others,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(moment(Date.now()).tz("Asia/Manila")),
        data?.charging,
        data?.trip_type,
        data?.destination,
        data?.farm,
        JSON.stringify([data?.temperature]),
        JSON.stringify([data?.tare_weight]),
        JSON.stringify([]),
        JSON.stringify([]),
      ]
    );

    resetForm();
    dispatch(removeImage());
    onCloseLoadingBtn();
    // navigation.navigate("OfficeMap");
  };

  const Errors = ({ children }) => {
    return (
      <Text style={{ color: "red", fontSize: 14, padding: 5 }}>{children}</Text>
    );
  };

  const styles = StyleSheet.create({
    container: { margin: 15, flex: 1 },
    vehiclePlateContainer: {
      padding: 30,
      marginBottom: 15,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.white,
    },
    vehiclePlate: { fontSize: 13, color: colors.light },
    text: {
      marginBottom: 8,
    },
    formWrapper: { flex: 1, justifyContent: "space-between" },
    imageLayout: {
      width: 100,
      height: 100,
      marginRight: 10,
      borderRadius: 10,
    },
    companionBtn: { fontSize: 14, color: colors.primary },
    companionWrapper: {
      marginBottom: 5,
      flexDirection: "row",
    },
    companionText: { marginRight: 10, textTransform: "capitalize" },
  });

  return (
    <>
      <Screen>
        <FlatList
          data={[{ id: "1" }]}
          renderItem={() => (
            <View style={styles.container}>
              {/* PLATE DETAILS */}
              <View style={styles.vehiclePlateContainer}>
                <Text>Vehicle Plate: {vehicle_id?.plate_no}</Text>
              </View>

              {/* REMINDER */}
              <View>
                <Text style={styles.vehiclePlate}>
                  If the autofill does not match the actual odometer, please
                  edit based on the actual odometer.
                </Text>
              </View>

              {/* FORM */}
              <View style={styles.formWrapper}>
                <Formik
                  onSubmit={onSubmit}
                  initialValues={{
                    odometer: "",
                    others: "",
                    tare_weight: "",
                    farm: "",
                    temperature: "",
                    odometer_image_path: image,
                    companion: companion,
                    charging: value,
                    trip_type: tripTypeValue,
                    destination: destination,
                  }}
                  validationSchema={haulingFormSchema}
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
                    // Image validation
                    useEffect(() => {
                      if (image) {
                        setFieldValue("odometer_image_path", image);
                        setErrors("odometer_image_path", null);
                      }

                      return () => {
                        null;
                      };
                    }, [image]);

                    // Companion validation
                    useEffect(() => {
                      if (companion) {
                        setFieldValue("companion", companion);
                        setErrors("companion", null);
                      }

                      return () => {
                        null;
                      };
                    }, [companion]);

                    // Charging validation
                    useEffect(() => {
                      if (value !== "") {
                        setFieldValue("charging", value);
                        setErrors("charging", null);
                      }

                      return () => {
                        null;
                      };
                    }, [value]);

                    // Trip type validation
                    useEffect(() => {
                      if (tripTypeValue !== "") {
                        setFieldValue("trip_type", tripTypeValue);
                        setErrors("trip_type", null);
                      }

                      return () => {
                        null;
                      };
                    }, [tripTypeValue]);

                    // Destinations validation
                    useEffect(() => {
                      if (destination !== "") {
                        setFieldValue("destination", destination);
                        setErrors("destination", null);
                        setFieldValue("farm", destination && "testing");
                        setErrors("farm", null);
                      }

                      return () => {
                        null;
                      };
                    }, [destination]);
                    return (
                      <>
                        <View>
                          {/* ODOMETER */}
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

                          {/* ODOMETER IMAGE */}
                          <Text style={styles.text}>Odometer Picture:</Text>
                          <View style={styles.text}>
                            {image && (
                              <Image
                                source={{ uri: image?.uri }}
                                style={styles.imageLayout}
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
                          {/* ODOMETER IAMGE ERROR HANDLING */}
                          {touched.odometer_image_path &&
                            errors.odometer_image_path && (
                              <Errors>
                                {errors?.odometer_image_path &&
                                  "Odometer Picture is a required field"}
                              </Errors>
                            )}

                          {/* TRIP TYPE */}
                          <Text style={styles.text}>Trip Type:</Text>
                          <DropDownPicker
                            open={showTripTypeDropdown}
                            value={tripTypeValue}
                            items={tripType}
                            onChangeValue={handleChange}
                            setOpen={onToggleTripTypeDropdown}
                            setValue={setTripTypeValue}
                            setItems={setTripType}
                            placeholder="Select Trip Type"
                            textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
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
                              zIndex: 99,
                            }}
                          />
                          {/* TRIP TYPE ERROR HANDLING */}
                          {touched?.trip_type && errors?.trip_type && (
                            <Errors>{errors.trip_type}</Errors>
                          )}

                          {/* DESTINATIONS */}
                          <Text style={styles.text}>Destinations:</Text>
                          <DropDownPicker
                            open={showDestinationsDropdown}
                            value={destination}
                            items={destinations}
                            onChangeValue={handleChange}
                            setOpen={onToggleDestinationsDropdown}
                            setValue={setDestination}
                            setItems={setDestinations}
                            placeholder="Select Destination"
                            textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
                            style={{
                              borderRadius: 15,
                              borderColor: colors.light,
                              marginBottom:
                                touched.destination && errors.destination
                                  ? 0
                                  : 12,
                              zIndex: 0,
                            }}
                            dropDownContainerStyle={{
                              borderColor: colors.light,
                              maxHeight: 150,
                              zIndex: 99,
                            }}
                          />
                          {/* DESTINATION ERROR HANDLING */}
                          {touched?.destination && errors?.destination && (
                            <Errors>{errors.destination}</Errors>
                          )}

                          {/* FARM */}
                          <TextField
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            values={values}
                            name="farm"
                            label="Farm (Autofill)"
                            editable={false}
                          />

                          {/* ODOMETER */}
                          <TextField
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            values={values}
                            name="temperature"
                            label="Temperature"
                            keyboardType="numeric"
                          />

                          {/* TARE WEIGHT */}
                          <TextField
                            touched={touched}
                            errors={errors}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            values={values}
                            name="tare_weight"
                            label="Tare Weight"
                            keyboardType="numeric"
                          />

                          {/* CHARGING */}
                          <Text style={styles.text}>Charging:</Text>
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
                                zIndex: 0,
                              }}
                              dropDownContainerStyle={{
                                borderColor: colors.light,
                                maxHeight: 150,
                                zIndex: 99,
                              }}
                            />
                          )}

                          {/* CHARGING ERROR HANDLING */}
                          {touched?.charging && errors?.charging && (
                            <Errors>{errors.charging}</Errors>
                          )}

                          {/* COMPANION */}
                          <Text style={styles.text}>Companion:</Text>
                          <View style={styles.text}>
                            {companion.length > 0 &&
                              companion.map((item, i) => (
                                <View key={i} style={styles.companionWrapper}>
                                  <Text style={styles.companionText}>
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
                            <TouchableOpacity onPress={onToggleScanner}>
                              <Text style={styles.companionBtn}>
                                Add Companion
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* OTHERS */}
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

                        <SubmitButton
                          onPress={handleSubmit}
                          title="Drive"
                          isLoading={showLoadingBtn}
                        />
                      </>
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

export default withTheme(DepotTripFormScreen);
