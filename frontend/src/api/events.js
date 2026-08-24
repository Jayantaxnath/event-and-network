import { apiRequest } from './client.js';

export async function getEvents() {
  return apiRequest('/events');
}

export async function getEvent(eventId) {
  return apiRequest(`/events/${eventId}`);
}

export async function getEventDetails(eventId) {
  return apiRequest(`/events/${eventId}/details`);
}

export async function getEventAttendees(eventId) {
  return apiRequest(`/events/${eventId}/attendees`);
}

export async function getEventRecommendations(eventId, userId, limit = 10) {
  return apiRequest(`/events/${eventId}/recommendations?user_id=${userId}&limit=${limit}`);
}