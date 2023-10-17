import React, { useCallback, useEffect, useRef, useState } from "react";
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
import PrivacyPolicyComponent from "../../../components/PrivacyPolicyComponent";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

const DepotTripFormScreen = ({ theme, route: navigationRoute, navigation }) => {
  const { colors } = theme;
  const { vehicle_id } = navigationRoute.params;

  const image = useSelector((state) => state.image.value);
  const companion = useSelector((state) => state.companion.value);
  const user = useSelector((state) => state.token.userDetails);
  const dispatch = useDispatch();

  // DESTINATION AUTOCOMPLETE
  const dropdownController = useRef(null);
  const searchRef = useRef(null);

  const handleCloseDropdown = () => {
    if (dropdownController.current) {
      dropdownController.current.close();
    }
  };

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

  // TRIP TYPE - HAULING
  const [tripType, setTripType] = useState([]);
  const [tripTypeValue, setTripTypeValue] = useState(user?.trip_type || "null");

  const {
    isOpen: showTripTypeDropdown,
    onClose: onCloseTripTypeDropdown,
    onToggle: onToggleTripTypeDropdown,
  } = useDisclosure();

  // TRIP TYPE - DELIVERY
  const [tripTypeDelivery, setTripTypeDelivery] = useState([]);
  const [tripTypeDeliveryValue, setTripTypeDeliveryValue] = useState(
    user?.trip_type || "null"
  );

  const {
    isOpen: showTripTypeDeliveryDropdown,
    onClose: onCloseTripTypeDeliveryDropdown,
    onToggle: onToggleTripTypeDeliveryDropdown,
  } = useDisclosure();

  //

  // TRIP CATEGORY
  const depotTripCategory = useSelector(
    (state) => state?.depotTripCategory?.value
  );

  const [tripCategory, setTripCategory] = useState([]);
  const [tripCategoryValue, setTripCategoryValue] = useState(
    user?.trip_category ||
      depotTripCategory.charAt(0).toUpperCase() + depotTripCategory.slice(1)
  );

  const {
    isOpen: showTripCategoryDropdown,
    onClose: onCloseTripCategoryDropdown,
    onToggle: onToggleTripCategoryDropdown,
  } = useDisclosure();

  //
  const chexboxState = useDisclosure();

  const [destinationInitial, setDestinationInitial] = useState([]);

  // DESTINATION HAULING
  const [destinations, setDestinations] = useState([]);
  const [destination, setDestination] = useState("null");

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

  // DESTINATION DELIVERY

  // const [deliveryDestinations, setDeliveryDestinations] = useState([
  //   { value: "route", label: "Route", id: 0 },
  // ]);
  const [deliveryDestinations, setDeliveryDestinations] = useState([]);
  const [deliveryDestination, setDeliveryDestination] = useState();

  //

  const [formValues, setFormValues] = useState({
    odometer: "",
    others: "",
    temperature: "",
    odometer_image_path: image,
    companion: companion,
    trip_type: tripTypeValue,
    trip_category: tripCategoryValue,
    charging: value,
  });

  const [formSchema, setFormSchema] = useState(depotDefaultFormSchema);

  useEffect(() => {
    (async () => {
      const filterData = (data) => {
        return data.filter((obj) => obj.trip_template === "Depot");
      };

      setDestinationInitial(filterData(await selectTable("destination")));
      const tripType = await selectTable("trip_type");
      const tripCategory = await selectTable("trip_category");

      // TRIP CATETGORY

      const categoryFilteredData = filterData(tripCategory);

      setTripCategory([
        ...categoryFilteredData.map((obj) => {
          return { value: obj.category, label: obj.category };
        }),
      ]);

      // TRIP TYPE

      const haulingTypeFilteredData = filterData(tripType).filter(
        (obj) => obj.trip_category === "Hauling"
      );

      setTripType([
        ...haulingTypeFilteredData.map((obj) => {
          return { value: obj.type, label: obj.type };
        }),
      ]);

      const deliveryTypeFilteredData = filterData(tripType).filter(
        (obj) => obj.trip_category === "Delivery"
      );

      setTripTypeDelivery([
        ...deliveryTypeFilteredData.map((obj) => {
          return { value: obj.type, label: obj.type };
        }),
      ]);
    })();
  }, []);

  useEffect(() => {
    const destinationHaulingFilteredData = destinationInitial.filter(
      (obj) => obj.trip_type === tripTypeValue
    );
    // setDestinations([
    //   ...destinationHaulingFilteredData.map((obj) => {
    //     return { value: obj.destination, label: obj.destination };
    //   }),
    // ]);
    setDestinations([
      ...destinationHaulingFilteredData.map((obj, i) => {
        return { id: i, title: obj.destination };
      }),
    ]);
  }, [tripTypeValue]);

  useEffect(() => {
    const destinationDeliveryFilteredData = destinationInitial.filter(
      (obj) => obj.trip_type === tripTypeDeliveryValue
    );
    // setDeliveryDestinations([
    //   ...destinationDeliveryFilteredData.map((obj) => {
    //     return { value: obj.destination, label: obj.destination };
    //   }),
    // ]);
    setDeliveryDestinations([
      ...destinationDeliveryFilteredData.map((obj, i) => {
        return { id: i, title: obj.destination };
      }),
    ]);
  }, [tripTypeDeliveryValue]);

  useEffect(() => {
    // Update initial values and schema based on trip type
    if (tripCategoryValue?.toLowerCase() === "hauling") {
      setFormValues({
        odometer: "",
        others: "",
        tare_weight: "",
        odometer_image_path: image,
        companion: companion,
        charging: value,
        trip_type: tripTypeValue,
        trip_category: tripCategoryValue,
        destination: destination,
      });
      setFormSchema(haulingFormSchema);
    } else if (tripCategoryValue?.toLowerCase() === "delivery") {
      setFormValues({
        odometer: "",
        others: "",
        temperature: "",
        odometer_image_path: image,
        companion: companion,
        charging: value,
        trip_type: tripTypeValue,
        trip_category: tripCategoryValue,
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
        trip_category: tripCategoryValue,
        charging: value,
      });
      setFormSchema(depotDefaultFormSchema);
    }
  }, [tripCategoryValue]);

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
    handleCloseDropdown();
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
      tare_weight,
      trip_category
    )
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
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
        data?.trip_type,
        data?.destination,
        data?.tare_weight,
        data?.trip_category,
      ]
    );
    resetForm();
    dispatch(removeImage());
    onCloseLoadingBtn();
    navigation.navigate("Office", {
      screen: "OfficeMap",
      params: {
        trip_category: data?.trip_category,
      },
    });
  };

  const onSubmitDelivery = async (data, { resetForm }) => {
    onToggleLoadingBtn();
    handleCloseDropdown();
    Keyboard.dismiss();

    await insertToTable(
      `
    INSERT INTO depot_delivery (
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
      temperature,
      trip_category
    )
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
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
        data?.trip_type,
        data?.destination,
        data?.temperature,
        data?.trip_category,
      ]
    );

    resetForm();
    dispatch(removeImage());
    onCloseLoadingBtn();
    navigation.navigate("Office", {
      screen: "OfficeMap",
      params: {
        trip_category: data?.trip_category,
      },
    });
  };

  // DROPDOWN PICKER HANDLER

  const onTripTypeOpen = useCallback(() => {
    onCloseDestinationsDropdown();
    onCloseDropdown();
  });

  const onTripCategoryOpen = useCallback(() => {
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
                    tripCategoryValue?.toLowerCase() === "hauling"
                      ? onSubmitHauling
                      : tripCategoryValue?.toLowerCase() === "delivery"
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
                  }) => {
                    // Image validation
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

                          {/* TRIP CATEGORY */}
                          <Text style={styles.text}>Trip Category:</Text>
                          {tripCategory?.length !== 0 ? (
                            <DropDownPicker
                              listMode="SCROLLVIEW"
                              open={showTripCategoryDropdown}
                              onOpen={onTripCategoryOpen}
                              value={tripCategoryValue}
                              items={tripCategory}
                              onChangeValue={(value) => {
                                setFieldValue("trip_category", value);
                                setFieldValue("trip_type", null);
                                setFieldValue("destination", null);
                              }}
                              setOpen={onToggleTripCategoryDropdown}
                              setValue={setTripCategoryValue}
                              setItems={setTripCategory}
                              placeholder="Select Trip Category"
                              textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
                              style={{
                                borderRadius: 15,
                                borderColor: colors.light,
                                marginBottom:
                                  touched.trip_category && errors.trip_category
                                    ? 0
                                    : 12,
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
                          ) : (
                            <Text style={styles.text}>Loading...</Text>
                          )}
                          {/* TRIP TYPE ERROR HANDLING */}
                          {touched?.trip_category && errors?.trip_category && (
                            <Errors>{errors.trip_category}</Errors>
                          )}

                          {/* TRIP TYPE */}
                          {tripCategoryValue?.toLowerCase() === "hauling" && (
                            <>
                              {/* <Text style={styles.text}>Trip Type:</Text>
                              <DropDownPicker
                                listMode="SCROLLVIEW"
                                open={showTripTypeDropdown}
                                onOpen={onTripTypeOpen}
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
                                    touched.trip_type && errors.trip_type
                                      ? 0
                                      : 12,
                                  zIndex: 0,
                                }}
                                dropDownContainerStyle={{
                                  borderColor: colors.light,
                                  maxHeight: 150,
                                  // zIndex: 99,
                                }}
                                zIndex={3000}
                                zIndexInverse={1000}
                              /> */}
                              {/* TRIP TYPE ERROR HANDLING */}
                              {touched?.trip_type && errors?.trip_type && (
                                <Errors>{errors.trip_type}</Errors>
                              )}
                            </>
                          )}

                          {tripCategoryValue?.toLowerCase() === "delivery" && (
                            <>
                              {/* <Text style={styles.text}>Trip Type:</Text>
                              <DropDownPicker
                                listMode="SCROLLVIEW"
                                open={showTripTypeDeliveryDropdown}
                                onOpen={onTripTypeOpen}
                                value={tripTypeDeliveryValue}
                                items={tripTypeDelivery}
                                onChangeValue={(value) => {
                                  setFieldValue("trip_type", value);
                                }}
                                setOpen={onToggleTripTypeDeliveryDropdown}
                                setValue={setTripTypeDeliveryValue}
                                setItems={setTripTypeDelivery}
                                placeholder="Select Trip Type"
                                textStyle={{
                                  fontFamily: "Khyay",
                                  fontSize: 16,
                                }}
                                style={{
                                  borderRadius: 15,
                                  borderColor: colors.light,
                                  marginBottom:
                                    touched.trip_type && errors.trip_type
                                      ? 0
                                      : 12,
                                  zIndex: 0,
                                }}
                                dropDownContainerStyle={{
                                  borderColor: colors.light,
                                  maxHeight: 150,
                                  // zIndex: 99,
                                }}
                                zIndex={3000}
                                zIndexInverse={1000}
                              /> */}
                              {/* TRIP TYPE ERROR HANDLING */}
                              {touched?.trip_type && errors?.trip_type && (
                                <Errors>{errors.trip_type}</Errors>
                              )}
                            </>
                          )}

                          {/* DESTINATIONS */}

                          {tripCategoryValue !== undefined && (
                            // <Text style={styles.text}>Destinations:</Text>
                            <></>
                          )}
                          {tripCategoryValue?.toLowerCase() === "hauling" && (
                            // <DropDownPicker
                            //   id="destination"
                            //   listMode="SCROLLVIEW"
                            //   open={showDestinationsDropdown}
                            //   onOpen={onDestinationOpen}
                            //   value={destination}
                            //   items={destinations}
                            //   onChangeValue={(value) => {
                            //     setFieldValue("destination", value);
                            //   }}
                            //   setOpen={onToggleDestinationsDropdown}
                            //   setValue={setDestination}
                            //   setItems={setDestinations}
                            //   placeholder="Select Destination"
                            //   textStyle={{
                            //     fontFamily: "Khyay",
                            //     fontSize: 16,
                            //   }}
                            //   style={{
                            //     borderRadius: 15,
                            //     borderColor: colors.light,
                            //     marginBottom: errors.destination ? 0 : 12,
                            //     zIndex: 0,
                            //   }}
                            //   dropDownContainerStyle={{
                            //     borderColor: colors.light,
                            //     maxHeight: 150,
                            //     // zIndex: 99,
                            //   }}
                            //   zIndex={2000}
                            //   zIndexInverse={2000}
                            // />
                            // <AutocompleteDropdown
                            //   ref={searchRef}
                            //   controller={(controller) => {
                            //     dropdownController.current = controller;
                            //   }}
                            //   clearOnFocus={false}
                            //   onSelectItem={(value) => {
                            //     if (value) {
                            //       setFieldValue("destination", value?.title);
                            //     }
                            //   }}
                            //   dataSet={destinations}
                            //   containerStyle={{
                            //     marginBottom:
                            //       touched?.destination && errors?.destination
                            //         ? 5
                            //         : 16,
                            //   }}
                            //   inputContainerStyle={{
                            //     backgroundColor: colors.white,
                            //     borderRadius: 15,
                            //     borderColor: colors.light,
                            //     borderWidth: 1,
                            //   }}
                            //   inputHeight={50}
                            //   textInputProps={{
                            //     placeholder: "Destination",
                            //     autoCorrect: false,
                            //     autoCapitalize: "none",
                            //     style: {
                            //       fontFamily: "Khyay",
                            //       borderRadius: 25,
                            //       paddingLeft: 18,
                            //       fontSize: 16,
                            //     },
                            //   }}
                            // />
                            <></>
                          )}
                          {tripCategoryValue?.toLowerCase() === "delivery" && (
                            // <DropDownPicker
                            //   id="destination"
                            //   listMode="SCROLLVIEW"
                            //   open={showDestinationsDropdown}
                            //   onOpen={onDestinationOpen}
                            //   value={deliveryDestination}
                            //   items={deliveryDestinations}
                            //   onChangeValue={(value) => {
                            //     setFieldValue("destination", value);
                            //   }}
                            //   setOpen={onToggleDestinationsDropdown}
                            //   setValue={setDeliveryDestination}
                            //   setItems={setDeliveryDestinations}
                            //   placeholder="Select Destination"
                            //   textStyle={{
                            //     fontFamily: "Khyay",
                            //     fontSize: 16,
                            //   }}
                            //   style={{
                            //     borderRadius: 15,
                            //     borderColor: colors.light,
                            //     marginBottom: errors.destination ? 0 : 12,
                            //     zIndex: 0,
                            //   }}
                            //   dropDownContainerStyle={{
                            //     borderColor: colors.light,
                            //     maxHeight: 150,
                            //     // zIndex: 99,
                            //   }}
                            //   zIndex={2000}
                            //   zIndexInverse={2000}
                            // />
                            // <AutocompleteDropdown
                            //   ref={searchRef}
                            //   controller={(controller) => {
                            //     dropdownController.current = controller;
                            //   }}
                            //   clearOnFocus={false}
                            //   onSelectItem={(value) => {
                            //     if (value) {
                            //       setFieldValue("destination", value?.title);
                            //     }
                            //   }}
                            //   dataSet={deliveryDestinations}
                            //   containerStyle={{
                            //     marginBottom:
                            //       touched?.destination && errors?.destination
                            //         ? 5
                            //         : 16,
                            //   }}
                            //   inputContainerStyle={{
                            //     backgroundColor: colors.white,
                            //     borderRadius: 15,
                            //     borderColor: colors.light,
                            //     borderWidth: 1,
                            //   }}
                            //   inputHeight={50}
                            //   textInputProps={{
                            //     placeholder: "Destination",
                            //     autoCorrect: false,
                            //     autoCapitalize: "none",
                            //     style: {
                            //       fontFamily: "Khyay",
                            //       borderRadius: 25,
                            //       paddingLeft: 18,
                            //       fontSize: 16,
                            //     },
                            //   }}
                            // />
                            <></>
                          )}

                          {/* DESTINATION ERROR HANDLING */}
                          {values?.destination !== "" &&
                            errors?.destination && (
                              <Errors>{errors?.destination}</Errors>
                            )}

                          {/* TARE WEIGHT */}
                          {tripCategoryValue?.toLowerCase() === "hauling" && (
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
                          {tripCategoryValue?.toLowerCase() === "delivery" && (
                            <TextField
                              touched={touched}
                              errors={errors}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              values={values}
                              name="temperature"
                              label="Temperature °F"
                              keyboardType="numeric"
                            />
                          )}

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

                          <PrivacyPolicyComponent
                            navigation={navigation}
                            checkboxState={chexboxState}
                          />
                        </View>

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
