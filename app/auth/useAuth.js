import React, { useState } from "react";
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
import {
  setColor,
  setMsg,
  setVisible,
} from "../redux-toolkit/counter/snackbarSlice";

const useAuth = () => {
  const netStatus = useSelector((state) => state.net.value);
  let userData;

  const { isOpen: isLoading, onToggle, onClose } = useDisclosure();
  const {
    storeToken,
    storeUser,
    removeToken: removeTokenState,
    removeUser: removeUserState,
  } = useStorage();
  const dispatch = useDispatch();

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

  const login = async (values) => {
    Keyboard.dismiss();
    onToggle();
    await fetch(`${process.env.BASEURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then(async (data) => {
        userData = data;

        if (data?.message) {
          onClose();
          dispatch(setMsg(data.message));
          dispatch(setVisible(true));
          dispatch(setColor("danger"));
          return;
        }
        // if (netStatus) {
        //   await getVehicles(data.token);
        //   await getGasStation(data.token);

        //   storeToken(data.token);
        //   storeUser(jwtDecode(data.token));
        //   dispatch(addToken(data));
        //   dispatch(addUser(jwtDecode(data.token)));
        // } else {
        //   const offlineData = await selectTable("user");
        //   offlineData.map((item) => {
        //     if (
        //       (item.password === values.password) &
        //       (item.username === values.username)
        //     ) {
        //       storeToken(item.token);
        //       storeUser(jwtDecode(item.token));
        //       dispatch(addToken({ token: item.token }));
        //       dispatch(addUser(jwtDecode(item.token)));
        //     } else {
        //       dispatch(
        //         setMsg(
        //           `Could not find user. Login with internet connection instead`
        //         )
        //       );
        //       dispatch(setVisible(true));
        //       dispatch(setColor("danger"));
        //     }
        //   });
        // }
      })
      .catch((error) => {
        onClose();
        console.error("Error:", error);
      });

    if (netStatus && !userData?.message) {
      await getVehicles(userData.token);
      await getGasStation(userData.token);

      storeToken(userData.token);
      storeUser(jwtDecode(userData.token));
      dispatch(addToken(userData));
      dispatch(addUser(jwtDecode(userData.token)));
    } else {
      const offlineData = await selectTable("user");
      offlineData.map((item) => {
        if (
          (item.password === values.password) &
          (item.username === values.username)
        ) {
          storeToken(item.token);
          storeUser(jwtDecode(item.token));
          dispatch(addToken({ token: item.token }));
          dispatch(addUser(jwtDecode(item.token)));
        } else {
          dispatch(
            setMsg(
              `Could not find user. Login with internet connection instead`
            )
          );
          dispatch(setVisible(true));
          dispatch(setColor("danger"));
        }
      });
    }

    onClose();
  };

  const logout = async () => {
    dispatch(removeToken());
    dispatch(removeUser());
    removeTokenState();
    removeUserState();
  };

  return { logout, login, isLoading };
};

export default useAuth;
