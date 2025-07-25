const EnhancedApiScraper = require('./enhanced-api-scraper');

async function testEnhancedScraper() {
  console.log('🧪 Testing Enhanced API Scraper...\n');

  const scraper = new EnhancedApiScraper();

  try {
    // Test 1: Basic search with multiple sources
    console.log('1. Testing enhanced search for "vitamin c"...');
    const results = await scraper.searchProducts('vitamin c', 'wellness', 8);
    console.log(`Found ${results.length} products from multiple sources:`);
    
    if (results.length > 0) {
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price || 'No price'} (${product.retailer})`);
      });
    }
    console.log('✅ Enhanced search completed\n');

    // Test 2: Different categories
    console.log('2. Testing different categories...');
    const skincareResults = await scraper.searchProducts('moisturizer', 'skincare', 5);
    console.log(`Found ${skincareResults.length} skincare products`);
    
    const beautyResults = await scraper.searchProducts('foundation', 'beauty', 5);
    console.log(`Found ${beautyResults.length} beauty products`);
    console.log('✅ Category tests completed\n');

    // Test 3: Trending products
    console.log('3. Testing trending products...');
    const trending = await scraper.getTrendingProducts();
    console.log(`Found ${trending.length} trending products`);
    console.log('✅ Trending products test completed\n');

    // Test 4: Personalized recommendations
    console.log('4. Testing personalized recommendations...');
    const mockUserProfile = {
      chronicConditions: 'anxiety, insomnia',
      skinConcerns: 'acne, dryness',
      age: 28
    };
    
    const recommendations = await scraper.getPersonalizedRecommendations(mockUserProfile);
    console.log(`Generated ${recommendations.length} personalized recommendations`);
    console.log('✅ Personalized recommendations generated\n');

    // Test 5: Test with different queries
    console.log('5. Testing various queries...');
    const queries = ['probiotics', 'collagen', 'retinol', 'hyaluronic acid'];
    
    for (const query of queries) {
      const queryResults = await scraper.searchProducts(query, 'wellness', 3);
      console.log(`  "${query}": ${queryResults.length} products`);
    }
    console.log('✅ Query variety test completed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEnhancedScraper();
}

module.exports = { testEnhancedScraper }; 