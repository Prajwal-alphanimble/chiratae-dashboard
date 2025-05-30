import { graphqlClient } from '@/lib/graphql-client';

/**
 * Generic function to fetch data from GraphQL
 * @param queryString - The GraphQL query string
 * @param variables - Variables to pass to the query
 * @returns Promise with the data
 */
export async function fetchGraphQLData<V = Record<string, any>>(
  queryString: string,
  variables: V
) {
  try {
    const res = await graphqlClient(queryString, variables);
    const jsonResponse = await res.json();

    if (jsonResponse.errors) {
      console.error('GraphQL Errors:', jsonResponse.errors);
    }

    return jsonResponse;
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    throw error;
  }
}

/**
 * Generate a basic query string for common entity retrieval patterns
 * @param entityName - Name of the entity to query (table name)
 * @param fields - Array of fields to retrieve
 * @param whereField - Optional field name to filter on
 * @returns GraphQL query string
 */
export function generateBasicQuery(
  entityName: string,
  fields: string[],
  whereField?: string
): string {
  const whereClause = whereField
    ? `(where: {${whereField}: {_eq: $${whereField}}})`
    : '';

  return `
    query Get${entityName}(${whereField ? `$${whereField}: String!` : ''}) {
      ${entityName}${whereClause} {
        ${fields.join('\n        ')}
      }
    }
  `;
}
