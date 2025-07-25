const ApiBasedScraper = require('./api-based-scraper');

async function testApiScraper() {
  console.log('🧪 Testing API-Based Scraper...\n');

  const scraper = new ApiBasedScraper();

  try {
    // Test 1: Basic search
    console.log('1. Testing basic search for "vitamin c"...');
    const results = await scraper.searchProducts('vitamin c', 'wellness', 5);
    console.log(`Found ${results.length} products:`);
    
    if (results.length > 0) {
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price} - ${product.retailer}`);
      });
    }
    console.log('✅ Basic search completed\n');

    // Test 2: Trending products
    console.log('2. Testing trending products...');
    const trending = await scraper.getTrendingProducts();
    console.log(`Found ${trending.length} trending products`);
    console.log('✅ Trending products test completed\n');

    // Test 3: Personalized recommendations
    console.log('3. Testing personalized recommendations...');
    const mockUserProfile = {
      chronicConditions: 'anxiety, insomnia',
      skinConcerns: 'acne, dryness',
      age: 28
    };
    
    const recommendations = await scraper.getPersonalizedRecommendations(mockUserProfile);
    console.log(`Generated ${recommendations.length} personalized recommendations`);
    console.log('✅ Personalized recommendations generated\n');

    // Test 4: Different categories
    console.log('4. Testing different categories...');
    const skincare = await scraper.searchProducts('moisturizer', 'skincare', 3);
    console.log(`Found ${skincare.length} skincare products`);
    
    const supplements = await scraper.searchProducts('probiotics', 'wellness', 3);
    console.log(`Found ${supplements.length} supplement products`);
    console.log('✅ Category tests completed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testApiScraper();
}

module.exports = { testApiScraper }; 