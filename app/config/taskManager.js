import React, { useEffect, useState } from "react";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

const LOCATION_TASK_NAME = "background-location-task";

const taskManager = () => {
  const [location, setLocation] = useState();
  const [showMap, setShowMap] = useState(false);

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

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      console.log(error);
      return;
    }
    if (data) {
      const result = data.locations[0];
      setLocation(result);
    }
  });

  return { showMap, location };
};

export default taskManager;
