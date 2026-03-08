import { StrictMode, lazy, Suspense, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const AppV1 = lazy(() => import("./App"));
const AppV2 = lazy(() => import("./AppV2"));

function Root() {
  const [version, setVersion] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash === "v1" ? "v1" : "v2";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setVersion(hash === "v1" ? "v1" : "v2");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          Loading...
        </div>
      }
    >
      <nav style={navStyles}>
        <a
          href="#v1"
          style={{
            ...linkStyle,
            ...(version === "v1" ? activeLinkStyle : {}),
          }}
        >
          v1: Basic Proofing
        </a>
        <a
          href="#v2"
          style={{
            ...linkStyle,
            ...(version === "v2" ? activeLinkStyle : {}),
          }}
        >
          v2: Synonyms + Rewrite
        </a>
      </nav>
      {version === "v1" ? <AppV1 /> : <AppV2 />}
    </Suspense>
  );
}

const navStyles: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  padding: "12px 24px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const linkStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#6b7280",
  textDecoration: "none",
  padding: "4px 12px",
  borderRadius: "6px",
  transition: "all 0.15s",
};

const activeLinkStyle: React.CSSProperties = {
  color: "#2563eb",
  backgroundColor: "#eff6ff",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
