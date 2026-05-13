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
  const [commentText, setCommentText] = useState({});
  const [openCommentBox, setOpenCommentBox] = useState(null); // ✅ ADDED
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Public Complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3001/complaints/public"
      );

      setComplaints(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  const handleCommentChange = (id, value) => {
    setCommentText((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Like Complaint
  const handleLike = async (id) => {

    const likedComplaints =
      JSON.parse(
        localStorage.getItem(
          "likedComplaints"
        )
      ) || [];

    const alreadyLiked =
      likedComplaints.includes(id);

    try {

      await axios.patch(
        `http://localhost:3001/complaints/${id}/like`
      );

      setComplaints((prev) =>
        prev.map((item) => {

          if (item._id === id) {

            return {

              ...item,

              likes: alreadyLiked
                ? Math.max(
                  (item.likes || 1) - 1,
                  0
                )
                : (item.likes || 0) + 1,
            };
          }

          return item;
        })
      );

      if (alreadyLiked) {

        const updatedLikes =
          likedComplaints.filter(
            (likedId) => likedId !== id
          );

        localStorage.setItem(
          "likedComplaints",
          JSON.stringify(updatedLikes)
        );
      }

      else {

        localStorage.setItem(
          "likedComplaints",
          JSON.stringify([
            ...likedComplaints,
            id,
          ])
        );
      }

    } catch (error) {
      console.log(error);
    }
  };

  // Repost Complaint
  const handleRepost = async (id) => {

    try {

      await axios.patch(
        `http://localhost:3001/complaints/${id}/repost`
      );

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
              ...item,
              reposts: (item.reposts || 0) + 1,
            }
            : item
        )
      );

    } catch (error) {
      console.log(error);
    }
  };

  // Comment Button
  // Comment Button
  const handleComment = async () => {
    if (!user || !user._id) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/complaints/${selectedComplaint._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText, userId: user._id }),
      });

      const data = await res.json();

      // Update Local State for Modal & Grid
      const updatedComplaints = complaints.map((item) =>
        item._id === selectedComplaint._id
          ? { ...item, replies: [...(item.replies || []), data] }
          : item
      );
      
      setComplaints(updatedComplaints);
      setSelectedComplaint(updatedComplaints.find(c => c._id === selectedComplaint._id));
      setCommentText(""); // Clear input
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  if (loading) return <div className="loading-container"><h2>{t("loading")}</h2></div>;

  return (
    <div className="trending-container">
      {/* Feed Header */}
      <div className="section-header">
        <div>
          <p className="sub-heading">{t("communityCivicFeed")}</p>
          <h2 className="heading">{t("trendingPublicComplaints")}</h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="complaint-grid">
        {complaints.map((complaint) => (
          <div className="complaint-card" key={complaint._id}>
            <div className="image-container" onClick={() => setSelectedComplaint(complaint)}>
              <img src={complaint.evidence ? `http://localhost:3001/uploads/${complaint.evidence}` : "https://images.unsplash.com/photo-1521791136064-7986c2920216"} alt={complaint.title} />
              <div className="card-overlay">
                <div className="top-badges"><span className="category-badge">{complaint.category}</span></div>
                <div className="bottom-metadata"><h3 className="card-title">{complaint.title}</h3></div>
              </div>
            </div>

            <div className="card-actions">
              <button className="action-btn" onClick={() => handleLike(complaint._id)}>👍 {complaint.likes || 0}</button>
              {/* This now opens the separate tile */}
              <button className="action-btn" onClick={() => setSelectedComplaint(complaint)}>💬 {complaint.replies?.length || 0}</button>
              <button className="action-btn" onClick={() => handleRepost(complaint._id)}>🔁 {complaint.reposts || 0}</button>
            </div>
          </div>
        ))}
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
                placeholder={t("writecomment")} 
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