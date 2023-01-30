import dayjs from "dayjs";
import { getPathLength } from "geolib";
import moment from "moment-timezone";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, withTheme } from "react-native-paper";

const ListItem = ({ item, theme, onPress }) => {
  const { colors } = theme;

  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  // Getting KM
  const km = getPathLength(item.points) / 1000;

  // Getting TIME
  const startDate = dayjs(item.locations[0].date);
  const endDate = dayjs(item.locations[item.locations.length - 1].date);
  const duration = endDate.diff(startDate);
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hour = `${hours.toFixed(0)}.${minutes == 0 ? "00" : minutes}`;
  const time = moment(item.trip_date).tz("Asia/Manila").format("h:mm a");
  const date = dayjs(item.trip_date).format("MM-DD-YY");

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
          alignItems: "center",
          backgroundColor: colors.white,
        }}
      >
        <View>
          <View
            style={{
              padding: 7,
              marginRight: 10,
              borderWidth: 1,
              borderRadius: 5,
              borderColor: colors.success,
            }}
          >
            <Text style={{ color: colors.success }}>{`#${item._id.slice(
              20
            )}`}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View>
            <Text>{`${km.toFixed(1)} km`}</Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: colors.primary }}>
              {hours == 0 ? `${minutes} ` : `${hour} `}
            </Text>
            <Text>
              {hours >= 2 ? "hours." : hours == 0 ? "" : "hour."}
              {minutes > 1 ? "minutes" : "minute"}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View>
            <Text>{time}</Text>
          </View>
          <View>
            <Text>{date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default withTheme(ListItem);
