import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import useStorage from "../auth/useStorage";

const baseURL = process.env.BASEURL;

const { getUser } = useStorage();

export const metroApi = createApi({
  reducerPath: "metroApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    mode: "cors",
    prepareHeaders: async (headers) => {
      const token = JSON.parse(await getUser());
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Trip", "User", "Vehicles", "GasStation"],
  endpoints: (builder) => ({
    // T R I P S
    getAllTrips: builder.query({
      query: (params) =>
        `/office/trips?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Trip"],
    }),
  }),
});

export const { useGetAllTripsQuery } = metroApi;
