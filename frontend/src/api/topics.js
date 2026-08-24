import { apiRequest } from './client.js';

export async function getTopics() {
  return apiRequest('/topics');
}

export async function getTopicPeople(topicId) {
  return apiRequest(`/topics/${topicId}/people`);
}

export async function getTopicEvents(topicId) {
  return apiRequest(`/topics/${topicId}/events`);
}