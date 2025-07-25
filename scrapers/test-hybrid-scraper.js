const HybridScraperManager = require('./hybrid-scraper-manager');

async function testHybridScraper() {
  console.log('🧪 Testing Hybrid Scraper Manager...\n');

  const scraperManager = new HybridScraperManager();

  try {
    // Test 1: Health Check
    console.log('1. Running health check...');
    const healthStatus = await scraperManager.healthCheck();
    console.log('Health Status:', healthStatus);
    console.log('✅ Health check completed\n');

    // Test 2: Get scraper statistics
    console.log('2. Getting scraper statistics...');
    const stats = scraperManager.getScraperStats();
    console.log('Scraper Stats:', JSON.stringify(stats, null, 2));
    console.log('✅ Statistics retrieved\n');

    // Test 3: Search for products
    console.log('3. Searching for "vitamin c" across all sources...');
    const searchResults = await scraperManager.searchAllRetailers('vitamin c', 'wellness', 8);
    
    console.log(`Found ${searchResults.all.length} total products:`);
    console.log(`- API: ${searchResults.api.length} products`);
    console.log(`- iHerb: ${searchResults.iherb.length} products`);
    console.log(`- Healthline: ${searchResults.healthline.length} products`);
    
    if (searchResults.all.length > 0) {
      console.log('\nSample products:');
      searchResults.all.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price || 'No price'} (${product.retailer})`);
      });
    }
    console.log('✅ Search completed\n');

    // Test 4: Get trending products
    console.log('4. Getting trending products...');
    const trendingResults = await scraperManager.getTrendingProducts();
    console.log(`Found ${trendingResults.all.length} trending products`);
    console.log('✅ Trending products retrieved\n');

    // Test 5: Test personalized recommendations
    console.log('5. Testing personalized recommendations...');
    const mockUserProfile = {
      chronicConditions: 'anxiety, insomnia',
      skinConcerns: 'acne, dryness',
      age: 28
    };
    
    const recommendations = await scraperManager.getPersonalizedRecommendations(mockUserProfile);
    console.log(`Generated ${recommendations.length} personalized recommendations`);
    console.log('✅ Personalized recommendations generated\n');

    // Test 6: Test different categories
    console.log('6. Testing different categories...');
    const skincareResults = await scraperManager.searchAllRetailers('moisturizer', 'skincare', 5);
    console.log(`Found ${skincareResults.all.length} skincare products`);
    
    const supplementResults = await scraperManager.searchAllRetailers('probiotics', 'wellness', 5);
    console.log(`Found ${supplementResults.all.length} supplement products`);
    console.log('✅ Category tests completed\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up browser instances
    console.log('🧹 Cleaning up browser instances...');
    await scraperManager.closeAllBrowsers();
    console.log('✅ Cleanup completed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testHybridScraper();
}

module.exports = { testHybridScraper }; 