import { AddressSearchResponse, Feature } from './types/GeocodingApi';
import fetch from 'node-fetch';
import { Place } from './types/RoutingApi';
import * as dotenv from 'dotenv';
dotenv.config();


/**
 * "Address search can be used to search addresses and points of interest (POIs).
 * An address is matched to its corresponding geographic coordinates and in the
 * simplest search, you can provide only one parameter, the text you want to
 * match in any part of the location details."
 *
 * https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/
 *
 * @param text a name or an address of a place
 * @param size the maximum number of matches to fetch
 * @returns
 */
export async function addressSearch(text: string, size: number = 1): Promise<AddressSearchResponse> {
    let encoded = encodeURIComponent(text);
    let res = await fetch(`https://api.digitransit.fi/geocoding/v1/search?text=${encoded}&size=${size}`, {
        headers: {
            'digitransit-subscription-key': process.env['DIGITRANSIT_API_KEY']!
        }
    });

    if (!res.ok) {
        throw new Error(JSON.stringify(res));
    }

    let data = await res.json();
    return data as AddressSearchResponse;
}

/**
 * Searches for the given search string, and returns the best match as a Place object.
 * If no matches are found, null is returned.
 */
export async function findPlace(search: string): Promise<Place | null> {
    let result = await addressSearch(search, 1);
    if (result.features.length > 0) {
        return asPlace(result.features[0]);
    }
    return null;
}

/**
 * Converts the "Feature" object used in Geocoding API into a "Place" object used in Routing API.
 */
function asPlace(feature: Feature): Place {
    let [lon, lat] = feature.geometry.coordinates;
    return {
        name: feature.properties.label,
        lat,
        lon
    };
}