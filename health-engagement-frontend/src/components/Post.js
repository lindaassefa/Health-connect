import React from 'react';
import './Post.css';

function Post({ imageUrl, caption }) {
  return (
    <div className="post">
      {imageUrl && <img src={imageUrl} alt="Post" className="post-img" />}
      <div className="caption">{caption}</div>
    </div>
  );
}

export default Post;
