import dayjs from "dayjs";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Text, withTheme } from "react-native-paper";
import Screen from "../components/Screen";

const TripDetailsScreen = ({ route, theme, navigation }) => {
  const { item } = route.params;
  const { colors } = theme;
  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  const styles = StyleSheet.create({
    container: {
      margin: 15,
      padding: 10,
      borderRadius: 10,
      flex: 1,
    },
    textWrapper: { flexDirection: "row", marginBottom: 2 },
    label: { minWidth: 100, color: item?.offline ? colors.white : colors.dark },
    text: {
      textTransform: "capitalize",
      color: item?.offline ? colors.white : colors.dark,
    },
  });

  return (
    <Screen>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              newLocations.length % 2 !== 0
                ? colors.danger
                : item?.offline
                ? colors.primarySync
                : colors.white,
          },
        ]}
      >
        <ScrollView>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.text}>{item?._id}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.text}>
              {dayjs(item?.trip_date).format("MMM-DD-YY hh:mm a")}
            </Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.text}>{item?.user_id.trip_template}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Vehicle: </Text>
            <Text
              style={styles.text}
            >{`${item?.vehicle_id.plate_no} - ${item?.vehicle_id.name}`}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Location: </Text>

            <View style={{ flexDirection: "column" }}>
              {item?.locations.map((loc, i) => {
                if (loc?.status !== "left" && loc?.status !== "arrived") {
                  return null;
                }
                return (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <View style={{ paddingBottom: 5, width: "80%" }}>
                      <Text
                        style={[
                          styles.text,
                          {
                            color:
                              loc?.status === "left"
                                ? colors.danger
                                : colors.success,
                          },
                        ]}
                      >
                        {`${loc?.status}:`}
                      </Text>
                      <Text
                        style={[styles.text, { flexWrap: "wrap" }]}
                        numberOfLines={3}
                      >
                        {`${loc?.address[0].name} ${loc?.address[0].city} ${loc?.address[0].subregion}`}
                      </Text>
                    </View>
                    {item?.locations.length - 1 !== i && (
                      <Divider style={{ height: 1, width: 30 }} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Odo: </Text>
            <Text style={styles.text}>{item?.odometer}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Odo Done: </Text>
            <Text style={styles.text}>{item?.odometer_done}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Companion: </Text>
            {item?.companion.map((comp, i) => {
              return (
                <Text key={i} style={styles.text}>
                  {comp?.first_name}
                </Text>
              );
            })}
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Others: </Text>
            {item?.others !== "null" && (
              <Text style={styles.text}>{item?.others}</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {newLocations.length % 2 !== 0 && (
        <View style={{ paddingBottom: 15, paddingHorizontal: 10 }}>
          <Button
            mode="contained"
            style={{ borderRadius: 35, backgroundColor: colors.success }}
            labelStyle={{
              fontSize: 18,
              lineHeight: 35,
            }}
            onPress={() => {
              navigation.navigate("Office", {
                screen: "OfficeMap",
              });
            }}
          >
            Resume
          </Button>
        </View>
      )}
    </Screen>
  );
};

export default withTheme(TripDetailsScreen);
