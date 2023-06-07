import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Checkbox, Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import { arrivedDeliveryModalSchema } from "../../../utility/schema/validation";

const ArrivedDeliveryModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
  checkboxState,
}) => {
  const { lastDelivery, onToggleLastDelivery } = checkboxState;
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
                      onPress={onToggleLastDelivery}
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
    </Portal>
  );
};

export default ArrivedDeliveryModal;
