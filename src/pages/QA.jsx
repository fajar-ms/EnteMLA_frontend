import React, { useState, useRef, useEffect } from "react";
import "./QA.css";
import Navbar from "../components/home/Navbar";

const API_BASE_URL = "http://localhost:3001";

const TRANSLATED_FAQS = {
  English: [
    {
      id: 1,
      question: "How can I submit a complaint?",
      answer: "You can submit a complaint through the 'Complaint Portal' by providing details and selecting the category.",
    },
    {
      id: 2,
      question: "How long does it take to resolve a complaint?",
      answer: "Most complaints are addressed within 48 hours depending on severity and department workload.",
    },
    {
      id: 3,
      question: "Can I track my complaint status?",
      answer: "Yes, you can track your complaint using the unique tracking ID provided after submission.",
    },
  ],
  Malayalam: [
    {
      id: 1,
      question: "എനിക്ക് എങ്ങനെ ഒരു പരാതി സമർപ്പിക്കാം?",
      answer: "വിശദാംശങ്ങൾ നൽകി കാറ്റഗറി തിരഞ്ഞെടുക്കുന്നതിലൂടെ 'പരാതി പോർട്ടൽ' വഴി നിങ്ങൾക്ക് പരാതി സമർപ്പിക്കാം.",
    },
    {
      id: 2,
      question: "ഒരു പരാതി പരിഹരിക്കാൻ എത്ര സമയമെടുക്കും?",
      answer: "പരാതിയുടെ ഗൗരവവും വകുപ്പിന്റെ ജോലിഭാരവും അനുസരിച്ച് മിക്ക പരാതികളും 48 മണിക്കൂറിനുള്ളിൽ പരിഹരിക്കപ്പെടും.",
    },
    {
      id: 3,
      question: "എന്റെ പരാതിയുടെ സ്ഥിതി എനിക്ക് ട്രാക്ക് ചെയ്യാൻ കഴിയുമോ?",
      answer: "അതെ, സമർപ്പണത്തിന് ശേഷം നൽകിയിട്ടുള്ള തനതായ ട്രാക്കിംഗ് ഐഡി ഉപയോഗിച്ച് നിങ്ങളുടെ പരാതി ട്രാക്ക് ചെയ്യാം.",
    },
  ],
};

const TypingDots = () => (
  <div className="qa-typing">
    <span className="qa-typing__dot" />
    <span className="qa-typing__dot" />
    <span className="qa-typing__dot" />
    <span className="qa-typing__label">EnteMLA AI is thinking…</span>
  </div>
);

const AnswerCard = ({ question, answer, time, idx }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), idx * 100);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <div className="qa-answer-card" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
    }}>
      <div className="qa-answer-card__accent" />
      <div className="qa-answer-card__body">
        <div className="qa-answer-card__question">
          <span className="qa-answer-card__q-chip">Q</span>
          <p>{question}</p>
        </div>
        <div className="qa-answer-card__answer">
          <span className="qa-answer-card__a-chip">A</span>
          <p className="qa-answer-card__answer-text">{answer}</p>
        </div>
        <p className="qa-answer-card__time">{time}</p>
      </div>
    </div>
  );
};

/* ── Accordion FAQ Item ── */
const FaqAccordionItem = ({ faq, isOpen, onToggle, onAsk, lang }) => (
  <div className={`faq-accordion-item ${isOpen ? "faq-accordion-item--open" : ""}`}>
    <button
      className="faq-accordion-trigger"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className="faq-accordion-question">{faq.question}</span>
      <span className="faq-accordion-chevron" aria-hidden="true">
        {isOpen ? "−" : "+"}
      </span>
    </button>

    {isOpen && (
      <div className="faq-accordion-body">
        <p className="faq-accordion-answer">{faq.answer}</p>
        <button
          className="faq-accordion-ask-btn"
          onClick={() => onAsk(faq.question)}
        >
          {lang === "Malayalam" ? "AI-യോട് ചോദിക്കുക →" : "Ask AI →"}
        </button>
      </div>
    )}
  </div>
);

const QA = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  // ✅ FIX: currentLang is now state, not a plain variable
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("userLanguage") || "English"
  );

  const resultsRef = useRef(null);

  // ✅ FIX: Listen for language changes from Navbar (same tab + other tabs)
  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem("userLanguage") || "English");
    };
    window.addEventListener("storage", handleLangChange);
    window.addEventListener("languageChanged", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("languageChanged", handleLangChange);
    };
  }, []);

  // Derives from state so re-renders correctly on language change
  const activeFaqs = TRANSLATED_FAQS[currentLang] || TRANSLATED_FAQS.English;

  const ask = async (customQuestion = null) => {
    const question = (customQuestion || input).trim();
    if (!question || loading) return;

    // ✅ FIX: Read fresh from state (which is always up to date)
    const selectedLanguage = currentLang;

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang: selectedLanguage }),
      });
      const data = await res.json();

      setAnswers((prev) => [
        {
          id: Date.now(),
          question,
          answer: data.answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="qa-page">
      <Navbar />

      <div className="qa-hero">
        <h1>{currentLang === "Malayalam" ? "കമ്മ്യൂണിറ്റി ചോദ്യോത്തരങ്ങൾ" : "Community Q&A"}</h1>
        <p>{currentLang === "Malayalam" ? "തദ്ദേശ ഭരണത്തെക്കുറിച്ച് എന്തും ചോദിക്കാം." : "Ask anything about local governance."}</p>
      </div>

      <div className="qa-input-box">
        <div className="ask-box">
          <input
            type="text"
            placeholder={currentLang === "Malayalam" ? "നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യുക..." : "Type your question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
          />
          <button onClick={() => ask()} disabled={loading}>
            {loading ? "..." : currentLang === "Malayalam" ? "ചോദിക്കാം" : "Ask"}
          </button>
        </div>
      </div>

      {loading && <TypingDots />}

      <div className="qa-results" ref={resultsRef}>
        {answers.map((a, i) => (
          <AnswerCard key={a.id} idx={i} {...a} />
        ))}
      </div>

      <div className="qa-faq-section">
        <div className="faq-header">
          <p className="faq-subtitle">
            {currentLang === "Malayalam" ? "പതിവ് ചോദ്യങ്ങൾ" : "FAQ"}
          </p>
          <h2>
            {currentLang === "Malayalam"
              ? "പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ"
              : "Frequently Asked Questions"}
          </h2>
          <div className="header-line" />
        </div>

        <div className="faq-accordion">
          {activeFaqs.map((faq) => (
            <FaqAccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openFaqId === faq.id}
              onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
              onAsk={ask}
              lang={currentLang}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QA;   