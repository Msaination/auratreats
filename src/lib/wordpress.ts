type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

const productionGraphqlEndpoint = "https://spa.auraretreat.co.za/graphql";

function getGraphqlEndpoint() {
  if (typeof process !== "undefined") {
    return process.env?.WORDPRESS_GRAPHQL_ENDPOINT ?? productionGraphqlEndpoint;
  }
  return productionGraphqlEndpoint;
}

export async function wordpressQuery<T>(query: string): Promise<T> {
  const response = await fetch(getGraphqlEndpoint(), {
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
