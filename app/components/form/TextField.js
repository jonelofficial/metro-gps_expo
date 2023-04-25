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
  ...etc
}) => {
  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={`Input ${label}`}
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        value={values[name]}
        autoCorrect={false}
        autoCapitalize={false}
        outlineStyle={{
          borderRadius: 15,
        }}
        {...etc}
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
