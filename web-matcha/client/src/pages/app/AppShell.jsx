import "./AppShell.css";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { apiMe } from "../../lib/profileApis.js";
import { apiLogout } from "../../lib/authApis.js";
import CompleteProfileModal from "./CompleteProfileModal.jsx";

const navItems = [
    { to: "/app", label: "Home", icon: HomeIcon },
    { to: "/app/discover", label: "Discover", icon: DiscoverIcon },
    { to: "/app/friends", label: "Friends", icon: FriendsIcon },
    { to: "/app/messages", label: "Messages", icon: MessagesIcon },
    { to: "/app/profile", label: "Profile", icon: ProfileIcon },
];

export default function AppShell() {
    const nav = useNavigate();
    const location = useLocation();
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function refreshMe() {
        const data = await apiMe();
        setMe(data);
        return data;
    }

    async function refreshAll() {
        const data = await refreshMe();
        setShowOnboarding(!data.isProfileComplete);
        return data;
    }

    useEffect(() => {
        let cancelled = false;

        async function loadSession() {
            try {
                setLoading(true);
                const data = await apiMe();
                if (cancelled)
                    return;

                setMe(data);
                setShowOnboarding(!data.isProfileComplete);
            } catch {
                if (!cancelled)
                    nav("/login", { replace: true });
            } finally {
                if (!cancelled)
                    setLoading(false);
            }
        }

        loadSession();

        return () => {
            cancelled = true;
        };
    }, [nav]);

    async function handleLogout() {
        try {
            setLoggingOut(true);
            await apiLogout();
        } finally {
            nav("/login", { replace: true });
            setLoggingOut(false);
        }
    }

    if (loading) {
        return (
            <div className="appShellPage">
                <div className="appShellLoading">Loading your space...</div>
            </div>
        );
    }

    const profile = me?.profile ?? {};

    return (
        <div className="appShellPage">
            <div className="appShellGlow appShellGlowA" />
            <div className="appShellGlow appShellGlowB" />

            <div className="appShellFrame">
                <aside className="appSidebar">
                    <div className="appSidebarTop">
                        <div className="appBrandBlock">
                            <div className="appBrand">DREAM/CODER</div>
                            <div className="appBrandText">@{profile.username ?? "dream"}</div>
                        </div>

                        <nav className="appSidebarNav" aria-label="Primary">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === "/app"}
                                        className={({ isActive }) =>
                                            `appNavLink ${isActive ? "active" : ""}`
                                        }
                                    >
                                        <Icon />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <button
                        type="button"
                        className="appLogoutButton"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        <LogoutIcon />
                        <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                </aside>

                <div className="appMainArea">
                    <Outlet context={{ me, refreshMe }} />
                </div>
            </div>

            <nav className="appBottomNav" aria-label="Mobile primary">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.to === "/app"
                        ? location.pathname === "/app"
                        : location.pathname.startsWith(item.to);

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/app"}
                            className={`appBottomNavLink ${isActive ? "active" : ""}`}
                            aria-label={item.label}
                        >
                            <Icon />
                        </NavLink>
                    );
                })}

                <button
                    type="button"
                    className="appBottomNavLink logout"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    aria-label="Logout"
                >
                    <LogoutIcon />
                </button>
            </nav>

            {showOnboarding ? (
                <CompleteProfileModal
                    me={me}
                    onRefresh={refreshMe}
                    onFinish={async () => {
                        const updated = await refreshAll();
                        if (updated.isProfileComplete) {
                            setShowOnboarding(false);
                            nav("/app", { replace: true });
                        }
                    }}
                />
            ) : null}
        </div>
    );
}

function IconBase({ children }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="appNavIcon">
            {children}
        </svg>
    );
}

function HomeIcon() {
    return (
        <IconBase>
            <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
        </IconBase>
    );
}

function DiscoverIcon() {
    return (
        <IconBase>
            <path d="m12 4 2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2z" />
        </IconBase>
    );
}

function FriendsIcon() {
    return (
        <IconBase>
            <path d="M9 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 1a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12Zm-6 1c-3 0-5 1.6-5 3.5V19h10v-2.5C14 14.6 12 13 9 13Zm6 .5c-1 0-1.9.2-2.6.6.8.7 1.3 1.5 1.5 2.4H20v-.9C20 14.6 18.1 13.5 15 13.5Z" />
        </IconBase>
    );
}

function MessagesIcon() {
    return (
        <IconBase>
            <path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
        </IconBase>
    );
}

function ProfileIcon() {
    return (
        <IconBase>
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.1 0-7 2.1-7 5v1h14v-1c0-2.9-2.9-5-7-5Z" />
        </IconBase>
    );
}

function LogoutIcon() {
    return (
        <IconBase>
            <path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" />
            <path d="M14 8l5 4-5 4" />
            <path d="M9 12h10" />
        </IconBase>
    );
}
