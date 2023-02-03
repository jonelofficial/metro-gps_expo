import dayjs from "dayjs";
import { getPathLength } from "geolib";
import moment from "moment-timezone";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Button, Text, withTheme } from "react-native-paper";

const ListItem = ({ item, theme, onPress }) => {
  const { colors } = theme;
  // if (item?.offline == true) {
  //   console.log(item);
  //   return (
  //     <TouchableOpacity onPress={onPress}>
  //       <Text>{`${item._id} THIS IS OFFLINE TRIP`}</Text>
  //     </TouchableOpacity>
  //   );
  // }

  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  // Getting KM
  const km = item.points?.length > 0 && getPathLength(item.points) / 1000;

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
              disabled={newLocations.length % 2 !== 0}
              onPress={() => console.log(item)}
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
