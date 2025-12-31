import { useEffect, useState } from "react";

export default function App() {
    const [status, setStatus] = useState("loading...");

    useEffect(() => {
        fetch("/api/health")
            .then((r) => r.json())
            .then((data) => setStatus(data.status))
            .catch(() => setStatus("error"));
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h1>Matcha</h1>
            <p>API health: {status}</p>
        </div>
    );
}