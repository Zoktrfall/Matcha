// Placeholder API calls.
// Later we replace these with real fetch() calls to the ASP.NET backend.

export async function apiRegister(payload) {
    await sleep(400);
    return { ok: true };
}

export async function apiLogin(payload) {
    await sleep(400);
    return { ok: true };
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
