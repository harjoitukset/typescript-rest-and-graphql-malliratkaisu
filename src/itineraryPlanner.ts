import { Place, Plan, RoutingResponse } from './types/RoutingApi';

let formatCoord = (p: Place) => `{ lat: ${p.lat}, lon: ${p.lon} }`;

export async function planRoute(from: Place, to: Place, count: number = 3): Promise<Plan> {
    let query = `{
        plan(
            from: ${formatCoord(from)}
            to: ${formatCoord(to)}
            numItineraries: ${count}
        ) {
            itineraries {
                startTime
                endTime
                walkTime
                walkDistance
                legs {
                    from {
                        name
                        lat
                        lon
                    }
                    to {
                        name
                        lat
                        lon
                    }
                    startTime
                    endTime
                    mode
                    duration
                    distance
                    route {
                        shortName
                        longName
                    }
                }
            }
        }
    }`;

    let response = await fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
        headers: {
            'Content-Type': 'application/graphql',
            'digitransit-subscription-key': process.env['DIGITRANSIT_API_KEY']!
        },
        method: 'POST',
        body: query
    });

    if (!response.ok) {
        console.error(response);
        throw new Error('GraphQL query failed');
    }

    let routingResponse: RoutingResponse = await response.json();
    return routingResponse.data.plan;
}