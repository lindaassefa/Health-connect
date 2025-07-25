const HybridMatcher = require('../src/logic/hybridMatching');

// Simulation parameters
const USERS = 100;
const ITERATIONS = 1000;
const INTERACTION_PROBABILITY = 0.3;

// Generate mock users
const generateUsers = (count) => {
  const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'Arthritis'];
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    age: 20 + Math.floor(Math.random() * 40),
    chronicConditions: conditions[Math.floor(Math.random() * conditions.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    profilePicture: '/default.png'
  }));
};

// Simulate user interaction success
const simulateInteraction = (user1, user2) => {
  const sameCondition = user1.chronicConditions === user2.chronicConditions;
  const ageDiff = Math.abs(user1.age - user2.age);
  const sameLocation = user1.location === user2.location;
  
  let successProb = 0.3; // Base probability
  if (sameCondition) successProb += 0.3;
  if (ageDiff < 10) successProb += 0.2;
  if (sameLocation) successProb += 0.2;
  
  return Math.random() < successProb;
};

// Run simulation
const runSimulation = () => {
  console.log('Starting Hybrid System Simulation\n');
  
  const users = generateUsers(USERS);
  const hybridMatcher = new HybridMatcher();
  
  const metrics = {
    totalInteractions: 0,
    successfulInteractions: 0,
    matchScores: [],
    executionTimes: []
  };

  for (let i = 0; i < ITERATIONS; i++) {
    const activeUser = users[Math.floor(Math.random() * users.length)];
    const startTime = process.hrtime();
    
    // Get recommendations
    const recommendations = hybridMatcher.findMatches(
      activeUser,
      users.filter(u => u.id !== activeUser.id)
    );
    
    const endTime = process.hrtime(startTime);
    metrics.executionTimes.push((endTime[0] * 1000 + endTime[1] / 1e6));
    
    // Simulate interactions with top recommendations
    const topMatches = recommendations.slice(0, 5);
    topMatches.forEach(match => {
      if (Math.random() < INTERACTION_PROBABILITY) {
        metrics.totalInteractions++;
        metrics.matchScores.push(match.score);
        
        const success = simulateInteraction(activeUser, match);
        if (success) metrics.successfulInteractions++;
        
        hybridMatcher.updateMatchFeedback(match.id, success);
      }
    });
  }

  // Print results
  console.log('Simulation Results:');
  console.log('-------------------');
  console.log(`Total Iterations: ${ITERATIONS}`);
  console.log(`Total Interactions: ${metrics.totalInteractions}`);
  console.log(`Successful Interactions: ${metrics.successfulInteractions}`);
  console.log(`Success Rate: ${(metrics.successfulInteractions / metrics.totalInteractions * 100).toFixed(2)}%`);
  console.log(`Average Match Score: ${(metrics.matchScores.reduce((a, b) => a + b, 0) / metrics.matchScores.length).toFixed(3)}`);
  console.log(`Average Execution Time: ${(metrics.executionTimes.reduce((a, b) => a + b, 0) / metrics.executionTimes.length).toFixed(2)}ms`);
};

// Run the simulation
runSimulation();