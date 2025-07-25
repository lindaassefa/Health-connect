// src/logic/hybridMatching.js

const calculateSimilarity = require('./peerMatching');
const PeerMAB = require('./peerMatchingMAB');

class HybridMatcher {
  constructor() {
    this.mab = new PeerMAB();
    this.contentWeight = 0.7;  // Weight for content-based score
    this.mabWeight = 0.3;      // Weight for MAB score
  }

  // Calculate hybrid score combining content-based and MAB
  calculateHybridScore(user, candidate, totalInteractions) {
    // Get content-based similarity score
    const contentScore = calculateSimilarity(user, candidate);
    
    // Get MAB score
    const mabScore = this.mab.getUCBScore(candidate.id, totalInteractions);
    
    // Normalize MAB score (convert from UCB scale to 0-1)
    const normalizedMabScore = Math.min(mabScore / 2, 1);
    
    // Combine scores with weights
    return (contentScore * this.contentWeight) + (normalizedMabScore * this.mabWeight);
  }

  // Find matches for a user
  findMatches(user, candidates) {
    const totalInteractions = Array.from(this.mab.trials.values())
      .reduce((sum, count) => sum + count, 0);

    return candidates
      .map(candidate => ({
        ...candidate,
        score: this.calculateHybridScore(user, candidate, totalInteractions)
      }))
      .sort((a, b) => b.score - a.score);
  }

  // Update MAB with interaction feedback
  updateMatchFeedback(peerId, success) {
    this.mab.updateScores(peerId, success ? 1 : 0);
  }
}

module.exports = HybridMatcher;