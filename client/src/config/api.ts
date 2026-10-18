const configuredApiUrl =
  import.meta.env.VITE_API_URL ||
  "https://intellmeet-server-lgxt.onrender.com";

export const API_URL = `${configuredApiUrl.replace(/\/+$/, "")}/api`;

export const SOCKET_URL = configuredApiUrl.replace(/\/+$/, "");