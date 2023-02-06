import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Modal,
  Portal,
  Searchbar,
  Text,
  withTheme,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { useGetAllTripsQuery } from "../api/metroApi";
import Screen from "../components/Screen";
import useParams from "../hooks/useParams";
import { Ionicons } from "@expo/vector-icons";
import useDisclosure from "../hooks/useDisclosure";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import ListItem from "../components/dashboard/ListItem";
import DashboardCamera from "../components/DashboardCamera";
import useAuth from "../auth/useAuth";
import { selectTable } from "../utility/sqlite";

const DashboardScreen = ({ theme, navigation }) => {
  const { colors } = theme;
  const { logout } = useAuth();
  // FOR INTERNET STATUS
  const net = useSelector((state) => state.net.value);
  // STATE
  const [noData, setNoData] = useState(false);
  // SCROLL
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  // FOR USER DETAILS
  const user = useSelector((state) => state.token.userDetails);
  // FOR TRIP
  const [trip, setTrip] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // FOR SEARCH BAR
  const { isOpen, onClose, onToggle } = useDisclosure();
  const [date, setDate] = useState(new Date());
  const [search, setSearch] = useState(null);

  // FOR LOGOUT MODAL
  const {
    isOpen: showLogout,
    onToggle: onLogoutToggle,
    onClose: onLogoutClose,
  } = useDisclosure();
  // FOR RTK
  const { reset, setState, state } = useParams();
  const { data, isLoading, isError, isFetching, error } = useGetAllTripsQuery(
    {
      page: state.page,
      limit: state.limit,
      search: state.search,
      searchBy: state.searchBy,
      date: state.date,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    handleOfflineTrip();

    if (net) {
    }
    return () => {
      null;
    };
  }, []);

  useEffect(() => {
    fetchTrip();
    return () => {
      null;
    };
  }, [data]);

  // Function

  const fetchTrip = async () => {
    if (!isLoading && !isFetching) {
      if (data?.data.length === 0) {
        setNoData(true);
      }

      data?.data.map((item) => {
        setTrip((prevState) => [...prevState, item]);
      });

      setTotalCount((prevState) => prevState + data?.data.length);
    }
  };

  const handleOfflineTrip = async () => {
    const res = await selectTable("offline_trip");
    if (res.length > 0) {
      await res.map((item) => {
        setTrip((prevState) => [
          {
            _id: item.id,
            vehicle_id: item.vehicle_id,
            companion: JSON.parse(item.companion),
            diesels: JSON.parse(item.gas),
            locations: JSON.parse(item.locations),
            odometer: JSON.parse(item.odometer),
            odometer_done: JSON.parse(item.odometer_done),
            points: JSON.parse(item.points),
            image: JSON.parse(item.image),
            user_id: {
              _id: user.userId,
              trip_template: user.trip_template,
            },
            trip_date: JSON.parse(item.date),
            others: item.others,
            offline: true,
          },
          ...prevState,
        ]);
      });
    }
    setTotalCount((prevState) => prevState + res.length);
  };

  const onDateSelected = async (event, value) => {
    if (event.type === "dismissed") return onClose();
    setTotalCount(0);
    setTrip([]);
    setDate(value);
    setSearch(dayjs(value).format("MM-DD-YY"));
    setState((prevState) => ({
      ...prevState,
      date: dayjs(value).format("YYYY-MM-DD"),
      searchBy: "trip_date",
      page: 1,
    }));
    onClose();
  };

  const onRefresh = () => {
    if (isFetching) {
      dispatch(setMsg("Please wait fecthing to finish"));
      dispatch(setVisible(true));
      dispatch(setColor("warning"));
    } else if (trip.length > 25) {
      setTotalCount(0);
      setTrip([]);
      setNoData(false);
      setSearch(null);
      reset();

      // refetch offline and online trip
      handleOfflineTrip();
      fetchTrip();
    }
  };

  const onEndReached = async () => {
    if (trip.length >= 25 && !isFetching && !noData) {
      setState((prevState) => ({ ...prevState, page: prevState.page + 1 }));
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <ListItem
        key={index}
        item={item}
        onPress={() => navigation.navigate("TripDetails", { item })}
      />
    );
  };

  // ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 300,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 300,
      useNativeDriver: true,
      duration: 300,
    }).start();
  };

  const onScroll = (e) => {
    const currentScrollPos = e.nativeEvent.contentOffset.y;

    if (currentScrollPos > prevScrollPos) {
      // Scroll Down
      slideOut();
    } else {
      // Scroll Up
      slideIn();
    }
    return setPrevScrollPos(currentScrollPos);
  };

  if (isLoading && net) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>isLoading</Text>
      </View>
    );
  }

  if (isError && net) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error?.data?.error}</Text>
      </View>
    );
  }

  return (
    <>
      <Screen
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        {/* CARD FOR NAME AND IMAGE */}
        <View style={styles.cardWrapper}>
          <View>
            <Text style={{ color: colors.primary }}>Welcome</Text>
            <Text style={styles.name}>
              {user?.first_name &&
                `${user.first_name.split(" ")[0]} ${user.last_name}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              onLogoutToggle();
              onClose();
            }}
          >
            {user?.profile ? (
              <Image
                source={{ uri: `${process.env.BASEURL}/${user.profile}` }}
                style={styles.image}
              />
            ) : (
              <Image
                source={require("../assets/placeholder/profile_placeholder.png")}
                style={styles.image}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={{ position: "relative" }}>
          <Searchbar
            placeholder="Click the calendar to search"
            placeholderTextColor={colors.light}
            style={{ margin: 10, borderRadius: 20 }}
            elevation={1}
            editable={false}
            value={search}
            onIconPress={false}
            onChangeText={() => {
              setTotalCount(0);
              setNoData(false);
              setSearch(null);
              setTrip([]);
              reset();
              setDate(new Date());
              handleOfflineTrip();
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 25,
              top: 23,
              backgroundColor: colors.white,
              borderRadius: 10,
            }}
          >
            {!search && (
              <TouchableOpacity onPress={onToggle} disabled={null}>
                <Ionicons
                  name="ios-calendar-sharp"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* TOTAL ITEMS */}
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 17, color: colors.light }}>
            {/* {trip.length === 1 && !isFetching
              ? `${trip.length} item`
              : trip.length > 1 && !isFetching
              ? `${trip.length} items`
              : !isFetching
              ? "No item found"
              : "Loading"} */}

            {totalCount === 1 && !isFetching
              ? `${totalCount} item`
              : totalCount > 1 && !isFetching
              ? `${totalCount} items`
              : !isFetching
              ? "No item found"
              : "Loading"}
          </Text>
        </View>

        {/* LIST ITEM */}
        {trip && !isLoading ? (
          <FlatList
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            data={trip}
            onRefresh={onRefresh}
            renderItem={renderItem}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.0001}
            ItemSeparatorComponent={<Divider style={{ height: 1 }} />}
            ListFooterComponent={
              isFetching && !noData ? (
                <ActivityIndicator animating={true} color={colors.primary} />
              ) : (
                !isFetching &&
                noData && (
                  <Text style={{ textAlign: "center" }}>No data to show</Text>
                )
              )
            }
          />
        ) : (
          <Text>loading</Text>
        )}

        {/* CAMERA */}
        {trip && !isFetching && (
          <Animated.View
            style={{
              transform: [{ translateY: fadeAnim }],
              alignItems: "center",
              height: 50,
              width: "100%",
              position: "absolute",
              bottom: 0,
            }}
          >
            <DashboardCamera />
          </Animated.View>
        )}
      </Screen>

      {/* CALENDAR */}
      {isOpen && (
        <DateTimePicker
          value={date}
          mode={"date"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour={true}
          onChange={onDateSelected}
        />
      )}

      {/* LOGOUT MODAL */}
      <Portal>
        <Modal
          visible={showLogout}
          onDismiss={onLogoutClose}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity onPress={onLogoutClose}>
              <Ionicons name="ios-close-outline" size={30} />
            </TouchableOpacity>
          </View>

          <Text style={{ textAlign: "center" }}>Are you sure to logout?</Text>

          <Divider style={{ height: 15, backgroundColor: "transparent" }} />
          <Button
            mode="contained"
            contentStyle={{ backgroundColor: colors.danger }}
            onPress={logout}
          >
            Logout
          </Button>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  name: {
    fontSize: 30,
    textTransform: "capitalize",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
});

export default withTheme(DashboardScreen);
