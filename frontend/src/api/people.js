import { apiRequest } from './client.js';
import { getEvents, getEventAttendees } from './events.js';

let cachedPeople = null;

export async function getPeople(forceRefresh = false) {
  if (cachedPeople && !forceRefresh) {
    return cachedPeople;
  }

  try {
    const events = await getEvents();
    const map = new Map();

    const attendeePromises = events.map((event) =>
      getEventAttendees(event.id || event.event_id).catch(() => [])
    );
    const attendeesList = await Promise.all(attendeePromises);

    for (const attendees of attendeesList) {
      for (const attendee of attendees) {
        const id = attendee.person_id || attendee.id;
        if (id && !map.has(id)) {
          map.set(id, {
            person_id: id,
            id: id,
            person_name: attendee.person_name || attendee.name,
            name: attendee.person_name || attendee.name,
            title: attendee.title || 'Professional',
            bio: attendee.bio || '',
            company_id: attendee.company_id,
            company_name: attendee.company_name,
            company_industry: attendee.company_industry,
            topics: attendee.topics || [],
          });
        }
      }
    }

    cachedPeople = Array.from(map.values());
    return cachedPeople;
  } catch (err) {
    console.error('Failed to load people:', err);
    return cachedPeople || [];
  }
}

export async function getPerson(personId) {

  return apiRequest(`/people/${personId}`);
}

export async function getPersonCommonInterests(personId, limit = 20) {
  return apiRequest(`/people/${personId}/common-interests?limit=${limit}`);
}

export async function getNetworkPath(personAId, personBId) {
  try {
    return await apiRequest(`/people/${personAId}/path-to/${personBId}`);
  } catch (err) {
    // Preserve the detailed error structure from backend
    throw err;
  }
}