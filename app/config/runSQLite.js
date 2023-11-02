import React, { useEffect } from "react";
import { createTable, showTable } from "../utility/sqlite";
import * as SQLite from "expo-sqlite";

const runSQLite = () => {
  useEffect(() => {
    (async () => {
      // const db = SQLite.openDatabase("mydb.db");

      // const res = await showTable();
      // console.log("T A B L E: ", res);

      await createTable(
        "trip_category",
        `id integer primary key not null, category TEXT, trip_template TEXT`
      );
      await createTable(
        "trip_type",
        `id integer primary key not null, type TEXT, trip_category TEXT, trip_template TEXT`
      );
      await createTable(
        "destination",
        `id integer primary key not null, destination TEXT, trip_type TEXT, trip_category TEXT, trip_template TEXT`
      );

      await createTable(
        "sg_destination",
        `id integer primary key not null, term_code TEXT, loc_code TEXT, location TEXT`
      );

      await createTable(
        "offline_trip",
        `id integer primary key not null, 
        date TEXT, user_id TEXT, 
        vehicle_id TEXT , 
        odometer TEXT, 
        odometer_done TEXT, 
        image LONGTEXT, 
        companion LONGTEXT, 
        points LONGTEXT, 
        others TEXT, 
        locations LONGTEXT , 
        gas LONGTEXT, 
        charging TEXT`
      );

      await createTable(
        "live",
        `id integer primary key not null,
        date TEXT, user_id TEXT,
        vehicle_id TEXT ,
        odometer TEXT,
        odometer_done TEXT,
        image LONGTEXT,
        companion LONGTEXT,
        points LONGTEXT,
        others TEXT,
        locations LONGTEXT ,
        gas LONGTEXT,
        charging TEXT,
        trip_type TEXT,
        total_bags TEXT,
        total_bags_delivered TEXT,
        destination TEXT,
        transactions LONGTEXT,
        last_delivery TEXT,
        last_left TEXT`
      );

      await createTable(
        "depot_hauling",
        `id integer primary key not null,
      date TEXT, user_id TEXT,
      vehicle_id TEXT ,
      odometer TEXT,
      odometer_done TEXT,
      image LONGTEXT,
      companion LONGTEXT,
      points LONGTEXT,
      others TEXT,
      locations LONGTEXT ,
      gas LONGTEXT,
      charging TEXT,
      trip_type TEXT,
      trip_category TEXT,
      destination TEXT,
      temperature LONGTEXT,
      tare_weight LONGTEXT,
      gross_weight LONGTEXT,
      net_weight LONGTEXT,
      item_count TEXT,
      doa_count TEXT
      `
      );

      await createTable(
        "depot_delivery",
        `id integer primary key not null,
      date TEXT, user_id TEXT,
      vehicle_id TEXT ,
      odometer TEXT,
      odometer_done TEXT,
      image LONGTEXT,
      companion LONGTEXT,
      points LONGTEXT,
      others TEXT,
      locations LONGTEXT ,
      gas LONGTEXT,
      charging TEXT,
      trip_type TEXT,
      trip_category TEXT,
      destination TEXT,
      temperature LONGTEXT,
      crates_transaction LONGTEXT,
      last_store TEXT,
      last_left TEXT
      `
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

      await createTable(
        "department",
        "id integer primary key not null, data LONGTEXT"
      );
    })();
    return () => {
      null;
    };
  }, []);
  return null;
};

export default runSQLite;
