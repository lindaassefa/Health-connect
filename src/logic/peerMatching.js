/**
 * Calculates similarity between two users based on condition, age, and location.
 * @param {Object} user - The logged-in user's data.
 * @param {Object} candidate - The candidate user's data.
 * @returns {Number} - The similarity score (0 to 1).
 */
const calculateSimilarity = (user, candidate) => {
    // Exact match for conditions
    const conditionScore = user.chronicConditions === candidate.chronicConditions ? 1 : 0;

    // Normalize age difference (assumes max age difference is 100)
    const ageDifference = Math.abs(user.age - candidate.age);
    const ageScore = 1 - (ageDifference / 100);

    // Exact match for location
    const locationScore = user.location === candidate.location ? 1 : 0;

    // Weighted similarity score
    const finalScore =
        (conditionScore * 0.5) + // 50% weight for condition
        (ageScore * 0.3) +       // 30% weight for age
        (locationScore * 0.2);   // 20% weight for location

    return finalScore; // Returns a score between 0 and 1
};

module.exports = calculateSimilarity;
