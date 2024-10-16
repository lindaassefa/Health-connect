import React from 'react';
import './Post.css';

function Post({ imageUrl, caption }) {
  return (
    <div className="post">
      <img src={imageUrl} alt="Post" className="post-img" /> {/* Correctly apply the class */}
      <div className="caption">
        {caption}
      </div>
    </div>
  );
}

export default Post;
