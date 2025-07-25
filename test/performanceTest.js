// test/performanceTest.js

const calculateSimilarity = require('../src/logic/peerMatching');

// Generate mock users
const generateMockUsers = (count) => {
  const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'Arthritis'];
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    age: 20 + Math.floor(Math.random() * 40),
    chronicConditions: conditions[Math.floor(Math.random() * conditions.length)],
    location: locations[Math.floor(Math.random() * locations.length)]
  }));
};

const runPerformanceTest = () => {
  console.log('Starting Content-Based Matching Performance Test\n');
  
  // Generate test data
  const userCount = 1000;
  const users = generateMockUsers(userCount);
  const testUser = users[0];
  
  // Performance metrics
  const metrics = {
    totalComparisons: 0,
    matchDistribution: {
      highMatches: 0,  // > 0.7
      mediumMatches: 0, // 0.4 - 0.7
      lowMatches: 0     // < 0.4
    },
    executionTime: 0,
    averageScore: 0
  };

  // Run matching
  const startTime = process.hrtime();
  
  users.forEach(candidate => {
    if (candidate.id === testUser.id) return;
    
    const score = calculateSimilarity(testUser, candidate);
    metrics.totalComparisons++;
    metrics.averageScore += score;
    
    if (score > 0.7) metrics.matchDistribution.highMatches++;
    else if (score > 0.4) metrics.matchDistribution.mediumMatches++;
    else metrics.matchDistribution.lowMatches++;
  });
  
  const endTime = process.hrtime(startTime);
  metrics.executionTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2); // in milliseconds
  metrics.averageScore = (metrics.averageScore / metrics.totalComparisons).toFixed(3);
  
  // Print results
  console.log('Performance Results:');
  console.log('-------------------');
  console.log(`Total Users: ${userCount}`);
  console.log(`Total Comparisons: ${metrics.totalComparisons}`);
  console.log(`Execution Time: ${metrics.executionTime}ms`);
  console.log(`Average Match Score: ${metrics.averageScore}`);
  console.log('\nMatch Distribution:');
  console.log(`High Matches (>0.7): ${metrics.matchDistribution.highMatches}`);
  console.log(`Medium Matches (0.4-0.7): ${metrics.matchDistribution.mediumMatches}`);
  console.log(`Low Matches (<0.4): ${metrics.matchDistribution.lowMatches}`);
  
  return metrics;
};

// Run the test
runPerformanceTest();