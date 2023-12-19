import moment from "moment-timezone";
import React, { Fragment, useEffect, useState } from "react";
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
  Appbar,
  Card,
} from "react-native-paper";
import { useDispatch } from "react-redux";
import Screen from "../../../components/Screen";
import useDisclosure from "../../../hooks/useDisclosure";
import { validatorStatus } from "../../../redux-toolkit/counter/vaidatorSlice";
import { selectTable } from "../../../utility/sqlite";

const TripDetailsScreen = ({ route, theme, navigation }) => {
  const [station, setStation] = useState([]);
  const { item } = route.params;
  const { colors } = theme;

  const newLocations = item.locations
    .filter(
      (location) => location.status == "left" || location.status == "arrived"
    )
    .sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

  const { isOpen, onClose, onToggle } = useDisclosure();
  const {
    isOpen: isOpenDoneImg,
    onClose: onCloseDoneImg,
    onToggle: onToggleDoneImg,
  } = useDisclosure();

  const {
    isOpen: isLoading,
    onClose: onCloseLoading,
    onToggle: onToggleLoading,
  } = useDisclosure();

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const gasRes = await selectTable("gas_station");
      setStation([...gasRes.map((item) => ({ ...item, value: item._id }))]);
    })();

    return () => {
      null;
    };
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
            flex: 1.5,
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
            {item?.user_id?.employee_id != undefined && (
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

            {item?.vehicle_id?.plate_no != undefined && (
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

                {item?.odometer_done_image_path && (
                  <Content
                    label="Odo Done Image"
                    details={
                      <TouchableOpacity onPress={onToggleDoneImg}>
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
                  details={item?.companion.map((comp) => {
                    return comp?.first_name;
                  })}
                />
              </Card.Content>
            </Card>

            {newLocations.length > 0 && (
              <Card style={styles.containerWrapper}>
                <Card.Content>
                  <Text>Location Details</Text>
                  <Line />

                  {newLocations.map((loc, i) => {
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
                        {loc?.odometer && (
                          <Content label="Odometer" details={loc?.odometer} />
                        )}
                        {loc?.destination && (
                          <Content
                            label="Destination"
                            details={loc?.destination}
                          />
                        )}

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
                  {item.diesels.map((diesel, i) => {
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
          isNaN(item?.odometer_done) ||
          item?.odometer_done == null) && (
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

        <Modal
          visible={isOpenDoneImg}
          onDismiss={onCloseDoneImg}
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
              uri: `${process.env.BASEURL}/${item?.odometer_done_image_path}`,
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
            <Button onPress={onCloseDoneImg} textColor={colors.danger}>
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default withTheme(TripDetailsScreen);
