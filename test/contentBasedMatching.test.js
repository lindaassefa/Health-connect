// test/contentBasedMatching.test.js

const calculateSimilarity = require('../src/logic/peerMatching');

// Test dataset
const testUsers = [
  {
    id: 1,
    age: 25,
    chronicConditions: 'Diabetes',
    location: 'New York'
  },
  {
    id: 2,
    age: 26,
    chronicConditions: 'Diabetes',
    location: 'New York'
  },
  {
    id: 3,
    age: 45,
    chronicConditions: 'Hypertension',
    location: 'Los Angeles'
  },
  {
    id: 4,
    age: 28,
    chronicConditions: 'Diabetes',
    location: 'Chicago'
  }
];

describe('Content-Based Peer Matching Tests', () => {
  test('Perfect match should return high similarity score', () => {
    const user1 = testUsers[0];
    const user2 = testUsers[1];
    const score = calculateSimilarity(user1, user2);
    expect(score).toBeGreaterThan(0.8);
  });

  test('Different condition should have lower similarity', () => {
    const user1 = testUsers[0];
    const user3 = testUsers[2];
    const score = calculateSimilarity(user1, user3);
    expect(score).toBeLessThan(0.5);
  });

  test('Same condition but different location should have medium similarity', () => {
    const user1 = testUsers[0];
    const user4 = testUsers[3];
    const score = calculateSimilarity(user1, user4);
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(0.9);
  });
});