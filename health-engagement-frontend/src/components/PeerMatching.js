import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PeerMatching.css';

const PeerMatching = () => {
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile/peers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeers(response.data);
    } catch (error) {
      console.error('Error fetching peers:', error);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      if (isFollowing) {
        await axios.delete(`/api/follows/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/follows/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Refresh peers list after follow/unfollow
      fetchPeers();
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  return (
    <div className="peer-matching-container">
      <h2>Recommended Peers</h2>
      <div className="peer-cards">
        {peers.length > 0 ? (
          peers.map((peer) => (
            <div className="peer-card" key={peer.userId}>
              <img
                src={peer.profilePicture || '/images/default.png'}
                alt={`${peer.username}'s profile`}
                className="peer-avatar"
              />
              <h3>{peer.username}</h3>
              <p>{peer.chronicCondition}</p>
              <button 
                className={`follow-btn ${peer.isFollowing ? 'following' : ''}`}
                onClick={() => handleFollow(peer.userId, peer.isFollowing)}
              >
                {peer.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          ))
        ) : (
          <p>No peers found.</p>
        )}
      </div>
    </div>
  );
};

export default PeerMatching;