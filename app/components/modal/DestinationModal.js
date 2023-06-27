import React, { useState, useEffect, useRef } from "react";
import { Modal, Portal, Text, withTheme } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import SubmitButton from "../form/SubmitButton";
import {
  destinationOthersSchema,
  destinationSchema,
} from "../../utility/schema/validation";
import { selectTable } from "../../utility/sqlite";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import TextField from "../form/TextField";

const DestinationModal = ({
  isOpenDestination,
  onCloseDestination,
  loading,
  onSubmit,
  theme,
}) => {
  const { colors } = theme;
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
        visible={isOpenDestination}
        onDismiss={() => {
          onCloseDestination();
          handleCloseDropdown();
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
          }}
        >
          <TouchableOpacity
            onPress={() => {
              onCloseDestination();
              handleCloseDropdown();
            }}
          >
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={{ destination: destination, destination_name: "" }}
          validationSchema={
            destination?.title === "OTHER LOCATION"
              ? destinationOthersSchema
              : destinationSchema
          }
          onSubmit={async (data, e) => {
            await onSubmit(data, e);
            setDestination(null);
          }}
        >
          {({
            handleSubmit,
            errors,
            touched,
            values,
            setFieldValue,
            handleChange,
            handleBlur,
          }) => {
            return (
              <>
                <AutocompleteDropdown
                  ref={searchRef}
                  controller={(controller) => {
                    dropdownController.current = controller;
                  }}
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

                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={loading}
                  disabled={loading}
                />
              </>
            );
          }}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default withTheme(DestinationModal);