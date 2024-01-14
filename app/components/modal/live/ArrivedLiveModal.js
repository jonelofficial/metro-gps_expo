import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  Button,
  Checkbox,
  Dialog,
  Modal,
  Portal,
  Text,
  withTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import {
  arrivedLiveModalOthersSchema,
  arrivedLiveModalSchema,
} from "../../../utility/schema/validation";
import { selectTable } from "../../../utility/sqlite";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { useRef } from "react";
import useDisclosure from "../../../hooks/useDisclosure";

const ArrivedModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
  checkboxState,
  theme,
  totalBags,
  currentBags,
  currentOdo,
  onArrived,
}) => {
  const { colors } = theme;
  const { lastDelivery, onToggleLastDelivery } = checkboxState;
  const { isOpen, onClose, onToggle } = useDisclosure();
  const [loadingDestination, setLoadingDestination] = useState(true);
  const [destination, setDestination] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const dropdownController = useRef(null);
  const searchRef = useRef(null);

  const handleCloseDropdown = () => {
    if (dropdownController.current) {
      dropdownController.current.close();
    }
  };

  useEffect(() => {
    (async () => {
      const sgDestination = await selectTable("sg_destination");

      await sgDestination.map(({ location, id }) => {
        setDestinations((prevState) => [
          ...prevState,
          { id: id, title: location },
        ]);
      });

      setLoadingDestination(false);
    })();

    return () => {
      null;
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={showArrivedModal}
        onDismiss={() => {
          // onCloseArrivedModal();
          // handleCloseDropdown();
          // setDestination(null);
        }}
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
          <TouchableOpacity
            onPress={() => {
              onCloseArrivedModal();
              handleCloseDropdown();
              setDestination(null);
            }}
          >
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>
        <Formik
          initialValues={{
            total_bags_delivered: "",
            // destination: destination,
            // destination_name: "",
            // arrivedOdo: "",
          }}
          validationSchema={
            destination?.title === "OTHER LOCATION"
              ? arrivedLiveModalOthersSchema
              : arrivedLiveModalSchema
          }
          onSubmit={async (data, { resetForm }) => {
            await onSubmit(data, { resetForm });
            handleCloseDropdown();
            setDestination(null);
          }}
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
              if (values?.total_bags_delivered == totalBags - currentBags) {
                onToggle();
              }
              if (!values?.total_bags_delivered && lastDelivery) {
                onToggleLastDelivery();
              }
              return () => {};
            }, [values?.total_bags_delivered]);

            return (
              <>
                {/* <AutocompleteDropdown
                  ref={searchRef}
                  controller={(controller) => {
                    dropdownController.current = controller;
                  }}
                  clearOnFocus={false}
                  // onBlur={handleCloseDropdown}
                  onSelectItem={(value) => {
                    if (value) {
                      setFieldValue("destination", value?.title);
                      setDestination(value);
                    }
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
                /> */}
                {/* TRIP TYPE ERROR HANDLING */}
                {/* {touched?.destination && errors?.destination && (
                  <Text style={{ color: "red", fontSize: 14, padding: 5 }}>
                    {errors.destination}
                  </Text>
                )} */}

                {/* {destination?.title === "OTHER LOCATION" && (
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="destination_name"
                    label="Destination Name"
                  />
                )} */}

                {/* {onArrived && (
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
                  parseFloat(currentOdo) == parseFloat(values["arrivedOdo"])) &&
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
                  )} */}

                <Text
                  style={{
                    color: "#9e9e9e",
                    fontSize: 14,
                    padding: 5,
                    marginTop: -10,
                  }}
                >
                  Remaining: {totalBags - currentBags} bags
                </Text>
                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="total_bags_delivered"
                  label="Total bags delivered"
                  keyboardType="numeric"
                />
                {values?.total_bags_delivered > totalBags - currentBags && (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 14,
                      padding: 5,
                      marginTop: -10,
                    }}
                  >
                    Total bag delivered should not greater than remaining bags.
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      width: "10%",
                    }}
                  >
                    <Checkbox
                      status={lastDelivery ? "checked" : "unchecked"}
                      onPress={!lastDelivery ? onToggle : onToggleLastDelivery}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: "justify",
                      fontSize: 14,
                    }}
                  >
                    Last delivery.
                  </Text>
                </View>

                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={arrivedLoading}
                  disabled={
                    arrivedLoading ||
                    values?.total_bags_delivered > totalBags - currentBags
                    // ||
                    // ((parseFloat(currentOdo) ==
                    //   parseFloat(values["arrivedOdo"]) ||
                    //   parseFloat(currentOdo) >
                    //     parseFloat(values["arrivedOdo"])) &&
                    //   onArrived)
                  }
                />
              </>
            );
          }}
        </Formik>
      </Modal>

      <Dialog visible={isOpen} onDismiss={onClose}>
        <Dialog.Title>Hold on!</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure that this will be the last delivery?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} labelStyle={{ color: colors.light }}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              onToggleLastDelivery();
              onClose();
            }}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default withTheme(ArrivedModal);
