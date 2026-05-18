import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Trending.css";
import { useTranslation } from "react-i18next";

const Trending = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState(""); // Change {} to ""
  const [openCommentBox, setOpenCommentBox] = useState(null); // ✅ ADDED
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");
const [showPopup, setShowPopup] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Public Complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/public`
      );

      setComplaints(response.data);

    } catch (error) {

     console.error("Error fetching complaints:", error);

    } finally {

      setLoading(false);
    }
  };
  const showCustomPopup = (message) => {
  setPopupMessage(message);
  setShowPopup(true);

  setTimeout(() => {
    setShowPopup(false);
    setPopupMessage("");
  }, 2500);
};

  const handleCommentChange = (id, value) => {
    setCommentText((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Like Complaint
  const handleLike = async (id) => {
  try {
    // Redirect to login if user is not logged in
    if (!user || !user._id) {
      localStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname
      );
      navigate("/login");
      return;
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/complaints/${id}/like`,
      {
        userId: user._id,
      }
    );

    // Show backend message
showCustomPopup(response.data.message);

    // Update UI immediately
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint._id === id
          ? {
              ...complaint,
              likes: response.data.likes,
              likedBy:
                response.data.likedBy || complaint.likedBy,
            }
          : complaint
      )
    );

    // Update selected complaint if modal is open
    if (selectedComplaint?._id === id) {
      setSelectedComplaint((prev) => ({
        ...prev,
        likes: response.data.likes,
        likedBy:
          response.data.likedBy || prev.likedBy,
      }));
    }
  } catch (error) {
    console.error("Error liking complaint:", error);

   showCustomPopup(
  error.response?.data?.message ||
    "Failed to like complaint."
);
  }
};
// Replace your current handleRepost function with this one

const handleRepost = async (id) => {
  try {
    // If user is not logged in, go to login page
    if (!user || !user._id) {
      localStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname
      );
      navigate("/login");
      return;
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/complaints/${id}/repost`,
      {
        userId: user._id,
      }
    );

    // Show backend message
    showCustomPopup(response.data.message);

    // Update complaint list immediately in UI
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint._id === id
          ? {
              ...complaint,
              repostedBy: response.data.repostedBy || complaint.repostedBy,
            }
          : complaint
      )
    );

    // Also update selected complaint if modal is open
    if (selectedComplaint?._id === id) {
      setSelectedComplaint((prev) => ({
        ...prev,
        repostedBy:
          response.data.repostedBy || prev.repostedBy,
      }));
    }
  } catch (error) {
    console.error("Error reposting complaint:", error);

    showCustomPopup(
  error.response?.data?.message ||
    "Failed to repost complaint."
);
  }
};
  // Comment Button
  // Comment Button
  const handleComment = async () => {
    // 1. Auth Check
    if (!user || !user._id) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (!commentText || !commentText.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/${selectedComplaint._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          text: commentText.trim(),
          userId: user._id,
          userName: user.name || "Citizen", // ✅ Added: Match your new Schema
          role: user.role || "Citizen"      // ✅ Added: Match your new Schema
        }),

      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      // 3. Update Local State
      const updatedComplaints = complaints.map((item) =>
        item._id === selectedComplaint._id
          ? { ...item, replies: [...(item.replies || []), data] }
          : item
      );

      setComplaints(updatedComplaints);
      setSelectedComplaint(updatedComplaints.find(c => c._id === selectedComplaint._id));
      setCommentText("");

    } catch (error) {
      console.error("Comment Error:", error);
      alert("Failed to add comment");
    }
  };

  if (loading) return <div className="loading-container"><h2>{t("loading")}</h2></div>;

  return (
    <div className="trending-container">
    {showPopup && (
  <div className="custom-popup">
    {popupMessage}
  </div>
)}
      {/* Feed Header */}
      <div className="section-header">
        <div>
          <p className="sub-heading">{t("communityCivicFeed")}</p>
          <h2 className="heading">{t("trendingPublicComplaints")}</h2>
        </div>
      </div>
<div className="complaint-grid">
  {complaints.map((complaint) => {
    const hasReposted = complaint.repostedBy?.some(
      (id) => id.toString() === user?._id
    );

    return (
      <div className="complaint-card" key={complaint._id}>
        <div
          className="image-container"
          onClick={() => setSelectedComplaint(complaint)}
        >
          <img
            src={
              complaint.evidence
                ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${complaint.evidence}`
                : "https://images.news18.com/ibnlive/uploads/2023/06/public-grievance-168568115816x9.jpg"
            }
            alt={complaint.title}
          />
          <div className="card-overlay">
            <div className="top-badges">
              <span className="category-badge">
                {complaint.category}
              </span>
            </div>
            <div className="bottom-metadata">
              <h3 className="card-title">
                {complaint.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button
            className="action-btn"
            onClick={() => handleLike(complaint._id)}
          >
            👍 {complaint.likes || 0}
          </button>

          <button
            className="action-btn"
            onClick={() => setSelectedComplaint(complaint)}
          >
            💬 {complaint.replies?.length || 0}
          </button>

          <button
            className="action-btn"
            onClick={() => handleRepost(complaint._id)}
         
          >
            🔁 {complaint.repostedBy?.length || 0}
            {hasReposted ? " Reposted" : ""}
          </button>
        </div>
      </div>
    );
  })}
</div>

      {/* ✅ SEPARATE COMMENT TILE (MODAL) */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="comment-modal-tile" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("discussion")}</h3>
              <button className="close-btn" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="complaint-summary">
                <strong>{selectedComplaint.title}</strong>
                <p>{selectedComplaint.details}</p>
              </div>

              <div className="comments-list">
                {selectedComplaint.replies?.length > 0 ? (
                  selectedComplaint.replies.map((reply, i) => (
                    <div key={i} className="single-comment">
                      {/* Use userName for the avatar initial */}
                      <div className="comment-avatar">
                        {reply.userName?.charAt(0) || "U"}
                      </div>
                      <div className="comment-body">
                        <p className="comment-user">

                          {reply.userName}
                          {/* Optional: Add a badge if it's an official reply */}
                          {reply.role === "MLA" && <span className="official-badge">⭐ MLA</span>}
                        </p>

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

export default Trending;