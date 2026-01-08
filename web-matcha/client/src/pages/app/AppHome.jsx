import { useEffect, useState } from "react";
import { apiMe } from "../../lib/profileApis.js";
import CompleteProfileModal from "./CompleteProfileModal.jsx";

export default function AppHome() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    async function refresh() {
        const data = await apiMe();
        setMe(data);
        setShowOnboarding(!data.isProfileComplete);
        return data;
    }

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await refresh();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div style={{ padding: 24, color: "white" }}>Loading…</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#0b0b12", color: "white", padding: 24 }}>
            <h1 style={{ margin: 0 }}>MATCHA/CODER</h1>
            <p style={{ opacity: 0.8 }}>Welcome, {me?.profile?.username ?? "coder"}.</p>

            {/* Your real app content */}
            <div style={{ marginTop: 18, opacity: 0.9 }}>
                Feed / Search / Matches will go here…
            </div>

            {/* Blocking modal until profile is complete */}
            {showOnboarding ? (
                <CompleteProfileModal
                    me={me}
                    onDone={async () => {
                        const updated = await refresh();
                        if (updated.isProfileComplete) setShowOnboarding(false);
                    }}
                />
            ) : null}
        </div>
    );
}
