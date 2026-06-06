import Link from "next/link";

import { getServerAccessToken, getServerAuthProvider } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function isLoggedIn(): Promise<boolean> {
  try {
    const authProvider = await getServerAuthProvider();
    if (authProvider !== "local") return false;
    const token = await getServerAccessToken();
    return !!token;
  } catch {
    return false;
  }
}

export default async function Home() {
  const loggedIn = await isLoggedIn();

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#040128", color: "#fff", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#c5b8ff", letterSpacing: "-0.5px" }}>Miss Floss</span>
        <div style={{ display: "flex", gap: 12 }}>
          {loggedIn ? (
            <Link href="/workflow" style={{ padding: "8px 24px", borderRadius: 8, background: "#8258F2", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: 14 }}>Log in</Link>
              <Link href="/auth/signup" style={{ padding: "8px 20px", borderRadius: 8, background: "#8258F2", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "100px 40px 80px" }}>
        <div style={{ display: "inline-block", background: "rgba(130,88,242,0.15)", border: "1px solid rgba(130,88,242,0.4)", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "#c5b8ff", marginBottom: 28 }}>
          AI-powered voice agents for your business
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-2px", maxWidth: 800, marginInline: "auto" }}>
          Your phone lines,<br />
          <span style={{ color: "#8258F2" }}>never silent again</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          AI voice agents that handle inbound calls, book appointments, and follow up outbound. 24/7 without a human.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {loggedIn ? (
            <Link href="/workflow" style={{ padding: "14px 32px", borderRadius: 10, background: "#8258F2", color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700 }}>
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signup" style={{ padding: "14px 32px", borderRadius: 10, background: "#8258F2", color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700 }}>
                Start for free
              </Link>
              <Link href="/auth/login" style={{ padding: "14px 32px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: 16 }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 48, letterSpacing: "-1px" }}>Four agents. One platform.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { icon: "📞", title: "Inbound Handler", desc: "Answers every call instantly. Qualifies leads, answers FAQs, routes to a human when needed." },
            { icon: "📅", title: "Booking Agent", desc: "Checks availability and books appointments directly into your calendar. No back-and-forth." },
            { icon: "📤", title: "Outbound Caller", desc: "Dials your lead list, delivers your pitch, and logs every outcome automatically." },
            { icon: "💳", title: "Billing Agent", desc: "Handles payment follow-ups and outstanding invoices over voice, no awkward emails." },
          ].map((f) => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: "-1px" }}>Fixed price. No surprises.</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 48, fontSize: 16 }}>Simple per-minute pricing. Pay only for what you use.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { name: "Starter", price: "$49", detail: "/mo + usage", features: ["1 active agent", "500 min/mo included", "Browser test calls", "Email support"] },
            { name: "Growth", price: "$149", detail: "/mo + usage", features: ["5 active agents", "2,000 min/mo included", "Inbound + outbound", "Priority support"], highlight: true },
            { name: "Scale", price: "$399", detail: "/mo + usage", features: ["Unlimited agents", "10,000 min/mo included", "Custom integrations", "Dedicated support"] },
          ].map((p) => (
            <div key={p.name} style={{ background: p.highlight ? "rgba(130,88,242,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${p.highlight ? "#8258F2" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "32px 24px" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{p.price}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>{p.detail}</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.features.map((f) => <li key={f} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", display: "flex", gap: 8, alignItems: "center" }}><span style={{ color: "#8258F2" }}>+</span>{f}</li>)}
              </ul>
              <Link href={loggedIn ? "/workflow" : "/auth/signup"} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 8, background: p.highlight ? "#8258F2" : "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                {loggedIn ? "Open Dashboard" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: "center", padding: "80px 40px 100px" }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: "-1px" }}>Ready to take your first call?</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, marginBottom: 32 }}>Set up your AI agent in under 10 minutes. No code required.</p>
        <Link href={loggedIn ? "/workflow" : "/auth/signup"} style={{ padding: "16px 40px", borderRadius: 10, background: "#8258F2", color: "#fff", textDecoration: "none", fontSize: 17, fontWeight: 700 }}>
          {loggedIn ? "Open Dashboard" : "Create your free account"}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>2026 Miss Floss</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://missfloss.ai/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy Policy</a>
          <a href="https://missfloss.ai/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
