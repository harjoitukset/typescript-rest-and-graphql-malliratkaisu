import { findPlace } from './addressSearch';
import { planRoute } from './itineraryPlanner';
import { Itinerary, Leg, Mode, Place } from './types/RoutingApi';

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

    const [origin, destination] = await Promise.all([findPlace(from), findPlace(to)]);

    if (!origin) {
        console.error(`Could not locate ${from}`);
        return;
    }

    if (!destination) {
        console.error(`Could not locate ${to}`);
        return;
    }

    console.log(`From: ${origin.name}`);
    console.log(`To:   ${destination.name}`);

    const route = await planRoute(origin, destination);

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

function printItinerary(itinerary: Itinerary) {
    const tripStart = new Date(itinerary.startTime);
    const tripEnd = new Date(itinerary.endTime);

    console.log(`\n### ${formatTripTime(tripStart, tripEnd)} ###\n`);

    for (let leg of itinerary.legs) {
        printLeg(leg);
    }
}

function printLeg(leg: Leg) {
    const legStart = new Date(leg.startTime);
    const legEnd = new Date(leg.endTime);
    const icon = icons[leg.mode];
    const routeName = leg.route?.shortName ?? '';

    console.log(`${icon} ${routeName} ${leg.from.name} -> ${leg.to.name}`);
    console.log(formatTripTime(legStart, legEnd), '\n');
}

function formatTripTime(start: Date, end: Date): string {
    const time1 = start.toLocaleTimeString();
    const time2 = end.toLocaleTimeString();

    const diffSeconds = (end.getTime() - start.getTime()) / 1_000;
    const diffMinutes = Math.round(diffSeconds / 60);
    return `${time1} - ${time2}, ${diffMinutes} minutes`;
}

main();

