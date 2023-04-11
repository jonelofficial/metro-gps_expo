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
  tagTypes: ["Trip", "Hauling"],
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
  }),
});

export const {
  useGetAllTripsQuery,
  useCreateTripMutation,
  useGetAllTripsHaulingQuery,
} = metroApi;
