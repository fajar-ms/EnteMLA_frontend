import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Complaint.css";
import Navbar from "../components/home/Navbar";
import { useTranslation } from "react-i18next";

// React Icons
import { 
  FaListAlt, FaClock, FaSpinner, FaCheckCircle, FaFolderOpen, 
  FaThumbsUp, FaComment, FaShare, FaTimes, FaChartBar, 
  FaCalendar, FaTag 
} from "react-icons/fa";

const ComplaintsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authPopup, setAuthPopup] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedForModal, setSelectedForModal] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        setError("Please login to view complaints");
        return;
      }

      try {
        const response = await api.get("/complaints");
        setComplaints(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load complaints");
      }
    };

    fetchComplaints();
  }, [token]);

  const handleSelect = (complaint) => {
    setSelected(complaint);
  };

  // Improved Like with better error message
  const handleLike = async (id) => {
    try {
      const res = await api.patch(`/complaints/${id}/like`);
      console.log("Like Success:", res.data);

      setComplaints(prev => prev.map(item =>
        item._id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
      ));

      if (selected && selected._id === id) {
        setSelected(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      }
    } catch (error) {
      console.error("Like Error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Failed to like complaint";
      alert(msg);
    }
  };

  // Improved Repost
  const handleRepost = async (id) => {
    try {
      const res = await api.patch(`/complaints/${id}/repost`);
      console.log("Repost Success:", res.data);

      setComplaints(prev => prev.map(item =>
        item._id === id ? { ...item, reposts: (item.reposts || 0) + 1 } : item
      ));

      if (selected && selected._id === id) {
        setSelected(prev => ({ ...prev, reposts: (prev.reposts || 0) + 1 }));
      }
    } catch (error) {
      console.error("Repost Error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Failed to repost complaint";
      alert(msg);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommentError("");

    try {
      const res = await api.post(`/complaints/${selectedForModal._id}/comment`, {
        text: commentText.trim(),
        userId: user?._id,
        username: user?.name || user?.username || "Citizen"
      });

      const updated = complaints.map(item =>
        item._id === selectedForModal._id
          ? { ...item, replies: [...(item.replies || []), res.data] }
          : item
      );

      setComplaints(updated);
      setSelectedForModal(updated.find(c => c._id === selectedForModal._id));
      setCommentText("");
    } catch (error) {
      console.error("Comment Error:", error.response?.data || error.message);
      setCommentError("Failed to post comment. Please try again.");
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
    progress: complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pending")) return "warn";
    if (s.includes("progress")) return "process";
    if (s.includes("resolved")) return "done";
    return "";
  };

  if (error)
  return (
    <div className="loading-container">
      <div className="login-alert-box">
        <h2>Please login to view complaints</h2>

        <button
          className="login-redirect-btn"
          onClick={() => setAuthPopup(true)}
        >
          Login →
        </button>
      </div>

      {/* ROLE POPUP */}
      {authPopup && (
        <div className="auth-popup-overlay">
          <div className="auth-popup">
            <h3>Select Your Role</h3>

            <button
              onClick={() => {
                localStorage.setItem("role", "citizen");
                navigate("/login");
              }}
            >
              Citizen
            </button>

            <button
              onClick={() => {
                localStorage.setItem("role", "employee");
                navigate("/login");
              }}
            >
              Employee
            </button>

            <button
              onClick={() => {
                localStorage.setItem("role", "mla");
                navigate("/login");
              }}
            >
              MLA
            </button>

            <button
              className="close-popup-btn"
              onClick={() => {
                setAuthPopup(false);
                navigate("/");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="complaint-hero">
        <div className="hero-content">
          <h1>Complaint Management</h1>
          <p>Track, manage, and resolve citizen complaints efficiently</p>
        </div>
      </div>

      <div className="control-dashboard">
        <div className="header">
          <h1><FaChartBar className="header-icon" /> Complaint Control Dashboard</h1>
          <div className="stats">
            <div className="stat-item"><FaListAlt /> Total <b>{stats.total}</b></div>
            <div className="stat-item warn"><FaClock /> Pending <b>{stats.pending}</b></div>
            <div className="stat-item process"><FaSpinner /> In Progress <b>{stats.progress}</b></div>
            <div className="stat-item done"><FaCheckCircle /> Resolved <b>{stats.resolved}</b></div>
          </div>
        </div>

        <div className="body">
          <div className="queue">
            <h3><FaFolderOpen className="section-icon" /> Complaint Queue</h3>
            <div className="queue-scroll-container">
              {complaints.map(c => (
                <div 
                  key={c._id} 
                  className={`item ${selected?._id === c._id ? "active" : ""}`} 
                  onClick={() => handleSelect(c)}
                >
                  <div className="badge-row">
                    <span className={`tag-status ${getStatusClass(c.status)}`}>{c.status}</span>
                    <span className="tag-urgency">{c.priority || "Normal"}</span>
                  </div>
                  <strong>{c.title}</strong>
                  <div className="mini-social">
                    <span><FaThumbsUp /> {c.likes || 0}</span>
                    <span><FaComment /> {c.replies?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="file">
            {!selected ? (
              <div className="empty-state">
                <FaFolderOpen size={90} style={{ opacity: 0.5 }} />
                <h3>Select a Complaint</h3>
                <p>Click on any complaint from the left to view complete details</p>
              </div>
            ) : (
              <div className="case-file">
                <h2><FaFolderOpen /> Case File</h2>

                <div className="social-actions-row">
                  <button onClick={() => handleLike(selected._id)}>
                    <FaThumbsUp /> {selected.likes || 0}
                  </button>
                  <button onClick={() => setSelectedForModal(selected)}>
                    <FaComment /> {selected.replies?.length || 0}
                  </button>
                  <button onClick={() => handleRepost(selected._id)}>
                    <FaShare /> {selected.reposts || 0}
                  </button>
                </div>

                {/* Rest of case file remains same */}
                <div className="detail-card">
                  <h4><FaTag /> Title</h4>
                  <p className="detail-value">{selected.title}</p>
                </div>

                <div className="detail-card">
                  <h4>Full Details</h4>
                  <p className="detail-value">
                    {selected.details || selected.description || selected.content || "No description provided."}
                  </p>
                </div>

                <div className="detail-grid">
                  <div className="detail-card">
                    <h4>Status</h4>
                    <p className="detail-value">{selected.status}</p>
                  </div>
                  <div className="detail-card">
                    <h4>Category</h4>
                    <p className="detail-value">{selected.category || "General"}</p>
                  </div>
                  <div className="detail-card">
                    <h4>Priority</h4>
                    <p className="detail-value">{selected.priority || "Normal"}</p>
                  </div>
                  <div className="detail-card">
                    <h4><FaCalendar /> Submitted On</h4>
                    <p className="detail-value">
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <button className="close-case-btn" onClick={() => setSelected(null)}>
                  Close View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal remains same */}
      {selectedForModal && (
        <div className="modal-overlay" onClick={() => setSelectedForModal(null)}>
          <div className="comment-modal-tile" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Discussion</h3>
              <button className="close-btn" onClick={() => setSelectedForModal(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="complaint-summary">
                <strong>{selectedForModal.title}</strong>
                <p>{selectedForModal.details || selectedForModal.description}</p>
              </div>

              <div className="comments-list">
                {selectedForModal.replies?.length > 0 ? (
                  selectedForModal.replies.map((reply, i) => (
                    <div key={i} className="single-comment">
                      <div className="comment-avatar">{reply.username?.[0] || "U"}</div>
                      <div className="comment-body">
                        <p className="comment-user">{reply.username || "Citizen"}</p>
                        <p className="comment-text">{reply.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to reply!</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button onClick={handleComment}>Send</button>
              {commentError && <p className="error-text">{commentError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;