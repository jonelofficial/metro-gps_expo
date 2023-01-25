import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Searchbar, Text, withTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import { useGetAllTripsQuery } from "../api/metroApi";
import Screen from "../components/Screen";
import useParams from "../hooks/useParams";
import { Ionicons } from "@expo/vector-icons";
import useDisclosure from "../hooks/useDisclosure";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

const DashboardScreen = ({ theme }) => {
  const { colors } = theme;
  const { reset, setState, state } = useParams();
  const user = useSelector((state) => state.token.userDetails);
  const { isOpen, onClose, onToggle } = useDisclosure();
  const [date, setDate] = useState(new Date());
  const [search, setSearch] = useState(null);

  const { data, isLoading, isError, isFetching, error } = useGetAllTripsQuery({
    page: state.page,
    limit: state.limit,
    search: state.search,
    searchBy: state.searchBy,
    date: state.date,
  });

  // Function

  console.log(state);

  const onDateSelected = async (event, value) => {
    if (event.type === "dismissed") return null;
    onClose();
    setDate(value);
    setSearch(dayjs(value).format("MM-DD-YY"));
    setState((prevState) => ({
      ...prevState,
      date: dayjs(value).format("YYYY-MM-DD"),
    }));
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>isLoading</Text>
      </View>
    );
  }

  if (isError) {
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
              {user && `${user.first_name.split(" ")[0]} ${user.last_name}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => console.log("image select")}>
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
            onChangeText={() => setSearch(null)}
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
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: colors.light }}>
            {data?.data.length === 1
              ? `${data.data.length} item`
              : data?.data.length > 1
              ? `${data.data.length} items`
              : "No item found"}
          </Text>
        </View>
      </Screen>

      {isOpen && (
        <DateTimePicker
          value={date}
          mode={"date"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour={true}
          onChange={onDateSelected}
        />
      )}
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
