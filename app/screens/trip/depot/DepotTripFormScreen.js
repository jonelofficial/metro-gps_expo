import React, { useCallback, useEffect, useState } from "react";
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
import {
  deliveryFormSchema,
  depotDefaultFormSchema,
  haulingFormSchema,
} from "../../../utility/schema/validation";
import AppCamera from "../../../components/AppCamera";
import Scanner from "../../../components/Scanner";
import moment from "moment-timezone";

const DepotTripFormScreen = ({ theme, route: navigationRoute, navigation }) => {
  const { colors } = theme;
  const { vehicle_id } = navigationRoute.params;
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

  const backAction = () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.navigate("DashboardStack");
      return true;
    }
    return false;
  };

  // TRIP TYPE
  const [tripType, setTripType] = useState([
    { value: "hauling", label: "Hauling", id: 0 },
    { value: "delivery", label: "Delivery", id: 1 },
  ]);
  const [tripTypeValue, setTripTypeValue] = useState(user?.trip_type);

  const {
    isOpen: showTripTypeDropdown,
    onClose: onCloseTripTypeDropdown,
    onToggle: onToggleTripTypeDropdown,
  } = useDisclosure();

  //

  // DESTINATION HAULING
  const [destinations, setDestinations] = useState([
    { value: "farm", label: "Farm", id: 0 },
  ]);
  const [destination, setDestination] = useState();

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

  // DESTINATION DELIVERY

  const [deliveryDestinations, setDeliveryDestinations] = useState([
    { value: "route", label: "Route", id: 0 },
  ]);
  const [deliveryDestination, setDeliveryDestination] = useState();

  //

  const [formValues, setFormValues] = useState({
    odometer: "",
    others: "",
    temperature: "",
    odometer_image_path: image,
    companion: companion,
    trip_type: tripTypeValue,
    charging: value,
  });

  const [formSchema, setFormSchema] = useState(depotDefaultFormSchema);

  useEffect(() => {
    // Update initial values and schema based on trip type
    if (tripTypeValue === "hauling") {
      setFormValues({
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
      });
      setFormSchema(haulingFormSchema);
    } else if (tripTypeValue === "delivery") {
      setFormValues({
        odometer: "",
        others: "",
        route: "",
        temperature: "",
        odometer_image_path: image,
        companion: companion,
        charging: value,
        trip_type: tripTypeValue,
        destination: deliveryDestination,
      });
      setFormSchema(deliveryFormSchema);
    } else {
      setFormValues({
        odometer: "",
        others: "",
        temperature: "",
        odometer_image_path: image,
        companion: companion,
        trip_type: tripTypeValue,
        charging: value,
      });
      setFormSchema(depotDefaultFormSchema);
    }
  }, [tripTypeValue]);

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

  const onSubmitHauling = async (data, { resetForm }) => {
    onToggleLoadingBtn();
    Keyboard.dismiss();

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
    navigation.navigate("Office", {
      screen: "OfficeMap",
      params: {
        trip_type: data?.trip_type,
      },
    });
  };

  const onSubmitDelivery = (data) => {
    console.log(data);
  };

  // DROPDOWN PICKER HANDLER

  const onTripTypeOpen = useCallback(() => {
    onCloseDestinationsDropdown();
    onCloseDropdown();
  });

  const onDestinationOpen = useCallback(() => {
    onCloseDropdown();
    onCloseTripTypeDropdown();
  });

  const onChargingOpen = useCallback(() => {
    onCloseTripTypeDropdown();
    onCloseDestinationsDropdown();
  });

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
                  onSubmit={
                    tripTypeValue === "hauling"
                      ? onSubmitHauling
                      : tripTypeValue === "delivery"
                      ? onSubmitDelivery
                      : null
                  }
                  initialValues={formValues}
                  validationSchema={formSchema}
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
                    setFieldTouched,
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
                          <View style={[styles.text, { flexDirection: "row" }]}>
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
                            listMode="SCROLLVIEW"
                            open={showTripTypeDropdown}
                            onOpen={onTripTypeOpen}
                            value={tripTypeValue}
                            items={tripType}
                            onChangeValue={(value) => {
                              handleChange(value);
                              setFieldValue("trip_type", value);
                            }}
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
                              // zIndex: 99,
                            }}
                            zIndex={3000}
                            zIndexInverse={1000}
                          />
                          {/* TRIP TYPE ERROR HANDLING */}
                          {touched?.trip_type && errors?.trip_type && (
                            <Errors>{errors.trip_type}</Errors>
                          )}

                          {/* DESTINATIONS */}

                          {tripTypeValue !== undefined && (
                            <Text style={styles.text}>Destinations:</Text>
                          )}
                          {tripTypeValue === "hauling" && (
                            <DropDownPicker
                              listMode="SCROLLVIEW"
                              open={showDestinationsDropdown}
                              onOpen={onDestinationOpen}
                              value={destination}
                              items={destinations}
                              onChangeValue={(value) => {
                                handleChange(value);
                                setFieldValue("destination", value);
                                setFieldValue("farm", value);
                              }}
                              setOpen={onToggleDestinationsDropdown}
                              setValue={setDestination}
                              setItems={setDestinations}
                              placeholder="Select Destination"
                              textStyle={{
                                fontFamily: "Khyay",
                                fontSize: 16,
                              }}
                              style={{
                                borderRadius: 15,
                                borderColor: colors.light,
                                marginBottom: errors.destination ? 0 : 12,
                                zIndex: 0,
                              }}
                              dropDownContainerStyle={{
                                borderColor: colors.light,
                                maxHeight: 150,
                                // zIndex: 99,
                              }}
                              zIndex={2000}
                              zIndexInverse={2000}
                            />
                          )}
                          {tripTypeValue === "delivery" && (
                            <DropDownPicker
                              listMode="SCROLLVIEW"
                              open={showDestinationsDropdown}
                              onOpen={onDestinationOpen}
                              value={deliveryDestination}
                              items={deliveryDestinations}
                              onChangeValue={(value) => {
                                handleChange(value);
                                setFieldValue("destination", value);
                                setFieldValue("route", value);
                              }}
                              setOpen={onToggleDestinationsDropdown}
                              setValue={setDeliveryDestination}
                              setItems={setDeliveryDestinations}
                              placeholder="Select Destination"
                              textStyle={{
                                fontFamily: "Khyay",
                                fontSize: 16,
                              }}
                              style={{
                                borderRadius: 15,
                                borderColor: colors.light,
                                marginBottom: errors.destination ? 0 : 12,
                                zIndex: 0,
                              }}
                              dropDownContainerStyle={{
                                borderColor: colors.light,
                                maxHeight: 150,
                                // zIndex: 99,
                              }}
                              zIndex={2000}
                              zIndexInverse={2000}
                            />
                          )}

                          {/* DESTINATION ERROR HANDLING */}
                          {tripTypeValue !== undefined &&
                            errors?.destination && (
                              <Errors>{errors?.destination}</Errors>
                            )}

                          {/* ROUTE */}
                          {tripTypeValue === "delivery" && (
                            <TextField
                              touched={{ route: true }}
                              errors={errors}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              values={values}
                              name="route"
                              label="Route (Autofill)"
                              editable={false}
                            />
                          )}

                          {/* FARM */}
                          {tripTypeValue === "hauling" && (
                            <TextField
                              touched={{ farm: true }}
                              errors={errors}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              values={values}
                              name="farm"
                              label="Farm (Autofill)"
                              editable={false}
                            />
                          )}

                          {/* TARE WEIGHT */}
                          {tripTypeValue === "hauling" && (
                            <TextField
                              touched={{ tare_weight: true }}
                              errors={errors}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              values={values}
                              name="tare_weight"
                              label="Tare Weight"
                              keyboardType="numeric"
                            />
                          )}

                          {/* TEMPERATURE */}
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

                          {/* CHARGING */}
                          <Text style={styles.text}>Charging:</Text>
                          {departments && departments.length !== 0 && (
                            <DropDownPicker
                              listMode="SCROLLVIEW"
                              open={showDropdown}
                              onOpen={onChargingOpen}
                              value={value}
                              items={departments}
                              onChangeValue={(value) => {
                                handleChange(value);
                                setFieldValue("charging", value);
                              }}
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
                                // zIndex: 99,
                              }}
                              zIndex={1000}
                              zIndexInverse={3000}
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
                            <View style={{ flexDirection: "row" }}>
                              <TouchableOpacity onPress={onToggleScanner}>
                                <Text style={styles.companionBtn}>
                                  Add Companion
                                </Text>
                              </TouchableOpacity>
                            </View>
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
