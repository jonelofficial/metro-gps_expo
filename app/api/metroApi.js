import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseURL = process.env.BASEURL;

export const metroApi = createApi({
  reducerPath: "metroApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    mode: "cors",
    prepareHeaders: (headers) => {
      let token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Trip", "User", "Vehicles", "GasStation"],
  endpoints: (builder) => ({
    // TRIPS
    getAllTrips: builder.query({
      query: (params) =>
        `/office/trips?page=${params?.page}&limit=${params?.limit}&search=${params?.search}&searchBy=${params?.searchBy}&date=${params?.date}`,
      providesTags: ["Trip"],
    }),
  }),
});

export const { useGetAllTripsQuery } = metroApi;
