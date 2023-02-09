import dayjs from "dayjs";
import { getPathLength } from "geolib";
import moment from "moment-timezone";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Button, Text, withTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { useCreateTripMutation } from "../../api/metroApi";
import { validatorStatus } from "../../redux-toolkit/counter/vaidatorSlice";

const ListItem = ({ item, theme, onPress }) => {
  const { colors } = theme;
  const dispatch = useDispatch();

  const [createTrip, { isLoading }] = useCreateTripMutation();

  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  useEffect(() => {
    if (newLocations.length % 2 !== 0) {
      dispatch(validatorStatus(false));
    }
    return () => {
      null;
    };
  }, []);

  // Getting KM
  const km = item.points?.length > 0 && getPathLength(item.points) / 1000;

  // Getting TIME
  const startDate = dayjs(item.locations[0]?.date);
  const endDate = dayjs(item.locations[item.locations.length - 1]?.date);
  const duration = endDate.diff(startDate);
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hour = `${hours.toFixed(0)}.${minutes == 0 ? "00" : minutes}`;
  const time = moment(item.trip_date).tz("Asia/Manila").format("h:mm a");
  const date = dayjs(item.trip_date).format("MM-DD-YY");

  const handleSync = async () => {
    // start sync loading
    const form = new FormData();
    form.append("vehicle_id", item.vehicle_id);
    form.append("odometer", item.odometer);
    form.append("odometer_done", item.odometer_done);
    item?.image.uri !== null && form.append("image", item.image);
    form.append("companion", JSON.stringify(item.companion));
    form.append("points", JSON.stringify(item.points));
    form.append("others", item.others);
    form.append("trip_date", item.trip_date);
    form.append("locations", JSON.stringify(item.locations));
    form.append("diesels", JSON.stringify(item.diesels));

    const res = await createTrip(form);
    console.log(res);
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
            newLocations.length % 2 !== 0
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
                  newLocations.length % 2 !== 0
                    ? colors.notActive
                    : colors.primary,
                display: newLocations.length % 2 !== 0 ? "none" : "flex",
              }}
              labelStyle={{
                fontSize: 14,
                color:
                  newLocations.length % 2 !== 0 ? colors.danger : colors.white,
              }}
              disabled={newLocations.length % 2 !== 0 || isLoading}
              loading={isLoading}
              onPress={handleSync}
            >
              sync
            </Button>
          ) : (
            <View
              style={{
                padding: 7,
                marginRight: 10,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: item?.offline ? colors.white : colors.success,
              }}
            >
              <Text
                style={{ color: item?.offline ? colors.white : colors.success }}
              >
                {`#${item._id.slice(20)}`}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View>
            <Text style={{ color: item?.offline && colors.white }}>
              {newLocations.length % 2 !== 0
                ? "CLICK TO RESUME TRIP"
                : km && `${km.toFixed(1)} km`}
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: colors.primary }}>
              {hours == 0 ? `${minutes} ` : `${hour} `}
            </Text>
            <Text style={{ color: item?.offline && colors.white }}>
              {hours >= 2 ? "hours." : hours == 0 ? "" : "hour."}
              {minutes > 1 ? "minutes" : "minute"}
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

export default withTheme(ListItem);
