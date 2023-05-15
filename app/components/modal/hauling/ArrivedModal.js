import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import TextField from "../../form/TextField";
import SubmitButton from "../../form/SubmitButton";
import {
  arrivedModalFullSchema,
  arrivedModalSchema,
} from "../../../utility/schema/validation";
import { useState } from "react";
import { useEffect } from "react";

const ArrivedModal = ({
  showArrivedModal,
  onCloseArrivedModal,
  arrivedLoading,
  onSubmit,
  trip,
}) => {
  const [formSchema, setFormSchema] = useState(arrivedModalSchema);

  useEffect(() => {
    trip?.locations?.length > 1 && setFormSchema(arrivedModalFullSchema);

    return () => {
      null;
    };
  }, [trip]);

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
            tare_weight: "",
            net_weight: "",
            gross_weight: "",
            temperature: "",
            doa_count: "",
          }}
          validationSchema={formSchema}
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
                {trip?.locations?.length > 1 && (
                  <>
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="gross_weight"
                      label="Gross Weight"
                      keyboardType="numeric"
                    />
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="net_weight"
                      label="Net Weight (Optional)"
                      keyboardType="numeric"
                    />
                    <TextField
                      touched={touched}
                      errors={errors}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      values={values}
                      name="doa_count"
                      label="DOA Count"
                      keyboardType="numeric"
                    />
                  </>
                )}
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
