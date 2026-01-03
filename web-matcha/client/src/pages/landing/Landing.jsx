import "./Landing.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");

    function goRegister(e) {
        e.preventDefault();
        nav("/register");
    }

    return (
        <div className="landingPage">
            <div className="landingShell">
                <header className="landingTop">
                    <div className="landingBrand">
                        <div className="landingLogo">MATCHA/CODER</div>
                    </div>

                    <nav className="landingNav">
                        <Link className="landingNavBtn ghost" to="/login">
                            Log in
                        </Link>
                    </nav>
                </header>

                <main className="landingMain">
                    <div className="landingHero">
                        <div className="planetWrap">
                            <div className="planetGlow"></div>
                            <div className="planetRing planetRingBack"></div>
                            <div className="planet"></div>
                            <div className="planetRing planetRingFront"></div>
                        </div>

                        <h1 className="landingTitle">Your dream coming soon</h1>

                        <p className="landingSubtitle">
                            Get notified when it’s ready — or just create an account now.
                        </p>

                        <form className="notifyRow" onSubmit={goRegister}>
                            <button className="notifyBtn" type="submit">
                                Notify me
                            </button>
                        </form>
                    </div>
                </main>

                <footer className="landingFooter">
                    <span>© {new Date().getFullYear()} Matcha/Coder</span>
                </footer>
            </div>
        </div>
    );
}
