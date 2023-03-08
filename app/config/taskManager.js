import React, { useEffect, useState } from "react";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import useToast from "../hooks/useToast";
import moment from "moment-timezone";
import { useNavigation } from "@react-navigation/native";

const LOCATION_TASK_NAME = "background-location-task";
let alertTimer = null;

const taskManager = (interval) => {
  const [location, setLocation] = useState();
  const [showMap, setShowMap] = useState(false);
  const { showAlert } = useToast();
  const navigation = useNavigation();

  useEffect(() => {
    (() => {
      alertTimer = setTimeout(() => {
        showAlert(
          "No Location detected. Please reload app and make sure phone GPS is ON",
          "danger"
        );
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Dashboard",
              params: { screen: "DashboardStack" },
            },
          ],
        });
      }, 30000);
    })();

    return () => {
      if (alertTimer) {
        clearTimeout(alertTimer);
        alertTimer = null;
      }
    };
  }, []);

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      console.log(`Task Manager ${LOCATION_TASK_NAME} Error: `, error);
      return;
    }
    if (data) {
      const result = data.locations[0];
      setLocation(result);

      if (alertTimer) {
        clearTimeout(alertTimer);
        alertTimer = null;
      }
    }
  });

  TaskManager.defineTask("interval", ({ data, error }) => {
    console.log("task manager interval working");
    // THIS WILL ADD LOCATION WHEN IN BACKGROUND AND GEOCODE LOCATION IN BACKEND
    if (data) {
      const result = data.locations[0];

      const newObj = {
        lat: result?.coords?.latitude,
        long: result?.coords?.longitude,
        address: [{ status: "background" }],
        status: "interval",
        date: moment(Date.now()).tz("Asia/Manila"),
      };

      interval(newObj);
    }
  });

  useEffect(() => {
    (async () => {
      // EXPO LOCATION
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === "granted") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === "granted") {
          // FOR LOCATION BACKGROUND OR FOREGROUND
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            enableHighAccuracy: true,
            accuracy: Location.LocationAccuracy.BestForNavigation,
          });
          // FOR INTERVAL BACKGROUND OR FOREGROUND
          await Location.startLocationUpdatesAsync("interval", {
            timeInterval: 600000,
            // 600000 10 minutes
          });
          setShowMap(true);
        }
      }
    })();

    return () => {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      Location.stopLocationUpdatesAsync("interval");
    };
  }, []);

  const requestPremissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === "granted") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === "granted") {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          enableHighAccuracy: true,
          accuracy: Location.LocationAccuracy.BestForNavigation,
        });
        setShowMap(true);
      }
    }
  };

  return { showMap, location, requestPremissions };
};

export default taskManager;
