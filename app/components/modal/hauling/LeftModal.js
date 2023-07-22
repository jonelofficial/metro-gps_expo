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
}) => {
  const { colors } = theme;

  const { destinationState: destination, setDestinationState: setDestination } =
    destinationState;

  const [destinations, setDestinations] = useState([]);
  const [loadingDestination, setLoadingDestination] = useState(true);

  // const [destination, setDestination] = useState();

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

  const dropdownController = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await selectTable("depot_hauling");
      const destinationRes = await selectTable("destination");
      const destinations = destinationRes.filter(
        (obj) =>
          obj.trip_template === "Depot" &&
          obj.trip_category === res[res?.length - 1].trip_category &&
          obj.trip_type === res[res?.length - 1].trip_type
      );
      destinations.push({ destination: "Others" });
      // setDestinations([
      //   ...destinations.map((obj) => {
      //     return { value: obj.destination, label: obj.destination };
      //   }),
      // ]);
      setDestinations([
        ...destinations.map((obj, i) => {
          return { id: i, title: obj.destination };
        }),
      ]);
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
          initialValues={{
            item_count: "",
            destination: destination,
            destination_name: "",
          }}
          validationSchema={
            destination?.title === "Others"
              ? leftModalOthersSchema
              : destination && destination?.title !== "Others"
              ? leftModalChangeDestinationSchema
              : leftModalSchema
          }
          onSubmit={onSubmit}
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
            return (
              <>
                {/* <DropDownPicker
                  id="destination"
                  listMode="SCROLLVIEW"
                  open={showDestinationsDropdown}
                  CloseIconComponent={() => {
                    console.log("click close");
                  }}
                  value={destination}
                  items={destinations}
                  onChangeValue={(value) => {
                    setFieldValue("destination", value);
                  }}
                  setOpen={onToggleDestinationsDropdown}
                  setValue={setDestination}
                  setItems={setDestinations}
                  placeholder={
                    !destinations
                      ? "Loading..."
                      : "Change Destination (Optional)"
                  }
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
                  }}
                  zIndex={2000}
                  zIndexInverse={2000}
                /> */}

                <AutocompleteDropdown
                  ref={searchRef}
                  controller={(controller) => {
                    dropdownController.current = controller;
                  }}
                  clearOnFocus={false}
                  closeOnBlur={true}
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
                />
                {destination?.title === "Others" && (
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

                {!destination && (
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
