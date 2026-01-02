const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: options.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        credentials: "include",
        body: options.body,
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
}

export async function apiRegister(form) {
    return request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            username: form.username,
            email: form.email,
            password: form.password,
        }),
    });
}

export async function apiVerifyEmail(token) {
    return request("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
    });
}

export async function apiResendVerification(email) {
    return request("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export async function apiForgotPassword(email) {
    return request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export async function apiResetPassword(token, newPassword) {
    return request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
    });
}

export async function apiLogin(payload) {
    return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}