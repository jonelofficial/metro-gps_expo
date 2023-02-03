import React from "react";
import * as Location from "expo-location";

const useLocations = () => {
  const handleInterval = async () => {
    try {
      const result = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
        accuracy: Location.LocationAccuracy.BestForNavigation,
      });

      const res = await Location.reverseGeocodeAsync({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      const obj = {
        lat: result.coords.latitude,
        long: result.coords.longitude,
        address: res,
        status: "interval",
      };

      return obj;
    } catch (error) {
      console.log("HANDLE ARRIVED ERROR: ", error);
    }
  };

  const handleArrived = async () => {
    try {
      const result = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
        accuracy: Location.LocationAccuracy.BestForNavigation,
      });

      const res = await Location.reverseGeocodeAsync({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      const obj = {
        lat: result.coords.latitude,
        long: result.coords.longitude,
        address: res,
        status: "arrived",
      };

      return obj;
    } catch (error) {
      console.log("OFFLINE HANDLE LEFT ERROR: ", error);
    }
  };

  const handleLeft = async () => {
    try {
      const result = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
        accuracy: Location.LocationAccuracy.BestForNavigation,
      });

      const res = await Location.reverseGeocodeAsync({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      const obj = {
        lat: result.coords.latitude,
        long: result.coords.longitude,
        address: res,
        status: "left",
      };

      return obj;
    } catch (error) {
      console.log("OFFLINE HANDLE LEFT ERROR: ", error);
    }
  };
  return { handleInterval, handleArrived, handleLeft };
};

export default useLocations;
