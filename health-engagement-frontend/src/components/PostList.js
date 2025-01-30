import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Post.css";

function PostList() {
  const [posts, setPosts] = useState([]);

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/posts/user-posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Handle Like Button
  const handleLike = async (postId, isLiked) => {
    try {
      const token = localStorage.getItem("token");
      if (isLiked) {
        await axios.delete(`/api/likes/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/likes/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Update post state to reflect changes
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isLiked: !isLiked } : post
        )
      );
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  // Handle Comment Submission
  const handleComment = async (postId, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/comments/${postId}`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update comments list in the UI (Optional)
      // Fetch updated comments for this post, or add the comment locally
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="post-list-container">
    {posts.length > 0 ? (
      posts.map((post) => (
        <div className="post-card" key={post.id}>
          <div className="post-header">
            <img
              src={
                post.profilePicture
                  ? `http://localhost:5003${post.profilePicture}`
                  : "/images/default-avatar.png" // Placeholder avatar
              }
              alt={`${post.username}'s profile`}
              className="post-avatar"
            />
            <h4 className="post-username">{post.username}</h4>
          </div>
          {post.imageUrl && (
            <img
              src={`http://localhost:5003${post.imageUrl}`}
              alt="Post"
              className="post-image"
            />
          )}
          <p className="post-caption">{post.caption}</p>
          <div className="post-actions">
            <span
              className={`heart-icon ${post.isLiked ? "liked" : ""}`}
              onClick={() => handleLike(post.id, post.isLiked)}
            >
              ❤️
            </span>
            <button
              className="comment-btn"
              onClick={() => {
                const comment = prompt("Enter your comment:");
                if (comment) handleComment(post.id, comment);
              }}
            >
              Comment
            </button>
          </div>
          {post.comments && post.comments.length > 0 && (
            <div className="comment-list">
              {post.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <strong>{comment.username}:</strong> {comment.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))
    ) : (
      <p className="no-posts-message">
        There are no posts yet. Be the first to share your thoughts!
      </p>
    )}
  </div>
  
  );
}

export default PostList;
