import dayjs from "dayjs";
import moment from "moment-timezone";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Badge, Button, Text, withTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateDeliveryTripMutation,
  useCreateHaulingTripMutation,
} from "../../api/metroApi";
import { validatorStatus } from "../../redux-toolkit/counter/vaidatorSlice";
import { deleteFromTable } from "../../utility/sqlite";
import useToast from "../../hooks/useToast";
import { useState } from "react";

const DepotListItem = ({
  item,
  theme,
  onPress,
  setTrip,
  setTotalCount,
  page,
}) => {
  const { colors } = theme;
  const [syncing, setSyncing] = useState(false);

  const dispatch = useDispatch();
  const net = useSelector((state) => state.net.value);
  const { showAlert } = useToast();

  const [createTrip, { isLoading }] =
    item.trip_category.toLowerCase() === "delivery"
      ? useCreateDeliveryTripMutation()
      : useCreateHaulingTripMutation();

  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  useEffect(() => {
    if (
      newLocations.length % 2 !== 0 ||
      newLocations.length === 0 ||
      isNaN(item?.odometer_done)
    ) {
      dispatch(validatorStatus(false));
    }
    return () => {
      null;
    };
  }, [item]);

  // Getting KM
  // const km = item.points?.length > 0 && getPathLength(item.points) / 1000;
  const km = item?.odometer_done - item?.odometer;

  // Getting TIME
  const startDate = dayjs(newLocations[0]?.date);
  const endDate = dayjs(newLocations[newLocations.length - 1]?.date);
  const duration = endDate.diff(startDate);
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hour = `${hours.toFixed(0)}.${minutes == 0 ? "00" : minutes}`;
  const time = moment(item.trip_date).tz("Asia/Manila").format("h:mm a");
  const date = dayjs(item.trip_date).format("MM-DD-YY");

  const handleSync = async () => {
    // start sync loading
    setSyncing(true);
    const form = new FormData();
    if (item.trip_category.toLowerCase() === "delivery") {
      form.append("trip_date", item?.trip_date);
      form.append("trip_type", item?.trip_type);
      form.append("trip_category", item?.trip_category);
      form.append("destination", item?.destination);
      form.append("route", item?.route);
      form.append("vehicle_id", item?.vehicle_id);
      form.append("locations", JSON.stringify(item?.locations));
      form.append("diesels", JSON.stringify(item?.diesels));
      form.append("odometer", item?.odometer);
      form.append("odometer_done", item?.odometer_done);
      item?.image !== null &&
        item.image.map((img) => form.append("images", img));
      form.append("others", item.others);
      form.append("charging", item.charging);
      form.append("companion", JSON.stringify(item.companion));
      form.append("points", JSON.stringify(item.points));
      form.append("temperature", item.temperature);
      form.append(
        "crates_transaction",
        JSON.stringify(item.crates_transaction)
      );
    } else {
      form.append("trip_date", item.trip_date);
      form.append("trip_type", item.trip_type);
      form.append("trip_category", item.trip_category);
      form.append("destination", item.destination);
      form.append("vehicle_id", item.vehicle_id);
      form.append("locations", JSON.stringify(item.locations));
      form.append("diesels", JSON.stringify(item.diesels));
      form.append("odometer", item.odometer);
      form.append("odometer_done", item.odometer_done);
      item?.image !== null &&
        item.image.map((img) => form.append("images", img));
      form.append("others", item.others);
      form.append("charging", item.charging);
      form.append("companion", JSON.stringify(item.companion));
      form.append("points", JSON.stringify(item.points));
      form.append("tare_weight", item.tare_weight);
      form.append("gross_weight", item.gross_weight);
      form.append("net_weight", item.net_weight);
      form.append("doa_count", item.doa_count);
      form.append("item_count", item.item_count);
    }

    const res = await createTrip(form);
    if (res?.data) {
      // Remove offline trip to sqlite database and state
      item.trip_category.toLowerCase() === "delivery"
        ? await deleteFromTable(`depot_delivery WHERE id=${item._id}`)
        : await deleteFromTable(`depot_hauling WHERE id=${item._id}`);
      setTrip((prevState) => [
        ...prevState.filter((obj) => obj._id !== item._id),
      ]);
      // // Add new created trip to state to display in dashboard
      if (page !== 1) {
        setTrip((prevState) => [res.data.data, ...prevState]);
        setTotalCount((prevState) => prevState + 1);
      }
    } else {
      if (res?.error?.data?.error) {
        item.trip_category.toLowerCase() === "delivery"
          ? await deleteFromTable(`depot_delivery WHERE id=${item._id}`)
          : await deleteFromTable(`depot_hauling WHERE id=${item._id}`);
        setTrip((prevState) => [
          ...prevState.filter((obj) => obj._id !== item._id),
        ]);
      }
      showAlert(res?.error?.error || res?.error?.data?.error, "warning");
    }
    setSyncing(false);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
          alignItems: "center",
          backgroundColor:
            newLocations.length % 2 !== 0 ||
            newLocations.length === 0 ||
            isNaN(item?.odometer_done)
              ? colors.danger
              : item?.offline
              ? colors.primarySync
              : colors.white,
        }}
      >
        <View>
          {item?.offline ? (
            <Button
              style={{
                borderRadius: 10,
                marginRight: 13,
                backgroundColor:
                  newLocations.length % 2 !== 0 || !net || isLoading || syncing
                    ? colors.notActive
                    : colors.primary,
                display:
                  newLocations.length % 2 !== 0 ||
                  newLocations.length === 0 ||
                  isNaN(item?.odometer_done)
                    ? "none"
                    : "flex",
              }}
              labelStyle={{
                fontSize: 14,
                color:
                  newLocations.length % 2 !== 0 || newLocations.length === 0
                    ? colors.danger
                    : colors.white,
              }}
              disabled={
                newLocations.length % 2 !== 0 || isLoading || !net || syncing
              }
              loading={isLoading}
              onPress={handleSync}
            >
              sync
            </Button>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  marginRight: 10,
                  justifyContent: "center",
                }}
              >
                <Badge
                  size={25}
                  style={{
                    backgroundColor:
                      item?.trip_category.toLowerCase() === "hauling"
                        ? colors.accent
                        : colors.primary,
                  }}
                >
                  {item?.trip_category.toLowerCase() === "hauling" ? "H" : "D"}
                </Badge>
              </View>
              <View
                style={{
                  padding: 7,
                  marginRight: 10,
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: item?.offline ? colors.white : colors.success,
                  minWidth: 65,
                }}
              >
                <Text
                  style={{
                    color: item?.offline ? colors.white : colors.success,
                  }}
                >
                  {`#${item._id.slice(20)}`}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View>
            <Text style={{ color: item?.offline && colors.white }}>
              {newLocations.length % 2 !== 0 ||
              newLocations.length === 0 ||
              isNaN(item?.odometer_done)
                ? "CLICK TO RESUME TRIP"
                : (km &&
                    `${km
                      ?.toFixed(1)
                      ?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km`) ||
                  "0 m"}
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: colors.primary }}>
              {hours > 0 ? hours + " hours " : ""}
              {minutes > 0 ? minutes + " minutes " : ""}
              {hours <= 0 && minutes <= 0 && "0 minute"}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View>
            <Text style={{ color: item?.offline && colors.white }}>{time}</Text>
          </View>
          <View>
            <Text style={{ color: item?.offline && colors.white }}>{date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default withTheme(DepotListItem);
