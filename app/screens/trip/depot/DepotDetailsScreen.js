import React, { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  Modal,
  Portal,
  Text,
  withTheme,
} from "react-native-paper";
import { selectTable } from "../../../utility/sqlite";
import { useDispatch } from "react-redux";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import moment from "moment-timezone";
import Screen from "../../../components/Screen";
import { validatorStatus } from "../../../redux-toolkit/counter/vaidatorSlice";
import useDisclosure from "../../../hooks/useDisclosure";

const DepotDetailsScreen = ({ route, theme, navigation }) => {
  const { colors } = theme;
  const { item } = route.params;
  const [station, setStation] = useState([]);

  const dispatch = useDispatch();

  const { isOpen, onClose, onToggle } = useDisclosure();

  const {
    isOpen: isLoading,
    onClose: onCloseLoading,
    onToggle: onToggleLoading,
  } = useDisclosure();

  const newLocations = item.locations.filter(
    (location) => location.status == "left" || location.status == "arrived"
  );

  useEffect(() => {
    (async () => {
      const gasRes = await selectTable("gas_station");
      setStation([...gasRes.map((item) => ({ ...item, value: item._id }))]);
    })();
    return () => {};
  }, []);

  const Content = ({ label, details, labelStyle, detailsStyle }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingLeft: 10,
          paddingVertical: 2.5,
        }}
      >
        <View
          style={{
            flex: 1.6,
          }}
        >
          <Text style={[labelStyle]}>{label}</Text>
        </View>
        <View style={{ flex: 3, marginLeft: 10 }}>
          <Text style={[detailsStyle]}>{details}</Text>
        </View>
      </View>
    );
  };

  const Line = () => {
    return (
      <Divider
        style={{
          height: 2,
          borderRadius: 10,
          backgroundColor: colors.primary,
          marginBottom: 10,
        }}
      />
    );
  };

  const MapDivider = () => {
    return (
      <>
        <Divider
          style={{
            height: 15,
            backgroundColor: "transparent",
          }}
        />
        <Divider
          style={{
            height: 2,
            width: "80%",
            alignSelf: "center",
            opacity: 0.5,
            borderRadius: 50,
          }}
        />
        <Divider
          style={{
            height: 15,
            backgroundColor: "transparent",
          }}
        />
      </>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 15,
      padding: 10,
      borderRadius: 10,
      flex: 1,
    },
    containerWrapper: {
      marginBottom: 25,
    },
  });

  return (
    <>
      <Screen>
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Appbar.Content title={item?.user_id?.trip_template} />
        </Appbar.Header>
        <View style={styles.container}>
          <ScrollView>
            {(newLocations.length < 0 || !isNaN(item?.odometer_done)) && (
              <Card style={styles.containerWrapper}>
                <Card.Content>
                  <Text>User Details</Text>
                  <Line />
                  <Content
                    label="Employee ID"
                    details={item?.user_id?.employee_id}
                  />
                  <Content
                    label="Name"
                    details={item?.user_id?.first_name}
                    detailsStyle={{ textTransform: "capitalize" }}
                  />
                  <Content
                    label="Department"
                    details={item?.user_id?.department}
                    detailsStyle={{ textTransform: "capitalize" }}
                  />
                </Card.Content>
              </Card>
            )}

            {(newLocations.length < 0 || !isNaN(item?.odometer_done)) && (
              <Card style={styles.containerWrapper}>
                <Card.Content>
                  <Text>Vehicle Details</Text>
                  <Line />
                  <Content
                    label="Plate #"
                    details={item?.vehicle_id?.plate_no}
                  />
                  <Content label="Details" details={item?.vehicle_id?.name} />
                </Card.Content>
              </Card>
            )}

            <Card style={styles.containerWrapper}>
              <Card.Content>
                <Text>Trip Details</Text>
                <Line />
                <Content
                  label="ID"
                  details={
                    item?._id?.length > 20
                      ? `${item?._id?.slice(20)}`
                      : item?._id
                  }
                />
                <Content
                  label="Trip Date"
                  details={moment(item?.trip_date)
                    .tz("Asia/Manila")
                    .format("MMM-DD-YY hh:mm a")}
                />
                <Content label="Type" details={item?.trip_type} />
                <Content label="Destination" details={item?.destination} />
                <Content label="Farm" details={item?.farm} />
                <Content label="Odo" details={item?.odometer} />
                <Content label="Odo Done" details={item?.odometer_done} />
                {item?.odometer_image_path && (
                  <Content
                    label="Odo Image"
                    details={
                      <TouchableOpacity onPress={onToggle}>
                        <Text style={{ color: colors.primary }}>View</Text>
                      </TouchableOpacity>
                    }
                  />
                )}
                <Content label="Others" details={item?.others} />
                <Content
                  label="Charging"
                  details={item?.charging}
                  detailsStyle={{ textTransform: "capitalize" }}
                />
                <Content
                  label="Companion"
                  details={
                    typeof item?.companion === "string"
                      ? JSON.parse(item?.companion).map((item, i) => {
                          return <Text key={i}>{item?.first_name}</Text>;
                        })
                      : item?.companion?.map((item, i) => {
                          return <Text key={i}>{item?.first_name}</Text>;
                        })
                  }
                  detailsStyle={{ textTransform: "capitalize" }}
                />
                <Content
                  label="Temperature"
                  details={
                    typeof item?.temperature === "string"
                      ? JSON.parse(item?.temperature).map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                      : item?.temperature.map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                  }
                />
                <Content
                  label="Tare Weight"
                  details={
                    typeof item?.tare_weight === "string"
                      ? JSON.parse(item?.tare_weight).map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                      : item?.tare_weight.map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                  }
                />
                <Content
                  label="Gross Weight"
                  details={
                    typeof item?.gross_weight === "string"
                      ? JSON.parse(item?.gross_weight).map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                      : item?.gross_weight.map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                  }
                />
                <Content
                  label="Net Weight"
                  details={
                    typeof item?.net_weight === "string"
                      ? JSON.parse(item?.net_weight).map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                      : item?.net_weight.map((item, i) => {
                          return <Text key={i}>{item}</Text>;
                        })
                  }
                />
                <Content label="DOA Count" details={item?.doa_count} />
              </Card.Content>
            </Card>

            {newLocations.length > 0 && (
              <Card style={styles.containerWrapper}>
                <Card.Content>
                  <Text>Location Details</Text>
                  <Line />

                  {newLocations?.map((loc, i) => {
                    return (
                      <Fragment key={i}>
                        <Content
                          label="Status"
                          details={loc?.status}
                          detailsStyle={{
                            textTransform: "capitalize",
                            color:
                              loc?.status === "left"
                                ? colors.danger
                                : colors.success,
                          }}
                        />
                        <Content
                          label="Date"
                          details={
                            loc?.date &&
                            moment(loc.date)
                              .tz("Asia/Manila")
                              .format("MMM-DD-YY hh:mm a")
                          }
                        />
                        <Content
                          label="Address"
                          details={`${loc?.address[0]?.name || "(No Name)"}  ${
                            loc?.address[0]?.district || "(No District)"
                          } ${loc?.address[0]?.city || "(No City)"}  ${
                            loc?.address[0]?.subregion || "(No Subregion)"
                          }`}
                        />

                        {newLocations.length !== i + 1 && <MapDivider />}
                      </Fragment>
                    );
                  })}
                </Card.Content>
              </Card>
            )}

            {item?.diesels.length > 0 && (
              <Card style={styles.containerWrapper}>
                <Card.Content>
                  <Text>Diesels Details</Text>
                  <Line />
                  {item?.diesels?.map((diesel, i) => {
                    return (
                      <Fragment key={i}>
                        <Content
                          label="Station"
                          details={diesel?.gas_station_name}
                          detailsStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                        <Content label="Odometer" details={diesel?.odometer} />
                        <Content label="Liter" details={diesel?.liter} />
                        <Content
                          label="Amount"
                          details={`₱ ${diesel?.amount}`}
                        />

                        {item.diesels.length !== i + 1 && <MapDivider />}
                      </Fragment>
                    );
                  })}
                </Card.Content>
              </Card>
            )}
          </ScrollView>
        </View>

        {(newLocations.length % 2 !== 0 ||
          newLocations.length === 0 ||
          isNaN(item?.odometer_done)) && (
          <View
            style={{
              paddingBottom: 15,
              paddingHorizontal: 10,
              marginHorizontal: 10,
            }}
          >
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
                  params: {
                    trip_type: item?.trip_type,
                  },
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

export default withTheme(DepotDetailsScreen);
