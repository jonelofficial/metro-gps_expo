import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  username: Yup.string().required().label("Username"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .required()
    .label("Password"),
});

// SERVICE GROUP

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

export const destinationSchema = Yup.object().shape({
  destination: Yup.string()
    .nullable()
    .required()
    .label("Destination is required"),
});

export const destinationOthersSchema = Yup.object().shape({
  destination: Yup.string()
    .nullable()
    .required()
    .label("Destination is required"),
  destination_name: Yup.string()
    .required()
    .label("Destination Name is required"),
});

// DEFAULT HAULING

export const depotDefaultFormSchema = Yup.object().shape({
  odometer: Yup.number().required().label("Odometer"),
  odometer_image_path: Yup.object().required().label("Odometer Picture"),
  trip_category: Yup.string().required().label("Trip Category"),
  charging: Yup.string().required().label("Charging"),
  others: Yup.string().label("Others"),
});

// DEPOT HAULING
export const haulingFormSchema = Yup.object().shape({
  odometer: Yup.number().required().label("Odometer"),
  odometer_image_path: Yup.object().required().label("Odometer Picture"),
  trip_category: Yup.string().required().label("Trip Category"),
  trip_type: Yup.string().nullable().required().label("Trip Type"),
  destination: Yup.string().nullable().required().label("Destination"),
  tare_weight: Yup.number().required().label("Tare Weight"),
  charging: Yup.string().required().label("Charging"),
  others: Yup.string().label("Others"),
});

export const arrivedModalSchema = Yup.object().shape({
  temperature: Yup.number().required().label("Temperature"),
  tare_weight: Yup.number().required().label("Tare Weight"),
});

export const arrivedModalFullSchema = Yup.object().shape({
  net_weight: Yup.number().label("Net Weight"),
  gross_weight: Yup.number().required().label("Gross Weight"),
  doa_count: Yup.number().required().label("DOA Count"),
});

export const leftModalSchema = Yup.object().shape({
  item_count: Yup.number().required().label("Item Count"),
});
export const leftModalChangeDestinationSchema = Yup.object().shape({
  destination: Yup.string().nullable().required().label("Destination"),
});

// DEPOT DELIVERY
export const deliveryFormSchema = Yup.object().shape({
  odometer: Yup.number().required().label("Odometer"),
  odometer_image_path: Yup.object().required().label("Odometer Picture"),
  trip_category: Yup.string().required().label("Trip Category"),
  trip_type: Yup.string().nullable().required().label("Trip Type"),
  destination: Yup.string().nullable().required().label("Destination"),
  temperature: Yup.string().required().label("Temperature"),
  charging: Yup.string().required().label("Charging"),
  others: Yup.string().label("Others"),
});

export const arrivedDeliveryModalSchema = Yup.object().shape({
  crates_dropped: Yup.number().required().label("Crates Dropped"),
  crates_collected: Yup.number().required().label("Crates Collected"),
  crates_borrowed: Yup.number().required().label("Crates Borrowed"),
  destination: Yup.string().nullable().required().label("Destination"),
});
