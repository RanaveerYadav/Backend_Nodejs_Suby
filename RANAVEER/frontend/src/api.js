export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://ranaveer-backend-new.onrender.com"
).replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem("subyToken") || "";
}

export function getRole() {
  return localStorage.getItem("subyRole") || "";
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("subyUser") || "{}");
  } catch {
    return {};
  }
}

export function saveVendorSession(token) {
  localStorage.setItem("subyToken", token);
  localStorage.setItem("vendorToken", token);
  localStorage.setItem("subyRole", "vendor");

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    localStorage.setItem("subyVendorId", payload.vendorId || "");
  } catch {}
}

export function saveCustomerSession(data, token) {
  localStorage.setItem("subyRole", "customer");
  localStorage.setItem("subyUser", JSON.stringify(data || {}));

  if (token) {
    localStorage.setItem("subyToken", token);
  }
}

export function logout() {
  [
    "subyToken",
    "vendorToken",
    "subyRole",
    "subyUser",
    "subyVendorId",
    "subyFirmId",
    "subyCart"
  ].forEach((key) => localStorage.removeItem(key));
}

export async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE}${cleanPath}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data.error || data.message || "Request failed"
        : data || "Request failed";

    throw new Error(message);
  }

  return data;
}

export function imageUrl(filename) {
  if (!filename) return "";

  if (String(filename).startsWith("http")) {
    return filename;
  }

  return `${API_BASE}/uploads/${encodeURIComponent(
    String(filename).split("/").pop()
  )}`;
}