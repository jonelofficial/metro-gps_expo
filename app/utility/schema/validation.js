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
  others: Yup.string().label("Others"),
});

export const doneModalSchema = Yup.object().shape({
  // odometer_done: Yup.number().decimal(1).required().label("Odometer"),
  odometer_done: Yup.string()
    .matches(/^[0-9]*\.?[0-9]*$/, "Must be only digits with one decimal point")
    .required()
    .label("Odometer"),
});
