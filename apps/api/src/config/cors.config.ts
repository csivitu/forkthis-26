import type { CorsOptions } from "cors";

export function buildCorsOptions(
  webUrl: string,
  adminUrl: string,
): CorsOptions {
  return {
    origin: [webUrl, adminUrl],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  };
}
