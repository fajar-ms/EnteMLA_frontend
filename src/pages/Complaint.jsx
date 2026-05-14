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

  if (loading) return <div className="loading-container"><h2>{t("loading")}</h2></div>;

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="control-dashboard">
        <div className="header">
          <h1>📊 {t("complaintControlDashboard")}</h1>
          <div className="stats">
            <div>📌 Total <b>{stats.total}</b></div>
            <div className="warn">⏳ Pending <b>{stats.pending}</b></div>
            <div className="process">🔄 In Progress <b>{stats.progress}</b></div>
            <div className="done">✅ Resolved <b>{stats.resolved}</b></div>
          </div>
        </div>

        <div className="body">
          {/* LEFT QUEUE */}
          <div className="queue">
            <h3>📂 {t("complaintQueue")}</h3>
            {complaints.map(c => (
              <div key={c._id} className={`item ${selected?._id === c._id ? "active" : ""}`} onClick={() => setSelected(c)}>
                <div>
                  <strong>{c.title}</strong>
                  <span>{c.status} • {c.priority || "Normal"}</span>
                  {/* Quick Social Stats in Queue */}
                  <div className="mini-social">
                    <span>👍 {c.likes || 0}</span> <span>💬 {c.replies?.length || 0}</span>
                  </div>
                </div>
                <div className={`dot ${c.status.toLowerCase().replace(" ", "-")}`} />
              </div>
            ))}
          </div>

          {/* RIGHT CASE FILE */}
          <div className="file">
            {!selected ? (
              <div className="empty">Select a complaint to open case file</div>
            ) : (
              <div className="case-file">
                <h2>📁 {t("caseFile")}</h2>
                
                <div className="section social-actions-row">
                  <button onClick={() => handleLike(selected._id)}>👍 {selected.likes || 0}</button>
                  <button onClick={() => setSelectedForModal(selected)}>💬 {selected.replies?.length || 0} Discussion</button>
                  <button onClick={() => handleRepost(selected._id)}>🔁 {selected.reposts || 0}</button>
                </div>

                <div className="section">
                  <h4>Overview</h4>
                  <p>{selected.details || selected.description}</p>
                </div>

                <div className="section">
                  <h4>Status</h4>
                  <p>{selected.status}</p>
                </div>

                {selected.progress && (
                  <div className="section">
                    <h4>Progress</h4>
                    <div className="bar"><div style={{ width: `${selected.progress}%` }} /></div>
                  </div>
                )}

                <button className="close-case-btn" onClick={() => setSelected(null)}>Close View</button>
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
                placeholder={t("Write comment......")}
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