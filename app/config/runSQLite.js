import React, { useEffect } from "react";
import { createTable, showTable } from "../utility/sqlite";

const runSQLite = () => {
  useEffect(() => {
    (async () => {
      // await dropTable("user");
      // await dropTable("locations");

      // const res = await showTable();
      // console.log("T A B L E: ", res);

      await createTable(
        "offline_trip",
        "id integer primary key not null, date TEXT, vehicle_id TEXT , odometer TEXT, odometer_done TEXT, image LONGTEXT, companion LONGTEXT, points LONGTEXT, others TEXT, locations LONGTEXT , gas LONGTEXT"
      );

      await createTable(
        "locations",
        "id integer primary key not null, date TEXT, trip_id TEXT, lat NUMBER, long NUMBER, status TEXT, address LONGTEXT"
      );

      await createTable(
        "route",
        "id integer primary key not null, points LONGTEXT"
      );

      await createTable(
        "gas",
        "id integer primary key not null, gas_station_id TEXT, trip_id TEXT, gas_station_name TEXT, odometer NUMBER, liter NUMBER, lat NUMBER, long NUMBER , amount NUMBER"
      );

      await createTable(
        "user",
        "id integer primary key not null, username TEXT, password TEXT,  token TEXT "
      );

      await createTable(
        "vehicles",
        "id integer primary key not null, _id TEXT, plate_no TEXT, vehicle_type TEXT, name TEXT,brand TEXT, fuel_type TEXT, km_per_liter INTEGER"
      );
      await createTable(
        "gas_station",
        "id integer primary key not null, _id TEXT, label TEXT"
      );
    })();
    return () => {
      null;
    };
  }, []);
  return null;
};

export default runSQLite;
