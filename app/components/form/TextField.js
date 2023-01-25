import React from "react";
import { Divider, Text, TextInput } from "react-native-paper";

const TextField = ({
  touched,
  errors,
  label,
  name,
  handleChange,
  handleBlur,
  values,
}) => {
  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={`Input ${name}`}
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        value={values[name]}
        autoCorrect={false}
        outlineStyle={{
          borderRadius: 15,
        }}
      />
      {touched[name] && errors[name] ? (
        <Text style={{ color: "red", fontSize: 14, padding: 5 }}>
          {errors[name]}
        </Text>
      ) : (
        <Divider style={{ height: 15, backgroundColor: "transparent" }} />
      )}
    </>
  );
};

export default TextField;
