// Frontend Post.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Post.css';

function Post({ postId, imageUrl, caption, initialLikeCount = 0, initialIsLiked = false }) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = liked ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `/api/likes/${postId}/like`,
        headers: { Authorization: `Bearer ${token}` }
      });

      setLiked(!liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar"></div>
        <div className="post-username">User</div>
      </div>
      {imageUrl && <img src={imageUrl} alt="Post" className="post-image" />}
      <div className="post-caption">{caption}</div>
      <div className="post-actions">
        <span className={`heart-icon ${liked ? 'liked' : ''}`} onClick={handleLike}>
          ❤️ {likeCount}
        </span>
        <button className="comment-btn" onClick={() => document.getElementById(`comment-${postId}`).focus()}>
          Comment
        </button>
      </div>
      <div className="comment-section">
        <input
          id={`comment-${postId}`}
          type="text"
          className="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button className="comment-btn" onClick={handleCommentSubmit}>
          Post
        </button>
        <div className="comment-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              {comment}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Post;