import React, { useState, useEffect } from "react";
import { Modal, Portal, Text, withTheme } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import SubmitButton from "../form/SubmitButton";
import useDisclosure from "../../hooks/useDisclosure";
import DropDownPicker from "react-native-dropdown-picker";
import { destinationSchema } from "../../utility/schema/validation";

const DestinationModal = ({
  isOpenDestination,
  onCloseDestination,
  theme,
  loading,
  onSubmit,
}) => {
  const { colors } = theme;
  const [destination, setDestination] = useState();
  const [destinations, setDestinations] = useState([
    { value: "test", label: "test" },
  ]);

  const { isOpen, onClose, onToggle } = useDisclosure();

  useEffect(() => {
    (async () => {})();
    return () => {
      null;
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={isOpenDestination}
        onDismiss={onCloseDestination}
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
          <TouchableOpacity onPress={onCloseDestination}>
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={{ destination: destination }}
          validationSchema={destinationSchema}
          onSubmit={onSubmit}
        >
          {({ handleSubmit, errors, touched, setFieldValue }) => {
            return (
              <>
                {destinations?.length !== 0 ? (
                  <>
                    <DropDownPicker
                      listMode="SCROLLVIEW"
                      open={isOpen}
                      value={destination}
                      items={destinations}
                      onChangeValue={(value) => {
                        setFieldValue("destination", value);
                      }}
                      setOpen={onToggle}
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
                        marginBottom:
                          touched.destination && errors.destination ? 0 : 12,
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
                    {touched?.destination && errors?.destination && (
                      <Text style={{ color: "red", fontSize: 14, padding: 5 }}>
                        {errors.destination}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={{ marginBottom: 16 }}>Loading...</Text>
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
