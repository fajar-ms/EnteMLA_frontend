import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Trending.css";

const Trending = () => {

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Like Complaint
  const handleLike = async (id) => {

    // Get liked complaints
    const likedComplaints =
      JSON.parse(
        localStorage.getItem(
          "likedComplaints"
        )
      ) || [];

    // Already liked
    const alreadyLiked =
      likedComplaints.includes(id);

    try {

      await axios.patch(
        `http://localhost:3001/complaints/${id}/like`
      );

      // Update UI
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

      // Remove like
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

      // Add like
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
  const handleComment = (id) => {

    console.log("Open comments:", id);

  };

  if (loading) {

    return (
      <div className="loading-container">
        <h2 className="loading">
          Loading complaints...
        </h2>
      </div>
    );
  }

  return (

    <div className="trending-container">

      {/* Header */}
      <div className="section-header">

        <div>
          <p className="sub-heading">
            Community Civic Feed
          </p>

          <h2 className="heading">
            Trending Public Complaints
          </h2>
        </div>

        <button className="filter-btn">
          Latest Issues
        </button>

      </div>

      {/* Grid */}
      <div className="complaint-grid">

        {complaints.map((complaint) => (

          <div
            className="complaint-card"
            key={complaint._id}
          >

            {/* Image */}
            <div className="image-container">

              <img
                src={
                  complaint.evidence
                    ? `http://localhost:3001/uploads/${complaint.evidence}`
                    : "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop"
                }
                alt={complaint.title}
              />

              {/* Overlay */}
              <div className="overlay"></div>

              {/* Urgency Badge */}
              <span
                className={`urgency-badge ${complaint.urgency.toLowerCase()}`}
              >
                {complaint.urgency}
              </span>

              {/* Status */}
              <span className="status-badge">
                {complaint.status}
              </span>

            </div>

            {/* Content */}
            <div className="card-content">

              <div className="card-top">

                <p className="category">
                  {complaint.category}
                </p>

                <p className="date">
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </p>

              </div>

              <h3>
                {complaint.title}
              </h3>

              <p className="details">
                {complaint.details}
              </p>

              <div className="location-row">

                <span className="location-icon">
                  📍
                </span>

                <p className="location">
                  {complaint.location || "Location unavailable"}
                </p>

              </div>

              {/* Footer */}
              <div className="card-footer">

                <button
                  className={`action-btn like-btn ${JSON.parse(
                    localStorage.getItem(
                      "likedComplaints"
                    )
                  )?.includes(complaint._id)
                      ? "liked"
                      : ""
                    }`}
                  onClick={() =>
                    handleLike(complaint._id)
                  }
                >
                  👍
                  <span>
                    {complaint.likes || 0}
                  </span>
                </button>

                <button
                  className="action-btn"
                  onClick={() =>
                    handleComment(complaint._id)
                  }
                >
                  💬
                  <span>
                    {complaint.replies?.length || 0}
                  </span>
                </button>

                <button
                  className="action-btn"
                  onClick={() =>
                    handleRepost(complaint._id)
                  }
                >
                  🔁
                  <span>
                    {complaint.reposts || 0}
                  </span>
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Trending;