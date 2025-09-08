export const API_CONFIG = {
  BASE_URL: 'https://exmbmulan6.execute-api.eu-west-2.amazonaws.com/prod',
  ENDPOINTS: {
    HEALTH: '/health',
    TICKETS: '/tickets',
    TICKET_BY_ID: (id: string) => `/tickets/${id}`,
    TICKET_MESSAGES: (id: string) => `/tickets/${id}/messages`
  }
}