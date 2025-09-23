const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getSearchItem = async (
  params: Record<string, any>,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const queryParams = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, encodeURIComponent(v)])
    ),
    page: page.toString(),
    limit: limit.toString(),
  });

  const apiUrl = `${URL}/api/admin/${STORE_ID}/search-item?${queryParams}`;

  const res = await fetch(apiUrl, { cache: "no-store" });

  if (!res.ok) {
    console.error("API Error:", res.status, await res.text());
    throw new Error("Failed to fetch search results");
  }

  const data = await res.json();
  return data;
};
