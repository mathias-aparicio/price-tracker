import { startPolling } from '$lib/server/priceCache';

// Start the background polling when the server starts
startPolling();

export const handle = async ({ event, resolve }) => {
    return resolve(event);
};
