import React, { useState } from 'react';
import axios from 'axios';
import './Post.css';

// Define API URLs
const MODERATION_API = 'http://localhost:8000/api/moderate-image';
const POSTS_API = 'http://localhost:5003/api/posts';

function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [isThought, setIsThought] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moderationFeedback, setModerationFeedback] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setIsThought(false);
    setModerationFeedback('');
  };

  const handleThoughtChange = () => {
    setImage(null);
    setIsThought(true);
    setModerationFeedback('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModerationFeedback('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (image) {
        // First, moderate the image
        const moderationFormData = new FormData();
        moderationFormData.append('file', image);

        const moderationResponse = await axios.post(MODERATION_API, moderationFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Moderation response:', moderationResponse.data);
        
        if (moderationResponse.data.is_toxic) {
          setModerationFeedback(moderationResponse.data.recommendation);
          setLoading(false);
          return;
        }
      }

      // If moderation passed or no image, create the post
      const postFormData = new FormData();
      postFormData.append('caption', caption);
      if (image) {
        postFormData.append('file', image); // Changed from 'image' to 'file'
      }
      postFormData.append('isThought', isThought);

      const postResponse = await axios.post(POSTS_API, postFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Post created:', postResponse.data);
      
      // Reset form
      setCaption('');
      setImage(null);
      setIsThought(false);
      setModerationFeedback('Post created successfully!');
      
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        if (error.response.status === 422) {
          setModerationFeedback('Invalid file upload. Please try again.');
        } else if (error.response.status === 400) {
          setModerationFeedback(error.response.data.message);
        } else {
          setModerationFeedback('Error processing image. Please try again later.');
        }
      } else if (error.request) {
        setModerationFeedback('Network error. Please check your connection.');
      } else {
        setModerationFeedback('Error creating post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <input
        type="text"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        required
      />

      {moderationFeedback && (
        <p className="moderation-feedback">{moderationFeedback}</p>
      )}

      <button 
        type="button" 
        onClick={handleThoughtChange} 
        className="thought-button"
      >
        Post a Thought (Text Only)
      </button>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="image-upload"
      />

      <button 
        type="submit" 
        disabled={loading} 
        className="submit-button"
      >
        {loading ? 'Checking...' : 'Create Post'}
      </button>
    </form>
  );
}

export default CreatePost;