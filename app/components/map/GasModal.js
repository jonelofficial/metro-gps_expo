import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text, withTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import DropDownPicker from "react-native-dropdown-picker";
import TextField from "../form/TextField";
import { gasModalSchema } from "../../utility/schema/validation";
import { selectTable } from "../../utility/sqlite";
import useDisclosure from "../../hooks/useDisclosure";
import SubmitButton from "../form/SubmitButton";

const GasModal = ({
  showGasModal,
  onCloseGasModal,
  gasLoading,
  onSubmit,
  theme,
}) => {
  const { colors } = theme;
  const [value, setValue] = useState("");
  const [items, setItems] = useState();

  const {
    isOpen: showDropdown,
    onClose: onCloseDropdown,
    onToggle: onToggleDropdown,
  } = useDisclosure();

  useEffect(() => {
    (async () => {
      const gasRes = await selectTable("gas_station");
      setItems([...gasRes.map((item) => ({ ...item, value: item._id }))]);
    })();

    return () => {
      null;
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={showGasModal}
        onDismiss={() => {
          onCloseGasModal();
          onCloseDropdown();
          setValue("");
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
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              onCloseGasModal();
              onCloseDropdown();
              setValue("");
            }}
          >
            <Ionicons name="ios-close-outline" size={30} />
          </TouchableOpacity>
        </View>
        <Formik
          initialValues={{
            gas_station_id: value,
            odometer: "",
            liter: "",
            amount: "",
            gas_station_name: "",
          }}
          validationSchema={gasModalSchema}
          onSubmit={(data, { resetForm }) => {
            onSubmit(data);
            setValue("");
            onCloseDropdown();
            resetForm();
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setErrors,
            setFieldValue,
          }) => {
            useEffect(() => {
              const name = items.find((el) => el?._id === value);
              if (value) {
                setFieldValue("gas_station_id", value);
                setErrors("gas_station_id", null);
              }

              if (value !== "507f191e810c19729de860ea") {
                setFieldValue("gas_station_name", name?.label);
                setErrors("gas_station_name", null);
              } else {
                setFieldValue("gas_station_name", "");
                setErrors("gas_station_name", null);
              }

              return () => {
                null;
              };
            }, [value]);
            return (
              <>
                <DropDownPicker
                  open={showDropdown}
                  value={value}
                  items={items}
                  onChangeValue={handleChange}
                  setOpen={onToggleDropdown}
                  setValue={setValue}
                  setItems={setItems}
                  placeholder="Select gas station"
                  textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
                  // labelStyle={{ color: "red", fontSize: 28 }}
                  style={{
                    borderRadius: 15,
                    borderColor: errors["gas_station"]
                      ? colors.danger
                      : colors.light,
                    marginBottom:
                      touched.gas_station_id && errors.gas_station_id ? 0 : 12,
                  }}
                  dropDownContainerStyle={{
                    borderColor: errors["gas_station"]
                      ? colors.danger
                      : colors.light,
                    maxHeight: 150,
                  }}
                />
                {touched.gas_station_id && errors.gas_station_id && (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 14,
                      padding: 5,
                    }}
                  >
                    {errors.gas_station_id}
                  </Text>
                )}

                {/* THIS IS FOR OTHERS */}
                {value === "507f191e810c19729de860ea" && (
                  <TextField
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    name="gas_station_name"
                    label="Gas Station Name"
                  />
                )}
                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="odometer"
                  label="Odometer"
                  keyboardType="numeric"
                />

                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="liter"
                  label="Liter"
                  keyboardType="numeric"
                  defaultValue={values["odometer_done"]}
                />
                <TextField
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  values={values}
                  name="amount"
                  label="Amount"
                  keyboardType="numeric"
                  defaultValue={values["odometer_done"]}
                />
                <SubmitButton
                  onPress={handleSubmit}
                  title="Proceed"
                  isLoading={gasLoading}
                  disabled={gasLoading}
                />
              </>
            );
          }}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default withTheme(GasModal);
