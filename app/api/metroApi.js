import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import useStorage from "../auth/useStorage";

const baseURL = process.env.BASEURL;

const { getToken } = useStorage();

export const metroApi = createApi({
  reducerPath: "metroApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    mode: "cors",
    prepareHeaders: async (headers) => {
      const token = JSON.parse(await getToken());
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Trip", "Hauling", "Delivery", "Live"],
  endpoints: (builder) => ({
    // T R I P S
    getAllTrips: builder.query({
      query: (params) =>
        `/office/apk-trips?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Trip"],
    }),
    createTrip: builder.mutation({
      query: (payload) => ({
        url: "/office/apk-trip",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Trip"],
      // provides: (result) => [{ type: "Trip", id: result.id }],
    }),

    // HAULING
    getAllTripsHauling: builder.query({
      query: (params) =>
        `/depot/apk-trips-hauling?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Hauling"],
    }),
    createHaulingTrip: builder.mutation({
      query: (payload) => ({
        url: "/depot/trip-hauling",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Hauling"],
      // provides: (result) => [{ type: "Trip", id: result.id }],
    }),

    // DELIVERY
    getAllTripsDelivery: builder.query({
      query: (params) =>
        `/depot/apk-trips-delivery?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Delivery"],
    }),
    createDeliveryTrip: builder.mutation({
      query: (payload) => ({
        url: "/depot/trip-delivery",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Delivery"],
    }),

    // LIVE
    getAllTripsLive: builder.query({
      query: (params) =>
        `/live/apk-trips-live?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Live"],
    }),
    createLiveTrip: builder.mutation({
      query: (payload) => ({
        url: "/live/trip-live",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: "Live",
    }),
  }),
});

export const {
  useGetAllTripsQuery,
  useCreateTripMutation,
  useGetAllTripsHaulingQuery,
  useCreateHaulingTripMutation,
  useGetAllTripsDeliveryQuery,
  useCreateDeliveryTripMutation,
  useGetAllTripsLiveQuery,
  useCreateLiveTripMutation,
} = metroApi;
