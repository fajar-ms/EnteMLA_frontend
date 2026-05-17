import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Complaint.css"; // Ensure this includes the modal styles from Trending.css
import Navbar from "../components/home/Navbar";
import { useTranslation } from "react-i18next";

const ComplaintsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null); // For the Left/Right Dashboard view
  const [selectedForModal, setSelectedForModal] = useState(null); // For the Discussion Modal
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Complaints (Using your backend endpoint)
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // Change this URL to your specific 'my complaints' endpoint if necessary
        const response = await axios.get("http://localhost:3001/complaints");
        setComplaints(response.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // --- SOCIAL HANDLERS ---

  const handleLike = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/complaints/${id}/like`);
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/complaints/${id}/repost`);
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, reposts: (item.reposts || 0) + 1 } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async () => {
    if (!user || !user._id) return navigate("/login");
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`http://localhost:3001/complaints/${selectedForModal._id}/comment`, {
        text: commentText.trim(),
        userId: user._id
      });

      const updated = complaints.map((item) =>
        item._id === selectedForModal._id
          ? { ...item, replies: [...(item.replies || []), res.data] }
          : item
      );

      setComplaints(updated);
      setSelectedForModal(updated.find(c => c._id === selectedForModal._id));
      setCommentText("");
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    progress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  // Helper utility function to resolve correct background status class
  const getStatusClass = (status) => {
    const cleanStatus = (status || "").toLowerCase().trim();
    if (cleanStatus === "pending") return "warn";
    if (cleanStatus === "in progress" || cleanStatus === "inprogress") return "process";
    if (cleanStatus === "resolved") return "done";
    return "";
  };

  if (loading) return <div className="loading-container"><h2>{t("loading")}</h2></div>;

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="control-dashboard">
        <div className="header">
          <h1> {t("complaintControlDashboard")}</h1>
          <div className="stats">
            <div>📌 {t("total")} <b>{stats.total}</b></div>
            <div className="warn">⏳ {t("pending")} <b>{stats.pending}</b></div>
            <div className="process">🔄 {t("inProgress")} <b>{stats.progress}</b></div>
            <div className="done">✅ {t("resolved")} <b>{stats.resolved}</b></div>
          </div>
        </div>

        <div className="body">
          {/* LEFT QUEUE */}
          <div className="queue">
            <h3>📂 {t("complaintQueue")}</h3>
            
            {/* Scrollable container introduced here */}
            <div className="queue-scroll-container">
              {complaints.map(c => (
                <div 
                  key={c._id} 
                  className={`item ${selected?._id === c._id ? "active" : ""}`} 
                  onClick={() => setSelected(c)}
                >
                  <div>
                    {/* Status and Urgency Badge Alignment Row */}
                    <div className="badge-row">
                      <span className={`tag-status ${getStatusClass(c.status)}`}>
                        {t((c.status || "").toLowerCase().replace(" ", ""))}
                      </span>
                      <span className={`tag-urgency ${(c.priority || "Normal").toLowerCase()}`}>
                        {t((c.priority || "Normal").toLowerCase())}
                      </span>
                    </div>

                    <strong>{c.title}</strong>
                    
                    {/* Quick Social Stats in Queue */}
                    <div className="mini-social">
                      <span>👍 {c.likes || 0}</span> <span>💬 {c.replies?.length || 0}</span>
                    </div>
                  </div>
                  {/* The dot element container has been completely removed from this card block */}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CASE FILE */}
          <div className="file">
            {!selected ? (
              <div className="empty">{t("selectComplaint")}</div>
            ) : (
              <div className="case-file">
                <h2>📁 {t("caseFile")}</h2>

                <div className="section social-actions-row">
                  <button onClick={() => handleLike(selected._id)}>👍 {selected.likes || 0}</button>
                  <button onClick={() => setSelectedForModal(selected)}>💬 {selected.replies?.length || 0}</button>
                  <button onClick={() => handleRepost(selected._id)}>🔁 {selected.reposts || 0}</button>
                </div>

                <div className="section">
                  <h4>{t("overview")}</h4>
                  <p>{selected.details || selected.description}</p>
                </div>

                <div className="section">
                  <h4>{t("status")}</h4>
                  <p>{selected.status}</p>
                </div>

                {selected.progress && (
                  <div className="section">
                    <h4>{t("progress")}</h4>
                    <div className="bar"><div style={{ width: `${selected.progress}%` }} /></div>
                  </div>
                )}

                <button className="close-case-btn" onClick={() => setSelected(null)}>{t("closeView")}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DISCUSSION MODAL (PORTED FROM TRENDING) --- */}
      {selectedForModal && (
        <div className="modal-overlay" onClick={() => setSelectedForModal(null)}>
          <div className="comment-modal-tile" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("discussion")}</h3>
              <button className="close-btn" onClick={() => setSelectedForModal(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="complaint-summary">
                <strong>{selectedForModal.title}</strong>
                <p>{selectedForModal.details}</p>
              </div>

              <div className="comments-list">
                {selectedForModal.replies?.length > 0 ? (
                  selectedForModal.replies.map((reply, i) => (
                    <div key={i} className="single-comment">
                      <div className="comment-avatar">{reply.username?.charAt(0) || "U"}</div>
                      <div className="comment-body">
                        <p className="comment-user">{reply.username || t("citizen")}</p>
                        <p className="comment-text">{reply.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">{t("noComments")}</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <input
                type="text"
                placeholder={t("writeComment")}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={handleComment}>{t("send")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;