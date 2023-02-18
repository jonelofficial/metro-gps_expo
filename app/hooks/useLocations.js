import React from "react";
import * as Location from "expo-location";

const useLocations = () => {
  const handleInterval = async (location) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const obj = {
        lat: location.coords.latitude,
        long: location.coords.longitude,
        address: res,
        status: "interval",
      };

      return obj;
    } catch (error) {
      console.log("HANDLE ARRIVED ERROR: ", error);
      return false;
    }
  };

  const handleArrived = async (location) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const obj = {
        lat: location.coords.latitude,
        long: location.coords.longitude,
        address: res,
        status: "arrived",
      };

      return obj;
    } catch (error) {
      console.log("HANDLE ARRIVED ERROR: ", error);
      return false;
    }
  };

  const handleLeft = async (location) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const obj = {
        lat: location.coords.latitude,
        long: location.coords.longitude,
        address: res,
        status: "left",
      };

      return obj;
    } catch (error) {
      console.log("HANDLE LEFT ERROR: ", error);
      return false;
    }
  };
  return { handleInterval, handleArrived, handleLeft };
};

export default useLocations;
