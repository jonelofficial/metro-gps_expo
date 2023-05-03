import { Formik } from "formik";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, withTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import { leftModalSchema } from "../../../utility/schema/validation";

const LeftModal = ({
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
            // tare_weight: "",
            // net_weight: "",
            // gross_weight: "",
            // temperature: "",
            item_count: "",
          }}
          validationSchema={leftModalSchema}
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

                {/* <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="temperature"
                  label="Temperature"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="tare_weight"
                  label="Tare Weight"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="net_weight"
                  label="Net Weight"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="gross_weight"
                  label="Gross Weight"
                  keyboardType="numeric"
                /> */}

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
