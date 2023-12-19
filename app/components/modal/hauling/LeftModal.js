import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, withTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import {
  leftModalChangeDestinationSchema,
  leftModalOthersSchema,
  leftModalSchema,
} from "../../../utility/schema/validation";
import { selectTable } from "../../../utility/sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import useDisclosure from "../../../hooks/useDisclosure";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

const LeftModal = ({
  showLeftModal,
  onCloseLeftModal,
  leftLoading,
  onSubmit,
  theme,
  destinationState,
  trip,
}) => {
  const { colors } = theme;

  const { destinationState: destination, setDestinationState: setDestination } =
    destinationState;

  const [destinations, setDestinations] = useState([]);
  const [loadingDestination, setLoadingDestination] = useState(true);
  const [hasItem, setHasItem] = useState(false);
  // const [destination, setDestination] = useState();

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

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
        visible={showLeftModal}
        onDismiss={() => {
          // onCloseLeftModal();
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
              onCloseLeftModal();
              setDestination(null);
            }}
          >
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={{
            item_count: "",
            destination: destination,
            destination_name: "",
          }}
          validationSchema={
            destination?.title === "Others"
              ? leftModalOthersSchema
              : (destination && destination?.title !== "Others") ||
                trip?.locations?.length <= 0
              ? leftModalChangeDestinationSchema
              : leftModalSchema
          }
          onSubmit={async (data, e) => {
            await onSubmit(data, e);
            handleCloseDropdown();
            setDestination(null);
          }}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => {
            useEffect(() => {
              if (values.item_count) {
                setHasItem(true);
                setDestination(null);
                setFieldValue("destination", null);
              } else {
                setHasItem(false);
              }
            }, [values]);

            return (
              <>
                {!!!hasItem && (
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
                {/* 
                {(!destination && !trip?.locations?.length) ||
                  (trip?.locations?.length <= 0 && (
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="item_count"
                      label="Item Count"
                      keyboardType="numeric"
                    />
                  ))} */}

                {(!trip?.locations?.length <= 0 ||
                  (!destination && trip?.locations?.length > 0)) &&
                  !leftLoading && (
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="item_count"
                      label="Item Count"
                      keyboardType="numeric"
                      disabled={destination}
                    />
                  )}

                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={leftLoading}
                  disabled={leftLoading}
                />
              </>
            );
          }}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default withTheme(LeftModal);
