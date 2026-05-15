import "./AppHome.css";

export default function AppSectionPage({ title, subtitle, cards }) {
    return (
        <div className="appPageContent">
            <main className="appFeed solo">
                <header className="appFeedHero">
                    <div>
                        <div className="appEyebrow">Section</div>
                        <h1 className="appFeedTitle">{title}</h1>
                        <p className="appFeedSubtitle">{subtitle}</p>
                    </div>
                </header>

                <section className="appFeedList" aria-label={`${title} prototype`}>
                    {cards.map((card) => (
                        <article key={card.title} className={`appFeedCard ${card.tone ?? "feature"}`}>
                            <div className="appFeedCardTop">
                                <div>
                                    <div className="appCardEyebrow">{card.eyebrow}</div>
                                    <h2 className="appCardTitle">{card.title}</h2>
                                </div>
                            </div>
                            <p className="appCardBody">{card.body}</p>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}
