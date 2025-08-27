import { ROOTS_LOCATIONS } from '@/routes/api_endpoints'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axios from 'axios'
import { axiosBaseQuery } from '../store/axiosBaseQuery'

export interface Location {
    id: number
    address: string
    type: string
    lat?: number  // For backward compatibility
    lon?: number  // For backward compatibility
    latitude: number  // Primary coordinate field
    longitude: number // Primary coordinate field
}

export interface LocationList {
    id: number
    title: string
    location_ids: number[]
}

export const savedApi = createApi({
    reducerPath: 'savedApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Location', 'List'],
    endpoints: (builder) => ({

        // Locations
        getLocations: builder.query<Location[], void>({
            query: () => ({
                url: '/places/',
                method: 'GET',
            }),
            providesTags: ['Location'],
            transformResponse: (response: any[]) => {
                // Transform response to ensure consistent coordinate fields
                return response.map((location: any) => ({
                    ...location,
                    // Ensure we have both formats for compatibility
                    lat: location.latitude || location.lat,
                    lon: location.longitude || location.lon,
                    latitude: location.latitude || location.lat,
                    longitude: location.longitude || location.lon,
                }));
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    console.log('✅ Success in slice:fetching or refetching', data)
                } catch (error) {
                    console.error('❌ Error in slice:', error)
                }
            },
        }),


        getLocationById: builder.query<Location, number>({
            query: (id) => ({url: `places/${id}/`,method: 'GET',}),
            providesTags: (result, error, id) => [{ type: 'Location', id }],
        }),

        createLocation: builder.mutation<void, Partial<Location>>({
            query: (data) => ({
                url: '/places/',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Location'],
            
        }),

        updateLocation: builder.mutation<void, { id: number; data: Partial<Location> }>({
            query: ({ id, data }) => ({
                url: `/places/${id}/`,
                method: 'PUT',
                data,
            }),
            invalidatesTags: ['Location'],
        }),

        deleteLocation: builder.mutation<void, number>({
            query: (id) => ({
                url: `places/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Location'],
        }),


        // Lists
        getLists: builder.query<LocationList[], void>({
            query: (id) => ({url: `lists/`,method: 'GET',}),
            providesTags: ['List'],
        }),

        createList: builder.mutation<void, Partial<LocationList>>({
            query: (data) => ({
                url: 'lists/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['List'],
        }),

        updateList: builder.mutation<void, { id: number; data: Partial<LocationList> }>({
            query: ({ id, data }) => ({
                url: `lists/${id}/`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['List'],
        }),

        deleteList: builder.mutation<void, number>({
            query: (id) => ({
                url: `lists/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['List'],
        }),
    }),
})

// Utility function to get icon and color for location types
export const getLocationTypeConfig = (type: string, translate?: (key: string) => string) => {
    const configs: Record<string, { icon: any, color: string, description: string }> = {
        home: { 
            icon: 'Home', 
            color: 'text-green-500', 
            description: translate ? translate('locationTypes.home') : 'Home locations' 
        },
        work: { 
            icon: 'Briefcase', 
            color: 'text-blue-500', 
            description: translate ? translate('locationTypes.work') : 'Work locations' 
        },
        visited: { 
            icon: 'MapPin', 
            color: 'text-purple-500', 
            description: translate ? translate('locationTypes.visited') : 'Places you have visited' 
        },
        favorites: { 
            icon: 'Heart', 
            color: 'text-red-500', 
            description: translate ? translate('locationTypes.favorites') : 'Your favorite places' 
        },
        starred: { 
            icon: 'Star', 
            color: 'text-yellow-500', 
            description: translate ? translate('locationTypes.starred') : 'Starred locations' 
        },
        restaurant: { 
            icon: 'Utensils', 
            color: 'text-orange-500', 
            description: translate ? translate('locationTypes.restaurant') : 'Restaurants' 
        },
        hotel: { 
            icon: 'Building', 
            color: 'text-indigo-500', 
            description: translate ? translate('locationTypes.hotel') : 'Hotels' 
        },
        shopping: { 
            icon: 'ShoppingBag', 
            color: 'text-pink-500', 
            description: translate ? translate('locationTypes.shopping') : 'Shopping locations' 
        },
    };
    
    return configs[type] || { 
        icon: 'MapPin', 
        color: 'text-gray-500', 
        description: translate ? translate('locationTypes.other') : 'Other locations' 
    };
};

// Get all available location types
export const getAllLocationTypes = () => {
    return ['home', 'work', 'favorites', 'starred', 'restaurant', 'hotel', 'shopping', 'visited'];
};

// Selector to get all location types with counts (including empty ones)
export const selectLocationTypes = (locations: Location[], translate?: (key: string) => string) => {
    // Start with all available types
    const allTypes = getAllLocationTypes();
    
    // Initialize all types with empty data
    const typeGroups = allTypes.reduce((acc, type) => {
        acc[type] = {
            type,
            count: 0,
            locations: [],
            config: getLocationTypeConfig(type, translate)
        };
        return acc;
    }, {} as Record<string, { 
        type: string; 
        count: number; 
        locations: Location[]; 
        config: ReturnType<typeof getLocationTypeConfig> 
    }>);

    // Populate with actual location data
    locations.forEach((location) => {
        const type = location.type || 'other';
        if (typeGroups[type]) {
            typeGroups[type].count++;
            typeGroups[type].locations.push(location);
        } else {
            // Handle unknown types
            if (!typeGroups[type]) {
                typeGroups[type] = {
                    type,
                    count: 1,
                    locations: [location],
                    config: getLocationTypeConfig(type, translate)
                };
            }
        }
    });

    return Object.values(typeGroups);
};

export const {
    useGetLocationsQuery,
    useGetLocationByIdQuery,
    useCreateLocationMutation,
    useUpdateLocationMutation,
    useDeleteLocationMutation,
    useGetListsQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
} = savedApi
