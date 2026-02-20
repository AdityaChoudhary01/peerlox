import Ably from 'ably/promises';

// Ensure the Ably client is cached in development to prevent 
// exhausting connection limits during hot-reloads.
const globalForAbly = global;

const ablyClient = globalForAbly.ably || new Ably.Rest({
  key: process.env.ABLY_API_KEY,
});

if (process.env.NODE_ENV !== 'production') {
  globalForAbly.ably = ablyClient;
}

/**
 * Publish a real-time event from the server
 * @param {string} channelName - The Ably channel to publish to
 * @param {string} eventName - The name of the event (e.g., 'new_notification')
 * @param {object} payload - The data to send
 */
// lib/ably.js
export async function publishServerEvent(channelName, eventName, payload) {
  try {
    // 🛡️ CRITICAL FIX: Ensure all IDs in the payload are strings before sending to Ably
    const safePayload = JSON.parse(JSON.stringify(payload)); 
    
    const channel = ablyClient.channels.get(channelName);
    await channel.publish(eventName, safePayload);
  } catch (error) {
    console.error(`Ably Publish Error on ${channelName}:`, error);
  }
}
export default ablyClient;