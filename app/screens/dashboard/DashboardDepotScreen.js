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
import { useDispatch, useSelector } from "react-redux";
import {
  useGetAllTripsDeliveryQuery,
  useGetAllTripsHaulingQuery,
} from "../../api/metroApi";
import Screen from "../../components/Screen";
import useParams from "../../hooks/useParams";
import { Ionicons } from "@expo/vector-icons";
import useDisclosure from "../../hooks/useDisclosure";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import DashboardCamera from "../../components/DashboardCamera";
import useAuth from "../../auth/useAuth";
import { selectTable } from "../../utility/sqlite";
import SyncingAnimation from "../../components/loading/SyncingAnimation";
import * as Notifications from "expo-notifications";
import useToast from "../../hooks/useToast";
import DepotListItem from "../../components/dashboard/DepotListItem";
import DropDownPicker from "react-native-dropdown-picker";
import { setDepotTripCateogry } from "../../redux-toolkit/counter/depotTripCategorySlice";

const DashboardDepotScreen = ({ theme, navigation }) => {
  const { colors } = theme;
  const { logout } = useAuth();

  // HOOKS
  const { showAlert } = useToast();

  // FOR INTERNET STATUS
  const net = useSelector((state) => state.net.value);

  // STATE
  const [noData, setNoData] = useState(false);
  const [offSet, setOffSet] = useState(0);
  const [offlineLoading, setOfflineLoading] = useState(true);

  // SCROLL
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  // FOR USER DETAILS
  const user = useSelector((state) => state.token.userDetails);
  const validator = useSelector((state) => state.validator.value);
  const depotTripCategory = useSelector(
    (state) => state?.depotTripCategory?.value
  );

  const dispatch = useDispatch();

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

  // FOR DROPDOWN
  const {
    isOpen: showDropdown,
    onToggle: onToggleDropdown,
    onClose: onCloseDropdown,
  } = useDisclosure();

  const [dropdownValue, setDropdownValue] = useState(depotTripCategory);
  const [dropdownItems, setDropdownItems] = useState([
    { label: "Depot", value: "depot", disabled: true },
    { label: "Hauling", value: "hauling", parent: "depot" },
    { label: "Delivery", value: "delivery", parent: "depot" },
  ]);
  useEffect(() => {
    dispatch(setDepotTripCateogry(dropdownValue));
  }, [dropdownValue]);

  // FOR RTK
  const { reset, setState, state } = useParams();

  // STATE FOR RTK
  const opt1 = {
    page: state.page,
    limit: state.limit,
    searchBy: state.searchBy,
    date: state.date,
  };

  const opt2 = {
    refetchOnMountOrArgChange: true,
    skip: !net,
  };

  const { data, isLoading, isFetching, error, isError } =
    depotTripCategory === "hauling"
      ? useGetAllTripsHaulingQuery(opt1, opt2)
      : useGetAllTripsDeliveryQuery(opt1, opt2);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });

    !net && handleOfflineTrip();

    return () => {
      Notifications.cancelAllScheduledNotificationsAsync();
    };
  }, []);

  useEffect(() => {
    fetchTrip();
    return () => {
      null;
    };
  }, [data, state, net]);

  // Function

  const handleUnfinishedTrip = () => {
    const content = {
      title: `Fresh Morning ${
        user.first_name[0].toUpperCase() +
        user.first_name.substring(1).toLowerCase()
      } `,
      body: "You have an unfinished trip. Please resume it or report to your immediate supervisor",
    };

    Notifications.scheduleNotificationAsync({
      content,
      trigger: null,
    });
  };

  const handleNotSyncNotif = () => {
    if (!net) {
      const content = {
        title: `Fresh Morning`,
        body: "You have an unsynced trip. Please sync it as soon as you have access to the Internet.",
      };

      Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    } else {
      const content = {
        title: `Fresh Morning`,
        body: "You already have access to the internet. Please sync the trip.",
      };

      Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    }
  };

  const fetchTrip = async () => {
    if (!isLoading && !isFetching && net) {
      if (data?.data?.length === 0) {
        setNoData(true);
      }

      // if (state?.page === 1 && data?.data?.length !== 0)
      if (state?.page === 1) {
        setTrip(data?.data);
        setTotalCount(data?.data?.length);
        handleOfflineTrip();
      } else {
        data?.data.map((item) => {
          setTrip((prevState) => [...prevState, item]);
        });
        setTotalCount((prevState) => prevState + data?.data?.length);
      }
    }
  };

  const handleOfflineTrip = async () => {
    setOfflineLoading(true);

    if (depotTripCategory === "hauling") {
      const res = await selectTable("depot_hauling");
      if (res?.length > 0) {
        validator ? handleNotSyncNotif() : handleUnfinishedTrip();

        await res.map((item) => {
          if (user?.userId !== item?.user_id) {
            return null;
          }
          setTrip((prevState) => {
            if (prevState?.length > 0) {
              return [
                {
                  _id: item.id,
                  vehicle_id: item.vehicle_id,
                  companion: JSON.parse(item?.companion),
                  diesels: JSON.parse(item?.gas),
                  locations: JSON.parse(item?.locations),
                  odometer: JSON.parse(item?.odometer),
                  odometer_done: parseFloat(JSON.parse(item?.odometer_done)),
                  points: JSON.parse(item?.points),
                  image: JSON.parse(item?.image),
                  user_id: {
                    _id: user?.userId,
                    trip_template: user?.trip_template,
                  },
                  trip_date: JSON.parse(item?.date),
                  others: item?.others,
                  offline: true,
                  charging: item?.charging,

                  trip_type: item?.trip_type,
                  trip_category: item?.trip_category,
                  destination: item?.destination,
                  farm: item?.farm,
                  temperature: item?.temperature,
                  tare_weight: item?.tare_weight,
                  gross_weight: item?.gross_weight,
                  net_weight: item?.net_weight,
                  item_count: item?.item_count,
                  doa_count: item?.doa_count,
                },
                ...prevState,
              ];
            }
            return [
              {
                _id: item.id,
                vehicle_id: item.vehicle_id,
                companion: JSON.parse(item?.companion),
                diesels: JSON.parse(item?.gas),
                locations: JSON.parse(item?.locations),
                odometer: JSON.parse(item?.odometer),
                odometer_done: parseFloat(JSON.parse(item?.odometer_done)),
                points: JSON.parse(item?.points),
                image: JSON.parse(item?.image),
                user_id: {
                  _id: user?.userId,
                  trip_template: user?.trip_template,
                },
                trip_date: JSON.parse(item?.date),
                others: item?.others,
                offline: true,
                charging: item?.charging,

                trip_type: item?.trip_type,
                trip_category: item?.trip_category,
                destination: item?.destination,
                farm: item?.farm,
                temperature: item?.temperature,
                tare_weight: item?.tare_weight,
                gross_weight: item?.gross_weight,
                net_weight: item?.net_weight,
                item_count: item?.item_count,
                doa_count: item?.doa_count,
              },
              // ...prevState,
            ];
          });
          setTotalCount((prevState) => prevState + 1);
        });
      }
    } else {
      const resDelivery = await selectTable("depot_delivery");
      if (resDelivery?.length > 0) {
        validator ? handleNotSyncNotif() : handleUnfinishedTrip();

        await resDelivery.map((item) => {
          if (user?.userId !== item?.user_id) {
            return null;
          }
          setTrip((prevState) => {
            if (prevState?.length > 0) {
              return [
                {
                  _id: item.id,
                  vehicle_id: item.vehicle_id,
                  companion: JSON.parse(item?.companion),
                  diesels: JSON.parse(item?.gas),
                  locations: JSON.parse(item?.locations),
                  odometer: JSON.parse(item?.odometer),
                  odometer_done: parseFloat(JSON.parse(item?.odometer_done)),
                  points: JSON.parse(item?.points),
                  image: JSON.parse(item?.image),
                  user_id: {
                    _id: user?.userId,
                    trip_template: user?.trip_template,
                  },
                  trip_date: JSON.parse(item?.date),
                  others: item?.others,
                  offline: true,
                  charging: item?.charging,

                  trip_type: item?.trip_type,
                  trip_category: item?.trip_category,
                  destination: item?.destination,
                  route: item?.route,
                  temperature: item?.temperature,
                  crates_transaction: JSON.parse(item?.crates_transaction),
                },
                ...prevState,
              ];
            }
            return [
              {
                _id: item.id,
                vehicle_id: item.vehicle_id,
                companion: JSON.parse(item?.companion),
                diesels: JSON.parse(item?.gas),
                locations: JSON.parse(item?.locations),
                odometer: JSON.parse(item?.odometer),
                odometer_done: parseFloat(JSON.parse(item?.odometer_done)),
                points: JSON.parse(item?.points),
                image: JSON.parse(item?.image),
                user_id: {
                  _id: user?.userId,
                  trip_template: user?.trip_template,
                },
                trip_date: JSON.parse(item?.date),
                others: item?.others,
                offline: true,
                charging: item?.charging,

                trip_type: item?.trip_type,
                trip_category: item?.trip_category,
                destination: item?.destination,
                route: item?.route,
                temperature: item?.temperature,
                crates_transaction: JSON.parse(item?.crates_transaction),
              },
              // ...prevState,
            ];
          });
          setTotalCount((prevState) => prevState + 1);
        });
      }
    }

    setOfflineLoading(false);
  };

  const onDateSelected = async (event, value) => {
    if (event.type === "dismissed") return onClose();
    onClose();

    if (!isFetching && !offlineLoading && net) {
      setTotalCount(0);
      setTrip([]);
      setDate(value);
      setSearch(dayjs(value).format("MM-DD-YY"));
      setState((prevState) => ({
        ...prevState,
        date: dayjs(value).format("YYYY-MM-DD"),
        page: 1,
      }));
    } else {
      showAlert(
        isFetching || offlineLoading
          ? "App is loading."
          : "No internet detected. Please connect to internet and try again.",
        "danger"
      );
    }
  };

  const onRefresh = async () => {
    if (isFetching) {
      showAlert(
        "Already loading. Reload the app if it is still processing.",
        "warning"
      );
    } else if (!isFetching && !offlineLoading && net) {
      setNoData(false);
      setSearch(null);
      setDate(new Date());
      reset();
    }
  };

  const onEndReached = async () => {
    if (
      trip?.length >= 25 &&
      !isFetching &&
      !offlineLoading &&
      !noData &&
      net
    ) {
      setState((prevState) => ({ ...prevState, page: prevState.page + 1 }));
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <DepotListItem
        key={index}
        item={item}
        onPress={() => navigation.navigate("TripDetails", { item })}
        setTrip={setTrip}
        setTotalCount={setTotalCount}
        page={state?.page}
      />
    );
  };

  // ANIMATION
  useEffect(() => {
    offSet === 0 && slideIn();

    return () => {
      null;
    };
  }, [offSet]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };

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
    setOffSet(currentScrollPos);

    if (currentScrollPos > prevScrollPos) {
      // Scroll Down
      slideOut();
    } else {
      // Scroll Up
      slideIn();
    }
    return setPrevScrollPos(currentScrollPos);
  };

  if (isLoading) {
    return <SyncingAnimation />;
  }

  if (isError && !noData) {
    setNoData(true);
    showAlert(
      `${
        error?.data?.error ||
        "Please make sure you have internet connection to fetch trip."
      }`,
      !net ? "danger" : "warning"
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
                source={require("../../assets/placeholder/profile_placeholder.png")}
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
              setSearch(null);
              setDate(new Date());
              onRefresh();
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
            {totalCount === 1 && !isFetching && !offlineLoading && !isLoading
              ? `${totalCount} item`
              : totalCount > 1 && !isFetching && !offlineLoading && !isLoading
              ? `${totalCount} items`
              : !isFetching && !offlineLoading && !isLoading
              ? "No item found"
              : isFetching || offlineLoading || isLoading
              ? "Loading"
              : "No more data to show"}
          </Text>
        </View>

        {/* LIST ITEM */}
        {trip && !isLoading && (
          <FlatList
            ref={flatListRef}
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
              (isFetching || offlineLoading) && !noData ? (
                <View style={{ paddingVertical: 10 }}>
                  <ActivityIndicator animating={true} color={colors.primary} />
                </View>
              ) : (
                !isFetching &&
                noData &&
                trip?.length > 25 && (
                  <Text style={{ textAlign: "center", paddingVertical: 10 }}>
                    No data to show
                  </Text>
                )
              )
            }
          />
        )}

        {/* CAMERA */}
        {!isFetching && !isLoading && (
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

          <Text>Select trip to show:</Text>

          {/* DROPDOWN */}
          <View>
            <DropDownPicker
              open={showDropdown}
              value={dropdownValue}
              items={dropdownItems}
              setOpen={onToggleDropdown}
              setValue={setDropdownValue}
              setItems={setDropdownItems}
              onChangeValue={onLogoutClose}
              placeholder="Select department"
              textStyle={{ fontFamily: "Khyay", fontSize: 16 }}
              style={{
                borderRadius: 20,
                // borderColor: colors.light,
                borderColor: "transparent",
                marginBottom: 12,

                elevation: 2,
              }}
              dropDownContainerStyle={{
                borderColor: colors.notActive,
                // backgroundColor: "#eeeeee",

                maxHeight: 150,
                borderRadius: 0,
              }}
              selectedItemLabelStyle={{ color: colors.primary }}
              listParentContainerStyle={{ backgroundColor: colors.notActive }}
              listParentLabelStyle={{ color: colors.light }}
            />
          </View>

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

export default withTheme(DashboardDepotScreen);
