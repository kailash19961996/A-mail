export const API_CONFIG = {
  BASE_URL: 'https://zs4uqp3kgh.execute-api.eu-west-2.amazonaws.com/dev',
  ENDPOINTS: {
    HEALTH: '/health',
    TICKETS: '/tickets',
    TICKET_BY_ID: (id: string) => `/tickets/${id}`,
    TICKET_MESSAGES: (id: string) => `/tickets/${id}/messages`
  }
}