const OPR_API_URL = "https://openpagerank.keywordseverywhere.com/v1/domains/bulk";
const OPR_TIMEOUT_MS = 5000;

export interface PageRankResult {
  domain: string;
  rank: number | null;
}

export async function getPageRank(domain: string): Promise<PageRankResult> {
  const apiKey = process.env.OPR_API_KEY;
  if (!apiKey) {
    return { domain, rank: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPR_TIMEOUT_MS);

  try {
    const response = await fetch(OPR_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domains: [domain], include_history: false }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return { domain, rank: null };
    }

    const data = await response.json();
    const result = data?.results?.[0];
    const rank = typeof result?.open_page_rank === "number" ? result.open_page_rank : null;

    return { domain, rank };
  } catch {
    return { domain, rank: null };
  } finally {
    clearTimeout(timeout);
  }
}
