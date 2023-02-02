import React from "react";
import { Button } from "react-native-paper";

const SubmitButton = ({ onPress, title, isLoading }) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={{ borderRadius: 35 }}
      labelStyle={{
        fontSize: 18,
        lineHeight: 35,
      }}
      loading={isLoading}
    >
      {title}
    </Button>
  );
};

export default SubmitButton;
