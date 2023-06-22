import React from "react";
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
import { arrivedDeliveryModalSchema } from "../../../utility/schema/validation";
import useDisclosure from "../../../hooks/useDisclosure";

const ArrivedDeliveryModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
  checkboxState,
  theme,
}) => {
  const { colors } = theme;
  const { lastDelivery, onToggleLastDelivery } = checkboxState;

  const { isOpen, onClose, onToggle } = useDisclosure();
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
            crates_dropped: "",
            crates_collected: "",
            crates_borrowed: "",
          }}
          validationSchema={arrivedDeliveryModalSchema}
          onSubmit={onSubmit}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            values,
            errors,
            touched,
          }) => {
            return (
              <>
                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="crates_dropped"
                  label="Crates Dropped"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="crates_collected"
                  label="Crates Collected"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="crates_borrowed"
                  label="Crates Borrowed"
                  keyboardType="numeric"
                />

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
                    Last delivery store.
                  </Text>
                </View>

                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={arrivedLoading}
                  disabled={arrivedLoading}
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
          <Button onPress={onClose} labelStyle={{ color: colors.danger }}>
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

export default withTheme(ArrivedDeliveryModal);
