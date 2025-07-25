// src/logic/peerMatchingMAB.js

class PeerMAB {
    constructor() {
      this.scores = new Map();  // Store average rewards for each peer
      this.trials = new Map();  // Store number of times each peer was selected
      this.alpha = 0.1;        // Learning rate
    }
  
    // Calculate UCB score for exploration-exploitation balance
    getUCBScore(peerId, totalTrials) {
      const peerTrials = this.trials.get(peerId) || 0;
      const avgReward = this.scores.get(peerId) || 0;
      
      if (peerTrials === 0) return Infinity;
      
      // UCB1 formula
      return avgReward + Math.sqrt((2 * Math.log(totalTrials)) / peerTrials);
    }
  
    // Update scores based on interaction feedback
    updateScores(peerId, reward) {
      const currentScore = this.scores.get(peerId) || 0;
      const currentTrials = this.trials.get(peerId) || 0;
      
      // Update using exponential moving average
      const newScore = (currentScore * currentTrials + reward) / (currentTrials + 1);
      this.scores.set(peerId, newScore);
      this.trials.set(peerId, currentTrials + 1);
    }
  
    // Get current score for a peer
    getScore(peerId) {
      return this.scores.get(peerId) || 0;
    }
  }
  
  module.exports = PeerMAB;