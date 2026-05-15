import "./AppHome.css";
import { useOutletContext } from "react-router-dom";

const feedCards = [
    {
        id: 1,
        tone: "feature",
        eyebrow: "Prototype",
        title: "Your main timeline starts here",
        body:
            "This center column is ready for friend posts, news, and discovery cards. For now it acts as a styled scaffold so we can add real content gradually.",
        meta: "Feed hub",
    },
    {
        id: 2,
        tone: "update",
        eyebrow: "Friends",
        title: "Recent activity will appear in this stream",
        body:
            "This layout is prepared for avatars, actions, timestamps, and media when we wire real posts from friends and other users.",
        meta: "Social posts",
    },
    {
        id: 3,
        tone: "news",
        eyebrow: "News",
        title: "Platform updates and announcements fit here too",
        body:
            "We can mix curated news blocks, trending tags, and product announcements into the same feed without rebuilding the page structure.",
        meta: "Announcements",
    },
];

const quickStats = [
    { value: "24", label: "Nearby matches" },
    { value: "08", label: "Unread messages" },
    { value: "12", label: "Profile visitors" },
];

const rightRailItems = [
    { title: "Trending tags", body: "#travel  #music  #startup  #coffee" },
    { title: "Coming next", body: "Real posts, reactions, friend suggestions, and notifications." },
    { title: "Design note", body: "The left navigation is now a shared shell and will stay visible across all app pages." },
];

export default function AppHome() {
    const { me } = useOutletContext();
    const profile = me?.profile ?? {};

    return (
        <div className="appPageContent appHomeLayout">
            <main className="appFeed">
                <header className="appFeedHero">
                    <div>
                        <div className="appEyebrow">Home</div>
                        <h1 className="appFeedTitle">Welcome back, {profile.firstName ?? profile.username ?? "coder"}.</h1>
                        <p className="appFeedSubtitle">
                            This is the main page of the app. The center column is prepared for posts, news, and
                            activity from friends and other users.
                        </p>
                    </div>

                    <div className="appStatGrid">
                        {quickStats.map((stat) => (
                            <div key={stat.label} className="appStatCard">
                                <div className="appStatValue">{stat.value}</div>
                                <div className="appStatLabel">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </header>

                <section className="appComposerCard">
                    <div className="appComposerLabel">Create box placeholder</div>
                    <div className="appComposerInput">
                        Share updates, repost news, or write to your friends. Posting actions will be connected in the
                        next step.
                    </div>
                    <div className="appComposerActions">
                        <button type="button" className="appGhostBtn">Add media</button>
                        <button type="button" className="appPrimaryBtn">Create post</button>
                    </div>
                </section>

                <section className="appFeedList" aria-label="Prototype feed">
                    {feedCards.map((card) => (
                        <article key={card.id} className={`appFeedCard ${card.tone}`}>
                            <div className="appFeedCardTop">
                                <div>
                                    <div className="appCardEyebrow">{card.eyebrow}</div>
                                    <h2 className="appCardTitle">{card.title}</h2>
                                </div>
                                <span className="appCardMeta">{card.meta}</span>
                            </div>
                            <p className="appCardBody">{card.body}</p>
                        </article>
                    ))}
                </section>
            </main>

            <aside className="appRightRail">
                <div className="appRightRailCard accent">
                    <div className="appRightRailTitle">What changed</div>
                    <p className="appRightRailBody">
                        The profile status card was removed and navigation is now persistent across app pages.
                    </p>
                </div>

                {rightRailItems.map((item) => (
                    <div key={item.title} className="appRightRailCard">
                        <div className="appRightRailTitle">{item.title}</div>
                        <p className="appRightRailBody">{item.body}</p>
                    </div>
                ))}
            </aside>
        </div>
    );
}
