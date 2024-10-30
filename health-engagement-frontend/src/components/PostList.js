import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post'; // Import the Post component

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/posts/user-posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPosts(response.data);  // Update state with fetched posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-feed">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          imageUrl={post.imageUrl} 
          caption={post.caption} 
        />
      ))}
    </div>
  );
}

export default PostList;
