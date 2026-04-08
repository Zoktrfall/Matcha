import "./AuthLayout.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiMe } from "../../lib/profileApis.js";

import romanImg from "../../assets/Roman.jpg";
import proudImg from "../../assets/Proud.jpg";
import daringImg from "../../assets/Daring.jpg";
import {Link} from "react-router-dom";

const HERO_INDEX_KEY = "authHeroIndex";

export default function AuthLayout({
   title = "Matcha",
   subtitle,
   children,
   heroTitle = "Codding/Connecting",
   images = [romanImg, proudImg, daringImg],
   defaultHeroIndex = 0,
   autoRotate = true,
   rotateMs = 5000,
   guestOnly = false,
}) {
    const nav = useNavigate();
    const sliderRef = useRef(null);
    const [ready, setReady] = useState(false);

    const [index, setIndex] = useState(() => {
        const saved = sessionStorage.getItem(HERO_INDEX_KEY);
        const n = saved !== null ? Number(saved) : defaultHeroIndex;
        
        return clamp(Number.isFinite(n) ? n : defaultHeroIndex, 0, images.length - 1);
    });

    function scrollToIndex(i, behavior = "smooth") {
        const el = sliderRef.current;
        if (!el)
            return;

        const clamped = clamp(i, 0, images.length - 1);
        const slideWidth = el.clientWidth;

        el.scrollTo({ left: clamped * slideWidth, behavior });
        setIndex(clamped);
    }

    function onScroll() {
        const el = sliderRef.current;
        if (!el)
            return;
        
        const newIndex = Math.round(el.scrollLeft / el.clientWidth);
        setIndex(clamp(newIndex, 0, images.length - 1));
    }
    
    useLayoutEffect(() => {
        const el = sliderRef.current;
        if(!el)
            return;

        const clamped = clamp(index, 0, images.length - 1);
        el.scrollLeft = clamped * el.clientWidth;
    }, [images.length]);
    
    useEffect(() => {
        setReady(true);
    }, []);
    
    useEffect(() => {
        sessionStorage.setItem(HERO_INDEX_KEY, String(index));
    }, [index]);
    
    useEffect(() => {
        if(!ready)
            return;
        
        if(!autoRotate || images.length <= 1)
            return;

        const id = setInterval(() => {
            const next = (index + 1) % images.length;
            scrollToIndex(next, "smooth");
        }, rotateMs);

        return () => clearInterval(id);
    }, [ready, autoRotate, rotateMs, images.length, index]);

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
                        className={`heroSlider ${ready ? "ready" : ""}`}
                        ref={sliderRef}
                        onScroll={onScroll}
                    >
                        {images.map((img, i) => (
                            <div className="heroSlide" key={i}>
                                <img className="heroImg" src={img} alt="" draggable="false" />
                            </div>
                        ))}
                    </div>

                    <div className="heroOverlay" />

                    <div className="authHeroTop">
                        <div className="authLogo">MATCHA/CODER</div>
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
                                    className={`dot ${i === index ? "active" : ""}`}
                                    onClick={() => scrollToIndex(i, "smooth")}
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
