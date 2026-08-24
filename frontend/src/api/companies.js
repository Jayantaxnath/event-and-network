import { apiRequest } from './client.js';
import { getEvents, getEventAttendees } from './events.js';

let cachedCompanies = null;

export async function getCompanies(forceRefresh = false) {
  if (cachedCompanies && !forceRefresh) {
    return cachedCompanies;
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
        if (attendee.company_id && attendee.company_name) {
          if (!map.has(attendee.company_id)) {
            map.set(attendee.company_id, {
              id: attendee.company_id,
              name: attendee.company_name,
              industry: attendee.company_industry || 'General',
            });
          }
        }
      }
    }

    cachedCompanies = Array.from(map.values());
    return cachedCompanies;
  } catch (err) {
    console.error('Failed to load companies:', err);
    return cachedCompanies || [];
  }
}


export async function getCompany(companyId) {
  return apiRequest(`/companies/${companyId}`);
}

export async function getCompanyPeople(companyId) {
  return apiRequest(`/companies/${companyId}/people`);
}