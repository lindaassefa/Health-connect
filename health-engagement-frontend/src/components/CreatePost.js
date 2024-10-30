import React, { useState } from 'react';
import axios from 'axios';
import './Post.css';

function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [isThought, setIsThought] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moderationFeedback, setModerationFeedback] = useState('');

  // Handle changes when user selects an image file
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setIsThought(false);
    setModerationFeedback('');
  };

  // Handle when user chooses to post a thought (text-only)
  const handleThoughtChange = () => {
    setImage(null);
    setIsThought(true);
    setModerationFeedback('');
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset moderation feedback and start loading
    setModerationFeedback('');
    setLoading(true);

    // Create a new FormData instance for file uploads
    const formData = new FormData();
    formData.append('caption', caption);
    if (image) {
      formData.append('image', image);
    }
    formData.append('isThought', isThought);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Post created:', response.data);
      setCaption('');
      setImage(null);
      setIsThought(false);
      setModerationFeedback(''); // Clear any existing feedback
    } catch (error) {
      // Check if it's a moderation-related error
      if (error.response && error.response.status === 400) {
        setModerationFeedback(error.response.data.message);
      } else {
        console.error('Error creating post:', error);
        setModerationFeedback('Error creating post. Please try again later.');
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

      {moderationFeedback && <p className="moderation-feedback">{moderationFeedback}</p>}

      <button type="button" onClick={handleThoughtChange} className="thought-button">
        Post a Thought (Text Only)
      </button>

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange} 
        className="image-upload"
      />

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Checking...' : 'Create Post'}
      </button>
    </form>
  );
}

export default CreatePost;
