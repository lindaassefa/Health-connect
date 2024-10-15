import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post'; // Import Post component

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <img
              src={post.user.profilePicture || '/images/default.png'}
              alt="Profile"
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
            <p>{post.user.username}</p>
          </div>
          {post.imageUrl && <Post imageUrl={post.imageUrl} caption={post.caption} />} {/* Use Post component */}
        </div>
      ))}
    </div>
  );
}

export default PostList;
