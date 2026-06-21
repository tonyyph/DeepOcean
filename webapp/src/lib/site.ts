const DEFAULT_SITE_URL = "https://deepocean.io.vn";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
);
