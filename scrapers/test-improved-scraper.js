const ImprovedWalmartScraper = require('./improved-walmart-scraper');

async function testImprovedScraper() {
  console.log('🧪 Testing Improved Walmart Scraper...\n');

  const scraper = new ImprovedWalmartScraper();

  try {
    // Test 1: Basic search
    console.log('1. Testing basic search for "vitamin c"...');
    const results = await scraper.searchProducts('vitamin c', 'wellness', 5);
    console.log(`Found ${results.length} products:`);
    
    if (results.length > 0) {
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price || 'No price'} - ${product.retailer}`);
      });
    } else {
      console.log('  No products found');
    }
    console.log('✅ Basic search completed\n');

    // Test 2: Trending products
    console.log('2. Testing trending products...');
    const trending = await scraper.getTrendingProducts();
    console.log(`Found ${trending.length} trending products`);
    console.log('✅ Trending products test completed\n');

    // Test 3: Different category
    console.log('3. Testing skincare category...');
    const skincare = await scraper.searchProducts('moisturizer', 'skincare', 3);
    console.log(`Found ${skincare.length} skincare products`);
    console.log('✅ Skincare search completed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    console.log('🧹 Cleaning up...');
    await scraper.closeBrowser();
    console.log('✅ Cleanup completed');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testImprovedScraper();
}

module.exports = { testImprovedScraper }; 