const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_DEFAULT_COUNTRY = "in";
const RETRY_DELAY_MS = 750;

export type FetchAdzunaJobsOptions = {
  country?: string;
  what: string;
  where?: string | null;
  page?: number;
  results_per_page?: number;
};

export type NormalizedAdzunaJob = {
  sourceId: string;
  title: string;
  company?: string;
  location?: string;
  country?: string;
  url: string;
  created: string;
  isRemote: boolean;
  raw: Record<string, unknown>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeJob = (job: Record<string, any>): NormalizedAdzunaJob => {
  const locationString =
    job?.location?.display_name ??
    [job?.location?.area?.join(", "), job?.location?.display_name]
      .filter(Boolean)
      .join(" - ") ??
    undefined;

  const title: string = job?.title ?? "Untitled role";
  const isRemote =
    Boolean(job?.remote) ||
    /remote|work from home|wfh/i.test(title) ||
    /remote/i.test(locationString ?? "");

  return {
    sourceId: String(job?.id ?? job?.external_id ?? job?.redirect_url),
    title,
    company: job?.company?.display_name,
    location: locationString,
    country: job?.location?.area?.at(0),
    url: job?.redirect_url ?? job?.url ?? "",
    created: job?.created ?? new Date().toISOString(),
    isRemote,
    raw: job,
  };
};

const buildUrl = ({
  country = ADZUNA_DEFAULT_COUNTRY,
  what,
  where,
  page = 1,
  results_per_page = 20,
}: FetchAdzunaJobsOptions) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error(
      "Missing ADZUNA_APP_ID or ADZUNA_APP_KEY. Please update your environment."
    );
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: what.trim(),
    results_per_page: String(results_per_page),
  });

  if (where) {
    params.set("where", where.trim());
  }

  return `${ADZUNA_BASE_URL}/${country}/search/${page}?${params.toString()}`;
};

export const fetchAdzunaJobs = async (
  options: FetchAdzunaJobsOptions
): Promise<NormalizedAdzunaJob[]> => {
  const url = buildUrl(options);

  const fetchWithRetry = async (attempt = 0): Promise<NormalizedAdzunaJob[]> => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Adzuna request failed: ${response.status} ${body}`);
      }

      const payload = await response.json();
      const results = Array.isArray(payload?.results) ? payload.results : [];

      return results.map(normalizeJob);
    } catch (error) {
      if (attempt < 1) {
        await sleep(RETRY_DELAY_MS);
        return fetchWithRetry(attempt + 1);
      }

      console.error("[adzuna] request failed", error);
      throw error;
    }
  };

  return fetchWithRetry();
};

