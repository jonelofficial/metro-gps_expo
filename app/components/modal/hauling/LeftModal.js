import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, withTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import {
  leftModalChangeDestinationSchema,
  leftModalSchema,
} from "../../../utility/schema/validation";
import { selectTable } from "../../../utility/sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import useDisclosure from "../../../hooks/useDisclosure";

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
  // const [destination, setDestination] = useState();

  const {
    isOpen: showDestinationsDropdown,
    onClose: onCloseDestinationsDropdown,
    onToggle: onToggleDestinationsDropdown,
  } = useDisclosure();

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
      setDestinations([
        ...destinations.map((obj) => {
          return { value: obj.destination, label: obj.destination };
        }),
      ]);
    })();
  }, []);

  return (
    <Portal>
      <Modal
        visible={showLeftModal}
        onDismiss={() => {
          onCloseLeftModal();
          setDestination(null);
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
          }}
          validationSchema={
            destination ? leftModalChangeDestinationSchema : leftModalSchema
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
                <DropDownPicker
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
                />
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
