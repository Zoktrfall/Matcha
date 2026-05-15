import "./AuthLayout.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiMe } from "../../lib/profileApis.js";

import romanImg from "../../assets/Roman.jpg";
import proudImg from "../../assets/Proud.jpg";
import daringImg from "../../assets/Daring.jpg";

const HERO_INDEX_KEY = "authHeroIndex";
const AUTO_ROTATE_DIR = 1;

export default function AuthLayout({
   title = "Dream",
   subtitle,
   children,
   heroTitle = "Coding/Connecting",
   images = [romanImg, proudImg, daringImg],
   defaultHeroIndex = 0,
   autoRotate = true,
   rotateMs = 5000,
   guestOnly = false,
}) {
    const nav = useNavigate();
    const [index, setIndex] = useState(() => {
        return getStoredIndex(defaultHeroIndex, images.length);
    });
    const currentIndex = clamp(index, 0, images.length - 1);

    function showIndex(i) {
        const clamped = clamp(i, 0, images.length - 1);
        setIndex(clamped);
    }

    useEffect(() => {
        if (typeof window !== "undefined")
            window.sessionStorage.setItem(HERO_INDEX_KEY, String(currentIndex));
    }, [currentIndex]);

    useEffect(() => {
        if(!autoRotate || images.length <= 1)
            return;

        const id = setInterval(() => {
            setIndex((current) => (current + AUTO_ROTATE_DIR + images.length) % images.length);
        }, rotateMs);

        return () => clearInterval(id);
    }, [autoRotate, rotateMs, images.length]);

    useEffect(() => {
        if (!guestOnly)
            return;

        let cancelled = false;

        async function checkAuth() {
            try {
                await apiMe();
                if (!cancelled)
                    nav("/app", { replace: true });
            } catch {
                // Stay on the auth screens when the session is missing or the API is unavailable.
            }
        }

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, [guestOnly, nav]);

    return (
        <div className="authPage">
            <div className="authShell">
                <section className="authHero" aria-label="Welcome panel">
                    <div
                        className="heroSlider ready"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {images.map((img, i) => (
                            <div className="heroSlide" key={i}>
                                <img className="heroImg" src={img} alt="" draggable="false" />
                            </div>
                        ))}
                    </div>

                    <div className="heroOverlay" />

                    <div className="authHeroTop">
                        <div className="authLogo">DREAM/CODER</div>
                        <Link className="authBackLink" to="/">
                            Back to website <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <div className="authHeroBottom">
                        <h2 className="authHeroTitle">{heroTitle}</h2>

                        <div className="authDots" aria-label="Carousel indicators">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`dot ${i === currentIndex ? "active" : ""}`}
                                    onClick={() => showIndex(i)}
                                    aria-label={`Show image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="authPanel" aria-label="Authentication form">
                    <div className="authPanelInner">
                        <h1 className="authTitle">{title}</h1>
                        {subtitle ? <p className="authSubtitle">{subtitle}</p> : null}
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function getStoredIndex(defaultHeroIndex, imageCount) {
    const fallback = clamp(defaultHeroIndex, 0, imageCount - 1);

    if (typeof window === "undefined")
        return fallback;

    const saved = window.sessionStorage.getItem(HERO_INDEX_KEY);
    const source = saved !== null ? Number(saved) : fallback;
    return clamp(Number.isFinite(source) ? source : fallback, 0, imageCount - 1);
}
