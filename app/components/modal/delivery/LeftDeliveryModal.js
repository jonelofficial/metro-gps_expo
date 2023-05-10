import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";

const LeftDeliveryModal = ({
  showLeftModal,
  onCloseLeftModal,
  leftLoading,
  onSubmit,
}) => {
  return (
    <Portal>
      <Modal
        visible={showLeftModal}
        onDismiss={onCloseLeftModal}
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
          <TouchableOpacity onPress={onCloseLeftModal}>
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>
        <Formik
          initialValues={{
            item_count: "",
          }}
          validationSchema={null}
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
                  name="item_count"
                  label="Item Count"
                  keyboardType="numeric"
                />

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

export default LeftDeliveryModal;
