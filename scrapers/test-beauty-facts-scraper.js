const OpenBeautyFactsScraper = require('./open-beauty-facts-scraper');

async function testBeautyFactsScraper() {
  console.log('💄 Testing Open Beauty Facts Scraper...\n');

  const scraper = new OpenBeautyFactsScraper();

  try {
    // Test 1: Show API information
    console.log('1. API Information:');
    const apiInfo = scraper.getApiInfo();
    console.log(JSON.stringify(apiInfo, null, 2));
    console.log('✅ API info retrieved\n');

    // Test 2: Search for beauty products
    console.log('2. Testing beauty product search...');
    const results = await scraper.searchProducts('moisturizer', 'beauty', 5);
    console.log(`Found ${results.length} moisturizer products:`);
    
    if (results.length > 0) {
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.brand})`);
        if (product.ingredients) {
          console.log(`     Ingredients: ${product.ingredients.substring(0, 100)}...`);
        }
      });
    }
    console.log('✅ Beauty product search completed\n');

    // Test 3: Search by category
    console.log('3. Testing category search...');
    const categories = ['skincare', 'makeup', 'haircare'];
    
    for (const category of categories) {
      const categoryResults = await scraper.searchByCategory(category, 3);
      console.log(`  ${category}: ${categoryResults.length} products`);
    }
    console.log('✅ Category search completed\n');

    // Test 4: Trending beauty products
    console.log('4. Testing trending beauty products...');
    const trending = await scraper.getTrendingBeautyProducts();
    console.log(`Found ${trending.length} trending beauty products`);
    console.log('✅ Trending products test completed\n');

    // Test 5: Personalized beauty recommendations
    console.log('5. Testing personalized beauty recommendations...');
    const mockUserProfile = {
      skinConcerns: 'acne, dryness, aging',
      skinType: 'combination',
      age: 28
    };
    
    const recommendations = await scraper.getPersonalizedBeautyRecommendations(mockUserProfile);
    console.log(`Generated ${recommendations.length} personalized beauty recommendations`);
    console.log('✅ Personalized recommendations generated\n');

    // Test 6: Health check
    console.log('6. Testing health check...');
    const health = await scraper.healthCheck();
    console.log(`Health status: ${health.status}`);
    console.log(`Message: ${health.message}`);
    console.log('✅ Health check completed\n');

    // Test 7: Barcode lookup (example)
    console.log('7. Testing barcode lookup...');
    // Using a sample barcode - you can replace with real ones
    const sampleBarcode = '737628064502'; // Example from Open Beauty Facts
    const barcodeProduct = await scraper.getProductByBarcode(sampleBarcode);
    if (barcodeProduct) {
      console.log(`Found product by barcode: ${barcodeProduct.name}`);
    } else {
      console.log('No product found for sample barcode (this is normal)');
    }
    console.log('✅ Barcode lookup test completed\n');

    console.log('🎉 All Open Beauty Facts tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- API: ${apiInfo.name}`);
    console.log(`- Cost: ${apiInfo.apiKey}`);
    console.log(`- Data Types: ${apiInfo.dataTypes.length} types available`);
    console.log(`- Features: ${apiInfo.features.length} features`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testBeautyFactsScraper();
}

module.exports = { testBeautyFactsScraper }; 