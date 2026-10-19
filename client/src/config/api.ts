const configuredApiUrl =
  import.meta.env.VITE_API_URL ||
  "https://intellmeet-server-lgxt.onrender.com";

const normalizedApiUrl = configuredApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export const API_URL = `${normalizedApiUrl}/api`;

export const SOCKET_URL = normalizedApiUrl;