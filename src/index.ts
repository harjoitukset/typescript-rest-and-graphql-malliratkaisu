import { addressSearch } from './addressSearch';
import { planRoute } from './itineraryPlanner';
import { Itinerary, Mode, Place } from './types/RoutingApi';
import { Feature } from './types/GeocodingApi';

const icons: Record<Mode, string> = {
    WALK: '🚶‍',
    BUS: '🚍',
    RAIL: '🚆',
    TRAM: '🚋',
    FERRY: '🚢',
    AIRPLANE: '🛫',
    BICYCLE: '🚲',
    CABLE_CAR: '🚠',
    CAR: '🚘',
    FUNICULAR: '🚟',
    GONDOLA: '🚡',
    LEG_SWITCH: '🔀',
    SUBWAY: '🚇',
    TRANSIT: '🏇'
};

async function main() {
    if (process.argv.length !== 4) {
        console.error('Usage: npm start "Ratapihantie 13" "suomenlinna"');
        return;
    }

    const from = process.argv[2];
    const to = process.argv[3];

    const origin = await getBestMatchingAddress(from);
    const destination = await getBestMatchingAddress(to);

    if (!origin) {
        console.error(`Could not locate ${from}`);
        return;
    }

    if (!destination) {
        console.error(`Could not locate ${to}`);
        return;
    }

    console.log(`From: ${origin.properties.label}`);
    console.log(`To:   ${destination.properties.label}`);

    const route = await planRoute(asPlace(origin), asPlace(destination));

    if (route.itineraries.length > 0) {
        for (let itinerary of route.itineraries) {
            printItinerary(itinerary);
            console.log();
        }

    } else {
        console.error('Could not find any itineraries');
        return;
    }
}

async function getBestMatchingAddress(search: string): Promise<Feature | undefined> {
    const response = await addressSearch(search);
    return response.features.at(0);
}

function asPlace(feature: Feature): Place {
    const [lon, lat] = feature.geometry.coordinates;
    return { lon, lat };
}

function printItinerary(itinerary: Itinerary) {
    const tripStart = new Date(itinerary.startTime);
    const tripEnd = new Date(itinerary.endTime);

    console.log(`\n### ${formatTripTime(tripStart, tripEnd)} ###\n`);

    for (let leg of itinerary.legs) {
        const legStart = new Date(leg.startTime);
        const legEnd = new Date(leg.endTime);
        const icon = icons[leg.mode];
        const routeName = leg.route?.shortName ?? '';

        console.log(`${icon} ${routeName} ${leg.from.name} -> ${leg.to.name}`);
        console.log(formatTripTime(legStart, legEnd), '\n');
    }
}

function formatTripTime(start: Date, end: Date): string {
    const time1 = start.toLocaleTimeString();
    const time2 = end.toLocaleTimeString();
    const diffInMs = Math.round(end.getTime() - start.getTime());

    const diffInMinutes = Math.round(diffInMs / 60_000); // 1 minute = 60 000 milliseconds
    return `${time1} - ${time2}, ${diffInMinutes} minutes`;
}

main();