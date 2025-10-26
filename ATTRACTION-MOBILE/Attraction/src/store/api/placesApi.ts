import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from './baseQueryWithReauth'; // 👈 usa lo stesso base query
import type {Place, PlaceRequest} from '../types/place';

export const placesApi = createApi({
  reducerPath: 'placesApi',
  baseQuery: baseQueryWithReauth, // 👈 ora usa le stesse credenziali del userApi
  tagTypes: ['Place'],
  endpoints: builder => ({
    // GET /api/auth/places/
    getPlaces: builder.query<Place[], void>({
      query: () => ({
        url: 'places/',
        method: 'GET',
        headers: {Accept: 'application/json'},
      }),
      providesTags: ['Place'],
    }),

    // GET /api/auth/places/{id}/
    getPlaceById: builder.query<Place, number>({
      query: id => ({
        url: `places/${id}/`,
        method: 'GET',
        headers: {Accept: 'application/json'},
      }),
      providesTags: (result, error, id) => [{type: 'Place', id}],
    }),

    // POST /api/auth/places/
    createPlace: builder.mutation<Place, PlaceRequest>({
      query: body => ({
        url: 'places/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Place'],
    }),

    // PUT /api/auth/places/{id}/
    updatePlace: builder.mutation<Place, {id: number; data: PlaceRequest}>({
      query: ({id, data}) => ({
        url: `places/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, {id}) => [{type: 'Place', id}],
    }),

    // PATCH /api/auth/places/{id}/
    patchPlace: builder.mutation<
      Place,
      {id: number; data: Partial<PlaceRequest>}
    >({
      query: ({id, data}) => ({
        url: `places/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, {id}) => [{type: 'Place', id}],
    }),

    // DELETE /api/auth/places/{id}/
    deletePlace: builder.mutation<void, number>({
      query: id => ({
        url: `places/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{type: 'Place', id}],
    }),
  }),
});

export const {
  useGetPlacesQuery,
  useGetPlaceByIdQuery,
  useCreatePlaceMutation,
  useUpdatePlaceMutation,
  usePatchPlaceMutation,
  useDeletePlaceMutation,
} = placesApi;
