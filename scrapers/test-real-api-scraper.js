const RealApiScraper = require('./real-api-scraper');

async function testRealApiScraper() {
  console.log('🧪 Testing Real API Scraper...\n');

  const scraper = new RealApiScraper();

  try {
    // Test 1: Show API setup instructions
    console.log('1. API Setup Instructions:');
    const instructions = scraper.getApiSetupInstructions();
    console.log(JSON.stringify(instructions, null, 2));
    console.log('✅ API instructions retrieved\n');

    // Test 2: Search with real APIs
    console.log('2. Testing search with real APIs...');
    const results = await scraper.searchProducts('vitamin c', 'wellness', 8);
    console.log(`Found ${results.length} products from real APIs:`);
    
    if (results.length > 0) {
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price || 'No price'} (${product.retailer})`);
      });
    }
    console.log('✅ Real API search completed\n');

    // Test 3: Test different queries
    console.log('3. Testing different queries...');
    const queries = ['probiotics', 'collagen', 'omega 3'];
    
    for (const query of queries) {
      const queryResults = await scraper.searchProducts(query, 'wellness', 3);
      console.log(`  "${query}": ${queryResults.length} products`);
    }
    console.log('✅ Query variety test completed\n');

    // Test 4: Trending products
    console.log('4. Testing trending products...');
    const trending = await scraper.getTrendingProducts();
    console.log(`Found ${trending.length} trending products`);
    console.log('✅ Trending products test completed\n');

    // Test 5: Personalized recommendations
    console.log('5. Testing personalized recommendations...');
    const mockUserProfile = {
      chronicConditions: 'anxiety, insomnia',
      skinConcerns: 'acne, dryness',
      age: 28
    };
    
    const recommendations = await scraper.getPersonalizedRecommendations(mockUserProfile);
    console.log(`Generated ${recommendations.length} personalized recommendations`);
    console.log('✅ Personalized recommendations generated\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRealApiScraper();
}

module.exports = { testRealApiScraper }; 