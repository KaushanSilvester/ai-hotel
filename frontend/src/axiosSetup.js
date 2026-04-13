// ─────────────────────────────────────────────────────────────────────────────
// axiosSetup.js  — create this file in src/  and import it in index.js
//
// This catches ANY 401 "token expired / not valid" error across the whole app
// and automatically logs the user out + redirects to /login.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

axios.interceptors.response.use(
  // ✅ Success — pass through unchanged
  (response) => response,

  // ❌ Error — check if token expired
  (error) => {
    const status = error?.response?.status;
    const data   = error?.response?.data;

    const isTokenError =
      status === 401 ||
      (typeof data?.detail === "string" && data.detail.toLowerCase().includes("token")) ||
      (typeof data?.error  === "string" && data.error.toLowerCase().includes("token"));

    if (isTokenError) {
      // Clear stale credentials
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      // Redirect to login with a message
      window.location.href = "/login?expired=1";
    }

    return Promise.reject(error);
  }
);