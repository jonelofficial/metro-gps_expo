import React from "react";
import jwtDecode from "jwt-decode";
import { Keyboard } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import useDisclosure from "../hooks/useDisclosure";
import {
  addToken,
  addUser,
  removeToken,
  removeUser,
} from "../redux-toolkit/counter/userCounter";
import { deleteFromTable, insertToTable, selectTable } from "../utility/sqlite";
import useStorage from "./useStorage";

import useToast from "../hooks/useToast";
import { validatorStatus } from "../redux-toolkit/counter/vaidatorSlice";

const useAuth = () => {
  const netStatus = useSelector((state) => state.net.value);

  const { showAlert } = useToast();
  const { isOpen: isLoading, onToggle, onClose } = useDisclosure();
  const {
    storeToken,
    storeUser,
    removeToken: removeTokenState,
    removeUser: removeUserState,
  } = useStorage();
  const dispatch = useDispatch();

  const getSgDestinations = async () => {
    try {
      const res = await fetch(process.env.SG_DESTINATION);
      const sgDestination = await res.json();

      const uniqueArray = sgDestination.records.reduce((acc, value) => {
        if (!acc.some((obj) => obj.location === value.location)) {
          acc.push(value);
        }
        return acc;
      }, []);

      const data = await selectTable("sg_destination");

      if (data.length === 0) {
        await uniqueArray.map(async ({ termCode, locCode, location }) => {
          await insertToTable(
            "INSERT INTO sg_destination (term_code, loc_code, location) values (?, ?, ?)",
            [termCode, locCode, location]
          );
        });
      } else if (uniqueArray.length !== data.length) {
        await deleteFromTable("sg_destination");
        await uniqueArray.map(async ({ termCode, locCode, location }) => {
          await insertToTable(
            "INSERT INTO sg_destination (term_code, loc_code, location) values (?, ?, ?)",
            [termCode, locCode, location]
          );
        });
      }
    } catch (error) {
      console.log("GET SG DESTINATIONS API ERROR: ", error);
    }
  };

  const getDepartment = async () => {
    try {
      const response = await fetch(process.env.CEDAR_URL, {
        headers: {
          Authorization: `Bearer ${process.env.CEDAR_TOKEN}`,
        },
      });
      const departments = await response.json();
      if (departments.data) {
        // Handle store and update departments master list to local storage

        let departmentsCount;
        departmentsCount = departments.data.length;
        const data = await selectTable("department");
        if (data.length === 0) {
          await insertToTable("INSERT INTO department (data) values (?)", [
            JSON.stringify(departments.data),
          ]);
        } else if (departmentsCount !== data.length) {
          await deleteFromTable("department");
          await insertToTable("INSERT INTO department (data) values (?)", [
            JSON.stringify(departments.data),
          ]);
        }

        // End
      }
    } catch (error) {
      console.log("GET DEPARTMENT API ERROR: ", error);
    }
  };

  const getVehicles = async (token) => {
    try {
      const response = await fetch(`${process.env.BASEURL}/vehicle/cars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const vehicles = await response.json();
      if (vehicles.data) {
        // Handle store and update vehicles master list to local storage

        let vehicleCount;
        vehicleCount = vehicles.data.length;
        const data = await selectTable("vehicles");
        if (data.length === 0) {
          await vehicles.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO vehicles (_id, plate_no, vehicle_type, name,brand, fuel_type, km_per_liter) values (?,?,?,?,?,?,?)",
              [
                item._id,
                item.plate_no,
                item.vehicle_type,
                item.name,
                item.brand,
                item.fuel_type,
                item.km_per_liter,
              ]
            );
          });
        } else if (vehicleCount !== data.length) {
          await deleteFromTable("vehicles");
          await vehicles.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO vehicles (_id, plate_no, vehicle_type, name,brand, fuel_type, km_per_liter) values (?,?,?,?,?,?,?)",
              [
                item._id,
                item.plate_no,
                item.vehicle_type,
                item.name,
                item.brand,
                item.fuel_type,
                item.km_per_liter,
              ]
            );
          });
        }

        // End
      }
    } catch (error) {
      console.log("GET VEHICLES API ERROR: ", error);
    }
  };

  const getGasStation = async (token) => {
    try {
      const response = await fetch(
        `${process.env.BASEURL}/gas-station/stations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const gasStation = await response.json();
      if (gasStation.data) {
        // Handle store and update gas station master list to local storage
        let stationCount;
        stationCount = gasStation.data.length;
        const data = await selectTable("gas_station");
        if (data.length === 0) {
          await gasStation.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO gas_station (_id, label) values (?,?)",
              [item._id, item.label]
            );
          });
        } else if (stationCount !== data.length) {
          await deleteFromTable("gas_station");
          await gasStation.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO gas_station (_id,label) values (?,?)",
              [item._id, item.label]
            );
          });
        }

        // End
      }
    } catch (error) {
      console.log("GET GAS STATION API ERROR: ", error);
    }
  };

  const getTripCategory = async (token) => {
    try {
      const response = await fetch(
        `${process.env.BASEURL}/api/data/trip-category?page=1&limit=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tripCategory = await response.json();
      if (tripCategory.data) {
        let categoryCount;
        categoryCount = tripCategory.data.length;
        const data = await selectTable("trip_category");
        if (data.length === 0) {
          await tripCategory.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO trip_category (category, trip_template) values (?,?)",
              [item.category, item.trip_template]
            );
          });
        } else if (categoryCount !== data.length) {
          await deleteFromTable("trip_category");
          await tripCategory.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO trip_category (category, trip_template) values (?,?)",
              [item.category, item.trip_template]
            );
          });
        }

        // End
      }
    } catch (error) {
      console.log("GET TRIP CATEGORY API ERROR: ", error);
    }
  };

  const getTripType = async (token) => {
    try {
      const response = await fetch(
        `${process.env.BASEURL}/api/data/trip-type?page=1&limit=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tripType = await response.json();
      if (tripType.data) {
        let typeCount;
        typeCount = tripType.data.length;
        const data = await selectTable("trip_type");
        if (data.length === 0) {
          await tripType.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO trip_type (type, trip_category, trip_template) values (?,?,?)",
              [item.type, item.trip_category, item.trip_template]
            );
          });
        } else if (typeCount !== data.length) {
          await deleteFromTable("trip_type");
          await tripType.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO trip_type (type, trip_category, trip_template) values (?,?,?)",
              [item.type, item.trip_category, item.trip_template]
            );
          });
        }

        // End
      }
    } catch (error) {
      console.log("GET TRIP TYPE API ERROR: ", error);
    }
  };

  const getDestination = async (token) => {
    try {
      const response = await fetch(
        `${process.env.BASEURL}/api/data/destinations?page=1&limit=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const destinations = await response.json();
      if (destinations.data) {
        let destinationCount;
        destinationCount = destinations.data.length;
        const data = await selectTable("destination");
        if (data.length === 0) {
          await destinations.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO destination (destination, trip_type, trip_category, trip_template) values (?,?,?,?)",
              [
                item.destination,
                item.trip_type,
                item.trip_category,
                item.trip_template,
              ]
            );
          });
        } else if (destinationCount !== data.length) {
          await deleteFromTable("destination");
          await destinations.data.map(async (item) => {
            await insertToTable(
              "INSERT INTO destination (destination, trip_type, trip_category, trip_template) values (?,?,?,?)",
              [
                item.destination,
                item.trip_type,
                item.trip_category,
                item.trip_template,
              ]
            );
          });
        }

        // End
      }
    } catch (error) {
      console.log("GET DESTINATION API ERROR: ", error);
    }
  };

  const login = async (values) => {
    Keyboard.dismiss();
    onToggle();
    if (netStatus) {
      try {
        const data = await fetch(`${process.env.BASEURL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }).then((res) => res.json());
        if (data?.message) {
          onClose();
          showAlert(data?.message, "danger");
          return;
        }
        // UPDATE USER FROM SQLITE
        await deleteFromTable("user");
        await insertToTable(
          "INSERT INTO user (username, password, token) values (?,?,?)",
          [values.username, values.password, data.token]
        );
        await getSgDestinations();
        await getDepartment();
        await getVehicles(data.token);
        await getGasStation(data.token);
        await getTripCategory(data.token);
        await getTripType(data.token);
        await getDestination(data.token);
        storeToken(data.token);
        storeUser(jwtDecode(data.token));
        dispatch(addToken(data));
        dispatch(addUser(jwtDecode(data.token)));
      } catch (error) {
        onClose();
        showAlert(error, "danger");
      }
    } else {
      const offlineData = await selectTable("user");
      if (offlineData?.length <= 0) {
        showAlert(
          "Could not find user. Login with internet connection instead",
          "danger"
        );
      }
      offlineData.map((item) => {
        if (
          item.password === values.password &&
          item.username === values.username
        ) {
          storeToken(item.token);
          storeUser(jwtDecode(item.token));
          dispatch(addToken({ token: item.token }));
          dispatch(addUser(jwtDecode(item.token)));
        } else {
          showAlert(
            "Could not find user. Login with internet connection instead",
            "danger"
          );
        }
      });
    }

    onClose();
  };

  const logout = async () => {
    dispatch(validatorStatus(true));
    dispatch(removeToken());
    dispatch(removeUser());
    removeTokenState();
    removeUserState();
  };

  return { logout, login, isLoading };
};

export default useAuth;
