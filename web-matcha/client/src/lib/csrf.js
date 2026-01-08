import { API_BASE, request } from "./authApis.js";

let csrfToken = null;
export async function getCsrfToken() {
    if(csrfToken)
        return csrfToken;

    const res = await fetch(`${API_BASE}/api/csrf`, { credentials: "include" });
    const data = await res.json();
    
    csrfToken = data.token;
    return csrfToken;
}
