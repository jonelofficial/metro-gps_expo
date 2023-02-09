import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import { doneModalSchema } from "../../utility/schema/validation";
import TextField from "../form/TextField";
import SubmitButton from "../form/SubmitButton";

const DoneModal = ({
  showDoneModal,
  onCloseDoneModal,
  estimatedOdo,
  onSubmit,
  doneLoading,
}) => {
  return (
    <Portal>
      <Modal
        visible={showDoneModal}
        onDismiss={onCloseDoneModal}
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
          <TouchableOpacity onPress={onCloseDoneModal}>
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center" }}>
          Please input current vehicle odometer.
        </Text>

        <Formik
          initialValues={{
            odometer_done: estimatedOdo.toString(),
          }}
          validationSchema={doneModalSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            handleBlur,
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
                  name="odometer_done"
                  label="Odometer Done"
                  keyboardType="numeric"
                  defaultValue={values["odometer_done"]}
                />
                <SubmitButton
                  onPress={handleSubmit}
                  title="Done"
                  isLoading={doneLoading}
                  disabled={doneLoading}
                />
              </>
            );
          }}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default DoneModal;
