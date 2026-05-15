import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import Landing from "./pages/landing/Landing.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AppHome from "./pages/app/AppHome.jsx";
import AppShell from "./pages/app/AppShell.jsx";
import AppSectionPage from "./pages/app/AppSectionPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/app" element={<AppShell />}>
                <Route index element={<AppHome />} />
                <Route
                    path="discover"
                    element={
                        <AppSectionPage
                            title="Discover"
                            subtitle="This page will hold recommendations, search, and profile discovery. The shared navigation on the left stays visible on desktop and moves to the bottom on mobile."
                            cards={[
                                {
                                    eyebrow: "Prototype",
                                    title: "Discovery feed will start here",
                                    body: "We can place smart recommendations, search filters, and cards for nearby users in this section.",
                                    tone: "feature",
                                },
                                {
                                    eyebrow: "Next step",
                                    title: "Filter and explore",
                                    body: "Age, tags, distance, and popularity filters can fit into this page without changing the app shell.",
                                    tone: "update",
                                },
                            ]}
                        />
                    }
                />
                <Route
                    path="friends"
                    element={
                        <AppSectionPage
                            title="Friends"
                            subtitle="This area is reserved for connections, accepted matches, and people you interact with most often."
                            cards={[
                                {
                                    eyebrow: "Prototype",
                                    title: "Your connections will be listed here",
                                    body: "Friend cards, relationship state, mutual interests, and last activity can all be added to this layout.",
                                    tone: "feature",
                                },
                            ]}
                        />
                    }
                />
                <Route
                    path="messages"
                    element={
                        <AppSectionPage
                            title="Messages"
                            subtitle="This page will become the messaging hub with conversation list, unread state, and active chat panels."
                            cards={[
                                {
                                    eyebrow: "Prototype",
                                    title: "Conversation UI comes next",
                                    body: "The shell is ready for a message list on the left and an active thread panel in the main content area.",
                                    tone: "news",
                                },
                            ]}
                        />
                    }
                />
                <Route
                    path="profile"
                    element={
                        <AppSectionPage
                            title="Profile"
                            subtitle="Your public profile, edits, photos, and interests will live here as a dedicated page."
                            cards={[
                                {
                                    eyebrow: "Prototype",
                                    title: "Manage your profile here",
                                    body: "We can move profile editing, gallery ordering, and visibility controls into this route.",
                                    tone: "update",
                                },
                            ]}
                        />
                    }
                />
            </Route>
            <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
    );
}
