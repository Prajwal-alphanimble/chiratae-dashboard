import axios from 'axios';

export const hasuraRequest = async (query, variables = {}) => {
  const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
  // lib/graphqlClient.ts

  // Setup headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add authentication
  if (HASURA_ADMIN_SECRET) {
    headers['x-hasura-admin-secret'] = HASURA_ADMIN_SECRET;
  } else if (process.env.AUTH_TOKEN) {
    headers['Authorization'] = process.env.AUTH_TOKEN;
  }

  try {
    // Using axios instead of fetch
    const response = await axios({
      url: HASURA_ENDPOINT,
      method: 'POST',
      headers,
      data: {
        query,
        variables,
      },
      // Optional settings
      timeout: 30000, // 30 second timeout
    });

    // Access response data directly (axios already parses JSON)
    const result = response.data;

    // Check for GraphQL errors
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    // Enhanced error handling with axios
    if (axios.isAxiosError(error)) {
      console.error('GraphQL request failed:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);

      // You can handle different status codes differently
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Check your admin secret or token.');
      } else if (error.response?.status === 404) {
        throw new Error('Hasura endpoint not found. Check your HASURA_ENDPOINT value.');
      }
    }

    // Re-throw the original error or a wrapped version
    console.error('GraphQL request failed:', error);
    throw error;
  }
};

// Example usage:
/*
const fetchUsers = async () => {
  const query = `
    query GetUsers {
      users {
        id
        name
        email
      }
    }
  `;
  
  try {
    const data = await hasuraRequest(query);
    return data.users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};
*/
