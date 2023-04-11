import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Divider,
  Portal,
  Modal,
  Text,
  withTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useDispatch } from "react-redux";
import Screen from "../../../components/Screen";
import useDisclosure from "../../../hooks/useDisclosure";
import { validatorStatus } from "../../../redux-toolkit/counter/vaidatorSlice";
import { selectTable } from "../../../utility/sqlite";

const TripDetailsScreen = ({ route, theme, navigation }) => {
  const [staion, setStaion] = useState([]);
  const { item } = route.params;
  const { colors } = theme;
  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );
  const { isOpen, onClose, onToggle } = useDisclosure();
  const {
    isOpen: isLoading,
    onClose: onCloseLoading,
    onToggle: onToggleLoading,
  } = useDisclosure();

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const gasRes = await selectTable("gas_station");
      setStaion([...gasRes.map((item) => ({ ...item, value: item._id }))]);
    })();

    return () => {
      null;
    };
  }, []);

  const styles = StyleSheet.create({
    container: {
      margin: 15,
      padding: 10,
      borderRadius: 10,
      flex: 1,
      flexWrap: "wrap",
    },
    textWrapper: { flexDirection: "row", marginBottom: 2 },
    label: {
      minWidth: 100,
      color: item?.offline ? colors.white : colors.dark,
    },
    text: {
      textTransform: "capitalize",
      color: item?.offline ? colors.white : colors.dark,
    },
  });

  return (
    <>
      <Screen>
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                newLocations.length % 2 !== 0 ||
                newLocations.length === 0 ||
                isNaN(item?.odometer_done)
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
              <Text style={[styles.text, { textTransform: "none" }]}>
                {item?._id?.length > 20 ? `${item?._id?.slice(20)}` : item?._id}
              </Text>
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.label}>Date:</Text>
              <Text style={[styles.text, { textTransform: "none" }]}>
                {moment(item?.trip_date)
                  .tz("Asia/Manila")
                  .format("MMM-DD-YY hh:mm a")}
              </Text>
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.text}>{item?.user_id?.trip_template}</Text>
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.label}>Vehicle: </Text>
              <View>
                {item?.vehicle_id?.plate_no ? (
                  <>
                    <Text
                      style={[styles.text, { textTransform: "uppercase" }]}
                    >{`${item?.vehicle_id?.plate_no}`}</Text>
                    <Text
                      style={[styles.text, { textTransform: "none" }]}
                    >{`${item?.vehicle_id?.name}`}</Text>
                  </>
                ) : (
                  <Text style={[styles.text, { textTransform: "none" }]}>
                    Details will show when sync.
                  </Text>
                )}
              </View>
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
                              textTransform: "uppercase",
                              color:
                                loc?.status === "left"
                                  ? colors.danger
                                  : colors.success,
                            },
                          ]}
                        >
                          {`${loc?.status}:`}
                        </Text>
                        <Text style={[styles.text, { textTransform: "none" }]}>
                          {loc?.date &&
                            moment(loc.date)
                              .tz("Asia/Manila")
                              .format("MMM-DD-YY hh:mm a")}
                        </Text>

                        <Text
                          style={[styles.text, { flexWrap: "wrap" }]}
                          numberOfLines={3}
                        >
                          {`${loc?.address[0]?.name || "(No Name)"}  ${
                            loc?.address[0]?.district || "(No District)"
                          } ${loc?.address[0]?.city || "(No City)"}  ${
                            loc?.address[0]?.subregion || "(No Subregion)"
                          }`}
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
              <Text style={styles.label}>Diesel: </Text>

              <View style={{ flexDirection: "column" }}>
                {item?.diesels.map((gas, i) => {
                  const name = staion.find(
                    (el) => el._id === gas.gas_station_id
                  );
                  return (
                    <View key={i} style={{ marginBottom: 5 }}>
                      <View style={{ paddingBottom: 5 }}>
                        <Text style={styles.text}>
                          Gas Station: {name?.label}
                        </Text>
                      </View>
                      {name?.label === "Others" && (
                        <View style={{ paddingBottom: 5 }}>
                          <Text style={styles.text}>
                            Gas Station Name: {gas?.gas_station_name}
                          </Text>
                        </View>
                      )}
                      <View style={{ paddingBottom: 5 }}>
                        <Text style={styles.text}>
                          Odomter: {gas?.odometer}
                        </Text>
                      </View>
                      <View style={{ paddingBottom: 5 }}>
                        <Text style={styles.text}>Liter: {gas?.liter}</Text>
                      </View>
                      <View style={{ paddingBottom: 5 }}>
                        <Text style={styles.text}>Amount: {gas?.amount}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            {item?.odometer_image_path && (
              <View style={styles.textWrapper}>
                <Text style={styles.label}>Odo Image:</Text>
                <TouchableOpacity onPress={onToggle}>
                  <Text style={{ color: colors.primary }}>View</Text>
                </TouchableOpacity>
              </View>
            )}
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
              <Text style={styles.label}>Charging: </Text>
              <Text style={styles.text}>{item?.charging}</Text>
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.label}>Others: </Text>
              {item?.others !== "null" && (
                <Text style={styles.text}>{item?.others}</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {(newLocations.length % 2 !== 0 ||
          newLocations.length === 0 ||
          isNaN(item?.odometer_done)) && (
          <View style={{ paddingBottom: 15, paddingHorizontal: 10 }}>
            <Button
              mode="contained"
              style={{ borderRadius: 35, backgroundColor: colors.success }}
              labelStyle={{
                fontSize: 18,
                lineHeight: 35,
              }}
              onPress={() => {
                dispatch(validatorStatus(true));
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

      {/* ODO IMAGE */}
      <Portal>
        <Modal
          visible={isOpen}
          onDismiss={onClose}
          contentContainerStyle={{
            backgroundColor: "white",
            margin: 15,
            padding: 20,
            borderRadius: 10,
            justifyContent: "space-between",
          }}
        >
          <Image
            defaultSource={require("../../../assets/placeholder/car_placeholder.png")}
            style={{
              height: "93%",
              borderRadius: 10,
            }}
            source={{
              uri: `${process.env.BASEURL}/${item?.odometer_image_path}`,
            }}
            onLoadStart={onToggleLoading}
            onLoadEnd={onCloseLoading}
          />
          {isLoading && (
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                zIndex: 999,
              }}
            >
              <ActivityIndicator size="small" />
            </View>
          )}

          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            <Button onPress={onClose} textColor={colors.danger}>
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default withTheme(TripDetailsScreen);
