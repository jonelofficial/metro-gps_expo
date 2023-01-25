import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  username: Yup.string().required().label("Username"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .required()
    .label("Password"),
});
