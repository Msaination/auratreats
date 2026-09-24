type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

const endpoint =
  process.env.WORDPRESS_GRAPHQL_ENDPOINT ??
  "https://staging.msikomultimedia.co.za/graphql"; 

export async function wordpressQuery<T>(query: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL request failed: ${response.status}`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors?.length) {
    throw new Error(result.errors.map(({ message }) => message).join("\n"));
  }

  if (!result.data) {
    throw new Error("WordPress GraphQL returned no data.");
  }

  return result.data;
}
