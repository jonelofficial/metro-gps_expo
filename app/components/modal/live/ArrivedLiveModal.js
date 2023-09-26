import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import { arrivedLiveModalSchema } from "../../../utility/schema/validation";

const ArrivedModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
}) => {
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
            total_bags_delivered: "",
          }}
          validationSchema={arrivedLiveModalSchema}
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
                  name="total_bags_delivered"
                  label="Total Bags Delivered"
                  keyboardType="numeric"
                />

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

export default ArrivedModal;
