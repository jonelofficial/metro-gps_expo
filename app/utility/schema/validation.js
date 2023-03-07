import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  username: Yup.string().required().label("Username"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .required()
    .label("Password"),
});

export const officeFormSchema = Yup.object().shape({
  odometer: Yup.number().required().label("Odometer"),
  odometer_image_path: Yup.object().required().label("Odometer Picture"),
  charging: Yup.string().required().label("Charging"),
  others: Yup.string().label("Others"),
});

export const doneModalSchema = Yup.object().shape({
  // odometer_done: Yup.number().decimal(1).required().label("Odometer"),
  odometer_done: Yup.string()
    .matches(/^[0-9]*\.?[0-9]*$/, "Must be only digits with one decimal point")
    .required()
    .label("Odometer"),
});

export const gasModalSchema = Yup.object().shape({
  gas_station_id: Yup.string().required().label("Gas Station"),
  gas_station_name: Yup.string().required().label("Gas Station Name"),
  odometer: Yup.string()
    .matches(/^\d*\.?(?:\d{1,9})?$/, "Must be only digits")
    .required()
    .label("Odometer"),
  liter: Yup.string()
    .matches(/^\d*\.?(?:\d{1,9})?$/, "Must be only digits")
    .required()
    .label("Liter"),
  amount: Yup.string()
    .matches(/^\d*\.?(?:\d{1,9})?$/, "Must be only digits")
    .required()
    .label("Amount"),
});
