import React, { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text, withTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import {
  arrivedModalFullSchema,
  arrivedModalSchema,
} from "../../../utility/schema/validation";
import { useState } from "react";
import { useEffect } from "react";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { selectTable } from "../../../utility/sqlite";

const ArrivedModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
  tareWeight,
  theme,
  itemCount,
  currentOdo,
  onArrived,
}) => {
  const { colors } = theme;
  const [formSchema, setFormSchema] = useState(arrivedModalSchema);

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    itemCount && setFormSchema(arrivedModalFullSchema);

    return () => {
      null;
    };
  }, [itemCount]);

  const [destinations, setDestinations] = useState([]);
  const [destination, setDestination] = useState(null);
  const [loadingDestination, setLoadingDestination] = useState(true);

  const dropdownController = useRef(null);
  const searchRef = useRef(null);

  const handleCloseDropdown = () => {
    if (dropdownController.current) {
      dropdownController.current.close();
    }
  };

  useEffect(() => {
    (async () => {
      // const res = await selectTable("depot_hauling");
      // const destinationRes = await selectTable("destination");
      // const destinations = destinationRes.filter(
      //   (obj) =>
      //     obj.trip_template === "Depot" &&
      //     obj.trip_category === res[res?.length - 1].trip_category &&
      //     obj.trip_type === res[res?.length - 1].trip_type
      // );
      // destinations.push({ destination: "Others" });
      // setDestinations([
      //   ...destinations.map((obj) => {
      //     return { value: obj.destination, label: obj.destination };
      //   }),
      // ]);
      // setDestinations([
      //   ...destinations.map((obj, i) => {
      //     return { id: i, title: obj.destination };
      //   }),
      // ]);
      const sgDestination = await selectTable("sg_destination");

      const newDestinations = sgDestination.map(({ location, id }) => ({
        id,
        title: location,
      }));
      setDestinations((prevState) => [...prevState, ...newDestinations]);

      setLoadingDestination(false);
    })();
  }, []);

  return (
    <Portal>
      <Modal
        visible={showArrivedModal}
        onDismiss={onCloseArrivedModal}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 20,
        }}
      >
        <View
          style={{
            alignItems: "flex-end",
            marginBottom: 8,
          }}
        >
          <TouchableOpacity onPress={onCloseArrivedModal}>
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={{
            net_weight: "",
            gross_weight: "",
            doa_count: "",
            destination: destination,
            arrivedOdo: "",
          }}
          validationSchema={formSchema}
          onSubmit={onSubmit}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => {
            useEffect(() => {
              if (values?.gross_weight > 0) {
                const value = values?.gross_weight - tareWeight;
                setFieldValue("net_weight", `${value.toFixed(1)}`);
              }

              if (
                values?.gross_weight !== "" &&
                parseInt(values?.gross_weight) <= parseInt(tareWeight)
              ) {
                setShowError(true);
              } else {
                setShowError(false);
              }
              return () => {
                null;
              };
            }, [values?.gross_weight]);

            return (
              <>
                <>
                  <AutocompleteDropdown
                    ref={searchRef}
                    controller={(controller) => {
                      dropdownController.current = controller;
                    }}
                    clearOnFocus={false}
                    onSelectItem={(value) => {
                      if (value) {
                        setFieldValue("destination", value?.title);
                        setDestination(value);
                      }
                    }}
                    onClear={() => {
                      setDestination(null);
                    }}
                    dataSet={destinations}
                    loading={loadingDestination}
                    containerStyle={{
                      marginBottom:
                        touched?.destination && errors?.destination ? 5 : 16,
                    }}
                    inputContainerStyle={{
                      backgroundColor: colors.white,
                      borderRadius: 15,
                      borderColor: colors.light,
                      borderWidth: 1,
                    }}
                    inputHeight={50}
                    textInputProps={{
                      placeholder: "Destination",
                      autoCorrect: false,
                      autoCapitalize: "none",
                      style: {
                        fontFamily: "Khyay",
                        borderRadius: 25,
                        paddingLeft: 18,
                        fontSize: 16,
                      },
                    }}
                  />
                  {/* TRIP TYPE ERROR HANDLING */}
                  {touched?.destination && errors?.destination && (
                    <Text style={{ color: "red", fontSize: 14, padding: 5 }}>
                      {errors.destination}
                    </Text>
                  )}

                  {destination?.title === "OTHER LOCATION" && (
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="destination_name"
                      label="Destination Name"
                    />
                  )}

                  {onArrived && (
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="arrivedOdo"
                      label="Vehicle Odometer"
                      keyboardType="numeric"
                      defaultValue={values["arrivedOdo"]}
                    />
                  )}
                  {(parseFloat(currentOdo) > parseFloat(values["arrivedOdo"]) ||
                    parseFloat(currentOdo) ==
                      parseFloat(values["arrivedOdo"])) &&
                    onArrived &&
                    !arrivedLoading && (
                      <Text
                        style={{
                          color: "red",
                          fontSize: 14,
                          padding: 5,
                          marginTop: -10,
                        }}
                      >
                        Done odometer must be greater than previous odometer
                        inputted.
                      </Text>
                    )}

                  {itemCount && (
                    <>
                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="gross_weight"
                        label="Gross Weight"
                        keyboardType="numeric"
                      />
                      {showError && (
                        <Text
                          style={{
                            color: "red",
                            fontSize: 14,
                            padding: 5,
                            marginTop: -10,
                          }}
                        >
                          Gross weight should not be less than the tare weight
                        </Text>
                      )}
                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="net_weight"
                        label="Net Weight (Auto-fill)"
                        keyboardType="numeric"
                        disabled={true}
                      />
                      <TextField
                        touched={touched}
                        errors={errors}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        values={values}
                        name="doa_count"
                        label="DOA Count"
                        keyboardType="numeric"
                      />
                    </>
                  )}
                </>
                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={arrivedLoading}
                  disabled={
                    arrivedLoading ||
                    showError ||
                    ((parseFloat(currentOdo) ==
                      parseFloat(values["arrivedOdo"]) ||
                      parseFloat(currentOdo) >
                        parseFloat(values["arrivedOdo"])) &&
                      onArrived)
                  }
                />
              </>
            );
          }}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default withTheme(ArrivedModal);
