
import React, { useState, useRef, useEffect } from "react";
import "./QA.css";
import Navbar from "../components/home/Navbar";
import { useTranslation } from "react-i18next";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const QA = () => {
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("userLanguage") || "English"
  );

  const resultsRef = useRef(null);

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

  const translatedFaqs = [
    {
      id: 1,
      question: t("faq_q1"),
      answer: t("faq_a1"),
    },
    {
      id: 2,
      question: t("faq_q2"),
      answer: t("faq_a2"),
    },
    {
      id: 3,
      question: t("faq_q3"),
      answer: t("faq_a3"),
    },
  ];

  const ask = async (customQuestion = null) => {
    const question = (customQuestion || input).trim();

    if (!question || loading) return;

    const selectedLanguage = currentLang;

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          lang: selectedLanguage,
        }),
      });

      const data = await res.json();

      setAnswers((prev) => [
        {
          id: Date.now(),
          question,
          answer: data.answer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="qa-page">
      <Navbar />

      {/* HERO */}
      <div className="qa-hero">
        <h1>{t("community_qa")}</h1>
        <p>{t("qa_subtitle")}</p>
      </div>

      {/* INPUT */}
      <div className="qa-input-box">
        <div className="ask-box">
          <input
            type="text"
            placeholder={t("type_question")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
          />

          <button onClick={() => ask()} disabled={loading}>
            {loading ? "..." : t("ask")}
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="qa-typing">
          <span className="qa-typing__dot" />
          <span className="qa-typing__dot" />
          <span className="qa-typing__dot" />

          <span className="qa-typing__label">
            {t("ai_thinking")}
          </span>
        </div>
      )}

      {/* ANSWERS */}
      <div className="qa-results" ref={resultsRef}>
        {answers.map((a, i) => (
          <div
            key={a.id}
            className="qa-answer-card"
            style={{
              opacity: 1,
              transform: "translateY(0)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <div className="qa-answer-card__accent" />

            <div className="qa-answer-card__body">
              <div className="qa-answer-card__question">
                <span className="qa-answer-card__q-chip">Q</span>
                <p>{a.question}</p>
              </div>

              <div className="qa-answer-card__answer">
                <span className="qa-answer-card__a-chip">A</span>

                <p className="qa-answer-card__answer-text">
                  {a.answer}
                </p>
              </div>

              <p className="qa-answer-card__time">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="qa-faq-section">
        <div className="faq-header">
          <p className="faq-subtitle">{t("faq")}</p>

          <h2>{t("frequently_asked_questions")}</h2>

          <div className="header-line" />
        </div>

        <div className="faq-accordion">
          {translatedFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`faq-accordion-item ${
                openFaqId === faq.id
                  ? "faq-accordion-item--open"
                  : ""
              }`}
            >
              <button
                className="faq-accordion-trigger"
                onClick={() =>
                  setOpenFaqId(
                    openFaqId === faq.id ? null : faq.id
                  )
                }
                aria-expanded={openFaqId === faq.id}
              >
                <span className="faq-accordion-question">
                  {faq.question}
                </span>

                <span
                  className="faq-accordion-chevron"
                  aria-hidden="true"
                >
                  {openFaqId === faq.id ? "−" : "+"}
                </span>
              </button>

              {openFaqId === faq.id && (
                <div className="faq-accordion-body">
                  <p className="faq-accordion-answer">
                    {faq.answer}
                  </p>

                  <button
                    className="faq-accordion-ask-btn"
                    onClick={() => ask(faq.question)}
                  >
                    {t("ask_ai")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QA;