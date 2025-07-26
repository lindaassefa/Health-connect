import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PeerMatching.css';

const PeerMatching = () => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile/peers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Received peer data:", response.data);
      setPeers(response.data);
    } catch (error) {
      console.error('Error fetching peers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, isFollowing, event) => {
    // Prevent the click from bubbling up to the card click handler
    event.stopPropagation();
    
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
      fetchPeers();
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return <div className="peer-matching-container">Loading...</div>;
  }

  return (
    <div className="peer-matching-container">
      <h2>Recommended Peers</h2>
      <div className="peer-cards">
        {peers.length > 0 ? (
          peers.map((peer) => (
            <div 
              className="peer-card" 
              key={peer.userId || peer.id}
              onClick={() => handleProfileClick(peer.userId || peer.id)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={peer.profilePicture || '/images/default.png'}
                alt={`${peer.username}'s profile`}
                className="peer-avatar"
              />
              <h3>{peer.username}</h3>
              {peer.chronicCondition && (
                <p className="condition">{peer.chronicCondition}</p>
              )}
              {peer.location && <p className="location">{peer.location}</p>}
              {peer.similarityScore && (
                <p className="match-score">
                  Match Score: {(parseFloat(peer.similarityScore) * 100).toFixed(1)}%
                </p>
              )}
              <button
                className={`follow-btn ${peer.isFollowing ? 'following' : ''}`}
                onClick={(e) => handleFollow(peer.userId || peer.id, peer.isFollowing, e)}
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
