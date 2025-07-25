// test/hybridMatching.test.js

const HybridMatcher = require('../src/logic/hybridMatching');
const PeerMAB = require('../src/logic/peerMatchingMAB');

// Test data
const mockUsers = [
  {
    id: 1,
    username: "user1",
    age: 25,
    chronicConditions: "Diabetes",
    location: "New York",
    profilePicture: "/default.png"
  },
  {
    id: 2,
    username: "user2",
    age: 26,
    chronicConditions: "Diabetes",
    location: "New York",
    profilePicture: "/default.png"
  },
  {
    id: 3,
    username: "user3",
    age: 45,
    chronicConditions: "Hypertension",
    location: "Los Angeles",
    profilePicture: "/default.png"
  }
];

describe('Hybrid Matching System Tests', () => {
  let hybridMatcher;

  beforeEach(() => {
    hybridMatcher = new HybridMatcher();
  });

  test('Initial recommendations should be based mainly on content', () => {
    const user = mockUsers[0];
    const candidates = mockUsers.filter(u => u.id !== user.id);
    
    const matches = hybridMatcher.findMatches(user, candidates);
    
    // User2 should be ranked higher than User3 initially
    expect(matches[0].id).toBe(2);
    expect(matches[1].id).toBe(3);
  });

  test('MAB scores should influence rankings after feedback', () => {
    const user = mockUsers[0];
    const candidates = mockUsers.filter(u => u.id !== user.id);
    
    // Simulate negative feedback for the similar user
    hybridMatcher.updateMatchFeedback(2, false);
    hybridMatcher.updateMatchFeedback(2, false);
    
    // Simulate positive feedback for the different user
    hybridMatcher.updateMatchFeedback(3, true);
    hybridMatcher.updateMatchFeedback(3, true);
    
    const matches = hybridMatcher.findMatches(user, candidates);
    
    // After feedback, User3 might rank higher despite lower content similarity
    expect(matches[0].score).toBeGreaterThan(0);
  });

  test('Hybrid scores should be between 0 and 1', () => {
    const user = mockUsers[0];
    const candidates = mockUsers.filter(u => u.id !== user.id);
    
    const matches = hybridMatcher.findMatches(user, candidates);
    
    matches.forEach(match => {
      expect(match.score).toBeGreaterThanOrEqual(0);
      expect(match.score).toBeLessThanOrEqual(1);
    });
  });

  // Performance test
  test('Performance with larger dataset', () => {
    const largeUserSet = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      age: 20 + Math.floor(Math.random() * 40),
      chronicConditions: Math.random() > 0.5 ? "Diabetes" : "Hypertension",
      location: Math.random() > 0.5 ? "New York" : "Los Angeles",
      profilePicture: "/default.png"
    }));

    const startTime = process.hrtime();
    
    const matches = hybridMatcher.findMatches(largeUserSet[0], largeUserSet.slice(1));
    
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
    
    console.log(`Execution time for 1000 users: ${executionTime}ms`);
    expect(matches.length).toBe(999);
  });
});