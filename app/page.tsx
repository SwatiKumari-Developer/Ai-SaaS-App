"use client";

import {
  ArrowUpRight,
  Bot,
  Check,
  Clock3,
  Code2,
  CreditCard,
  LayoutDashboard,
  Loader2,
  Lock,
  MessageSquareText,
  Sparkles,
  Wand2,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Mode = "content" | "code" | "answer";
type Plan = "Free" | "Pro" | "Business";

type HistoryItem = {
  id: string;
  prompt: string;
  output: string;
  mode: Mode;
  model: string;
  createdAt: string;
};

const models = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"];

const modeConfig = {
  content: {
    label: "Content",
    icon: MessageSquareText,
    placeholder: "Write a launch email for an AI resume builder targeting students."
  },
  code: {
    label: "Code",
    icon: Code2,
    placeholder: "Create a TypeScript function that rate limits users by credits."
  },
  answer: {
    label: "Answer",
    icon: Bot,
    placeholder: "Explain how a SaaS subscription system should handle failed payments."
  }
};

const planCredits: Record<Plan, number> = {
  Free: 10,
  Pro: 250,
  Business: 1200
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [plan, setPlan] = useState<Plan>("Free");
  const [credits, setCredits] = useState(planCredits.Free);
  const [mode, setMode] = useState<Mode>("content");
  const [model, setModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("promptpilot-state");
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      setEmail(state.email || "");
      setSignedIn(Boolean(state.signedIn));
      setPlan(state.plan || "Free");
      setCredits(Number.isFinite(state.credits) ? state.credits : planCredits.Free);
      setHistory(Array.isArray(state.history) ? state.history : []);
    } catch {
      localStorage.removeItem("promptpilot-state");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "promptpilot-state",
      JSON.stringify({ email, signedIn, plan, credits, history })
    );
  }, [email, signedIn, plan, credits, history]);

  const usagePercent = useMemo(() => {
    const total = planCredits[plan];
    return Math.max(0, Math.min(100, ((total - credits) / total) * 100));
  }, [credits, plan]);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setNotice("Enter a valid email to create your workspace.");
      return;
    }

    setSignedIn(true);
    setNotice("Workspace created. Free credits added.");
  }

  async function generate() {
    if (!signedIn) {
      setNotice("Sign in first to use credits.");
      setOutput("Sign in with your email first, then click Generate again.");
      return;
    }

    if (credits <= 0) {
      setNotice("You are out of credits. Upgrade to keep generating.");
      setOutput("You are out of credits. Choose Pro or Business to continue generating.");
      return;
    }

    if (prompt.trim().length < 3) {
      setNotice("Add a prompt with at least 3 characters.");
      setOutput("Add a prompt with at least 3 characters.");
      return;
    }

    setIsGenerating(true);
    setNotice("");
    setOutput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode, model })
      });

      if (!response.ok || !response.body) {
        throw new Error("Generation failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullOutput += chunk;
        setOutput(fullOutput);
      }

      setCredits((current) => Math.max(0, current - 1));
      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          prompt,
          output: fullOutput,
          mode,
          model,
          createdAt: new Date().toLocaleString()
        },
        ...items.slice(0, 7)
      ]);
    } catch {
      const message = "Something went wrong while generating. Check your OpenAI API key in Vercel and redeploy.";
      setNotice(message);
      setOutput(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function upgrade(nextPlan: Exclude<Plan, "Free">) {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nextPlan.toLowerCase() })
    });
    const data = await response.json();

    if (data.url && data.url.startsWith("http")) {
      window.location.href = data.url;
      return;
    }

    setPlan(nextPlan);
    setCredits(planCredits[nextPlan]);
    setNotice(`${nextPlan} activated in demo mode. Add Stripe keys for live payments.`);
  }

  const ActiveModeIcon = modeConfig[mode].icon;

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={19} />
          </span>
          <span>PromptPilot AI</span>
        </div>
        <div className="nav-actions">
          <span className="status-pill">
            <Lock size={14} />
            JWT-ready auth
          </span>
          <span className="status-pill">
            <Zap size={14} />
            {credits} credits
          </span>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI SaaS starter</p>
          <h1>Generate content, code, and answers from one paid AI workspace.</h1>
          <p>
            A deployable mini ChatGPT-style product with sign up, credits, rate-limit style
            usage, model switching, prompt history, subscription plans, and streaming output.
          </p>
        </div>
        <form className="auth-panel" onSubmit={signIn}>
          <div>
            <p className="panel-kicker">Workspace login</p>
            <h2>{signedIn ? "Signed in" : "Create your account"}</h2>
          </div>
          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="founder@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">
            <Check size={17} />
            {signedIn ? "Refresh session" : "Sign up free"}
          </button>
        </form>
      </section>

      {notice ? <div className="notice">{notice}</div> : null}

      <section className="dashboard-grid">
        <aside className="sidebar">
          <div className="metric">
            <div>
              <p>Current plan</p>
              <strong>{plan}</strong>
            </div>
            <LayoutDashboard size={22} />
          </div>
          <div className="usage">
            <div className="usage-header">
              <span>Usage</span>
              <span>{planCredits[plan] - credits}/{planCredits[plan]}</span>
            </div>
            <div className="usage-track">
              <span style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
          <div className="plan-list">
            <PlanCard name="Free" price="$0" credits="10 credits" active={plan === "Free"} />
            <PlanCard
              name="Pro"
              price="$19"
              credits="250 credits"
              active={plan === "Pro"}
              onClick={() => upgrade("Pro")}
            />
            <PlanCard
              name="Business"
              price="$79"
              credits="1,200 credits"
              active={plan === "Business"}
              onClick={() => upgrade("Business")}
            />
          </div>
        </aside>

        <section className="generator">
          <div className="toolbar">
            <div className="segmented">
              {(Object.keys(modeConfig) as Mode[]).map((item) => {
                const Icon = modeConfig[item].icon;
                return (
                  <button
                    key={item}
                    className={mode === item ? "active" : ""}
                    type="button"
                    onClick={() => setMode(item)}
                    title={`${modeConfig[item].label} mode`}
                  >
                    <Icon size={17} />
                    {modeConfig[item].label}
                  </button>
                );
              })}
            </div>
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              {models.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <label className="prompt-box">
            <span>
              <ActiveModeIcon size={17} />
              Prompt
            </span>
            <textarea
              value={prompt}
              placeholder={modeConfig[mode].placeholder}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>

          <div className="generator-actions">
            <button
              className="primary-button"
              type="button"
              onClick={generate}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="spin" size={17} /> : <Wand2 size={17} />}
              Generate
            </button>
            <span>{signedIn ? `${credits} credits remaining` : "Sign in to generate"}</span>
          </div>

          {notice ? <div className="generator-notice">{notice}</div> : null}

          <div className="output-panel">
            <div className="output-header">
              <span>Streaming response</span>
              <ArrowUpRight size={17} />
            </div>
            <pre>{output || "Your AI result will appear here."}</pre>
          </div>
        </section>

        <aside className="history">
          <div className="history-title">
            <Clock3 size={18} />
            Prompt history
          </div>
          {history.length === 0 ? (
            <p className="empty">Generated prompts are saved locally for your dashboard.</p>
          ) : (
            history.map((item) => (
              <article key={item.id} className="history-item">
                <div>
                  <strong>{modeConfig[item.mode].label}</strong>
                  <span>{item.createdAt}</span>
                </div>
                <p>{item.prompt}</p>
              </article>
            ))
          )}
        </aside>
      </section>
    </main>
  );
}

function PlanCard({
  name,
  price,
  credits,
  active,
  onClick
}: {
  name: Plan;
  price: string;
  credits: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`plan-card ${active ? "active" : ""}`} type="button" onClick={onClick}>
      <span>
        <strong>{name}</strong>
        <small>{credits}</small>
      </span>
      <span className="price">
        {price}
        <small>/mo</small>
      </span>
      {onClick ? <CreditCard size={17} /> : <Check size={17} />}
    </button>
  );
}
