import { API_BASE, request } from "./authApis.js";
import { getCsrfToken } from "./csrf.js";

export async function apiMe() {
    return request("/api/me", { method: "GET" });
}

export async function apiUpdateProfile(payload) {
    return request("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function apiSearchTags(q) {
    return request(`/api/tags?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export async function apiAttachTags(tags) {
    return request("/api/tags/attach", {
        method: "POST",
        body: JSON.stringify({ tags }),
    });
}

export async function apiDetachTag(tag) {
    return request("/api/tags/detach", {
        method: "DELETE",
        body: JSON.stringify({ tag }),
    });
}

export async function apiGetPhotos() {
    return request("/api/photos", { method: "GET" });
}

export async function apiUploadPhoto(file) {
    const token = await getCsrfToken();

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/photos`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-TOKEN": token },
        body: fd,
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

    if (!res.ok) 
        throw new Error(data?.message || `Upload failed (${res.status})`);
    return data;
}

export async function apiSetPrimaryPhoto(photoId) {
    return request(`/api/photos/${photoId}/primary`, { method: "PUT" });
}

export async function apiDeletePhoto(photoId) {
    return request(`/api/photos/${photoId}`, { method: "DELETE" });
}