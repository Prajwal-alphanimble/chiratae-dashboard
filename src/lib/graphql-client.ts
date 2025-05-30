export async function graphqlClient(query: string, variables: any) {
  const HASURA_ENDPOINT: string = process.env.NEXT_PUBLIC_HASURA_ENDPOINT || "";
  const HASURA_KEY: string = process.env.HASURA_ADMIN_SECRET || "";

  const response = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Log the response for debugging
  const jsonResponse = await response.json();
  console.log("GraphQL Response:", JSON.stringify(jsonResponse, null, 2));

  // Create a new response object with the same status and data
  return new Response(JSON.stringify(jsonResponse), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
    statusText: response.statusText,
  });
}
