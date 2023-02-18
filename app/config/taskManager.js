import React, { useEffect, useState } from "react";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import useToast from "../hooks/useToast";

const LOCATION_TASK_NAME = "background-location-task";
let alertTimer = null;

const taskManager = () => {
  const [location, setLocation] = useState();
  const [showMap, setShowMap] = useState(false);
  const { showAlert } = useToast();

  useEffect(() => {
    (() => {
      alertTimer = setTimeout(() => {
        showAlert(
          "No Location detected. Please reload app and make sure phone GPS is ON",
          "danger"
        );
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
      // Error occurred - check `error.message` for more details.
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

  useEffect(() => {
    (async () => {
      // EXPO LOCATION
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
    })();

    return () => {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
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
