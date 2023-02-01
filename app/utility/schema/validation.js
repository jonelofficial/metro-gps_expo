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
