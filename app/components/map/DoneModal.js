import React, { useEffect } from "react";
import { Image, Keyboard, TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import { doneModalSchema } from "../../utility/schema/validation";
import TextField from "../form/TextField";
import SubmitButton from "../form/SubmitButton";
import { useDispatch, useSelector } from "react-redux";
import { removeImage } from "../../redux-toolkit/counter/imageSlice";
import useDisclosure from "../../hooks/useDisclosure";
import AppCamera from "../AppCamera";

const DoneModal = ({
  showDoneModal,
  onCloseDoneModal,
  estimatedOdo,
  onSubmit,
  doneLoading,
  currentOdo,
}) => {
  const image = useSelector((state) => state.image.value);
  const dispatch = useDispatch();

  const {
    isOpen: showCamera,
    onClose: onCloseCamera,
    onToggle: onToggleCamera,
  } = useDisclosure();

  return (
    <>
      <Portal>
        <Modal
          visible={showDoneModal}
          // onDismiss={onCloseDoneModal}
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
                dispatch(removeImage());
                onCloseDoneModal();
              }}
            >
              <Ionicons name="ios-close-outline" size={30} />
            </TouchableOpacity>
          </View>

          {/* <Text style={{ textAlign: "center" }}>
          Please input current vehicle odometer.
        </Text> */}

          <Formik
            initialValues={{
              odometer_image_path: image,
              // odometer_done: estimatedOdo.toString(),
              odometer_done: currentOdo,
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
              setFieldValue,
              setErrors,
            }) => {
              useEffect(() => {
                if (image) {
                  setFieldValue("odometer_image_path", image);
                  setErrors("odometer_image_path", null);
                } else {
                  setFieldValue("odometer_image_path", null);
                  setErrors("odometer_image_path", null);
                }

                return () => {
                  null;
                };
              }, [image]);

              return (
                <>
                  {/* IMAGE */}
                  <Text style={{ marginBottom: 8 }}>Odometer Picture:</Text>
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    {image && (
                      <Image
                        source={{ uri: image?.uri }}
                        style={{
                          width: 100,
                          height: 100,
                          marginRight: 10,
                          borderRadius: 10,
                        }}
                      />
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        if (image) {
                          dispatch(removeImage());
                          onToggleCamera();
                        } else {
                          Keyboard.dismiss();
                          onToggleCamera();
                        }
                      }}
                    >
                      <Ionicons
                        name={image ? "ios-camera-reverse" : "ios-camera"}
                        size={40}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.odometer_image_path &&
                    errors.odometer_image_path && (
                      <Text style={{ color: "red", fontSize: 14, padding: 5 }}>
                        {errors?.odometer_image_path &&
                          "Odometer Picture is a required field"}
                      </Text>
                    )}

                  {/* IMAGE */}
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="odometer_done"
                    label="Vehicle Odometer"
                    keyboardType="numeric"
                    defaultValue={values["odometer_done"]}
                  />
                  {parseFloat(currentOdo) >
                    parseFloat(values["odometer_done"]) && (
                    // ||
                    // parseFloat(currentOdo) ==
                    //   parseFloat(values["odometer_done"])
                    <Text
                      style={{
                        color: "red",
                        fontSize: 14,
                        padding: 5,
                        marginTop: -10,
                      }}
                    >
                      Done odometer must be greater than or equal from previous
                      odometer inputted.
                    </Text>
                  )}
                  <SubmitButton
                    onPress={handleSubmit}
                    title="Proceed"
                    isLoading={doneLoading}
                    disabled={
                      doneLoading ||
                      // parseFloat(currentOdo) ==
                      //   parseFloat(values["odometer_done"]) ||
                      parseFloat(currentOdo) >
                        parseFloat(values["odometer_done"])
                    }
                  />
                </>
              );
            }}
          </Formik>
        </Modal>
        {showCamera && <AppCamera onCloseCamera={onCloseCamera} />}
      </Portal>
    </>
  );
};

export default DoneModal;
