import React from 'react';
import './Post.css'; // Ensure this path is correct for your project structure

function Post({ imageUrl, caption }) {
  return (
    <div className="post">
      <img src={imageUrl} alt="Post" />
      <div className="caption">{caption}</div>
    </div>
  );
}

export default Post;
