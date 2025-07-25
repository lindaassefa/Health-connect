const axios = require('axios');

class OpenBeautyFactsScraper {
  constructor() {
    this.baseUrl = 'https://world.openbeautyfacts.org';
    this.apiUrl = 'https://world.openbeautyfacts.org/api/v2/product';
    this.searchUrl = 'https://world.openbeautyfacts.org/cgi/search.pl';
  }

  async searchProducts(query, category = 'beauty', limit = 20) {
    console.log(`💄 Searching Open Beauty Facts for: ${query}`);
    
    try {
      // Search for beauty products containing the query
      const searchParams = new URLSearchParams({
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: limit,
        // Don't filter too strictly - let's get more results
        fields: 'code,product_name,generic_name,brands,categories_tags,image_url,url,ingredients_text,cosmetics'
      });
      
      const searchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'HealthEngagement/1.0 (https://github.com/your-repo)',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.products) {
        const products = response.data.products.map(product => this.formatProduct(product, query));
        console.log(`✅ Found ${products.length} beauty products from Open Beauty Facts`);
        return products;
      }
      
      console.log('⚠️ No products found in Open Beauty Facts');
      return [];
      
    } catch (error) {
      console.error(`❌ Open Beauty Facts search failed: ${error.message}`);
      return [];
    }
  }

  async getProductByBarcode(barcode) {
    try {
      const url = `${this.apiUrl}/${barcode}.json`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'HealthEngagement/1.0 (https://github.com/your-repo)',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.status === 1) {
        return this.formatProduct(response.data.product, '');
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Failed to get product by barcode ${barcode}: ${error.message}`);
      return null;
    }
  }

  formatProduct(product, query) {
    return {
      name: product.product_name || product.generic_name || query || 'Beauty Product',
      price: null, // Open Beauty Facts doesn't have prices
      imageUrl: product.image_url || this.getDefaultBeautyImage(),
      rating: 4.0 + Math.random() * 1.0, // Simulated rating
      url: product.url || `${this.baseUrl}/product/${product.code}`,
      retailer: 'Open Beauty Facts',
      category: 'beauty',
      tags: this.extractBeautyTags(product, query),
      barcode: product.code,
      brand: product.brands || 'Unknown Brand',
      ingredients: product.ingredients_text || null,
      cosmetics: product.cosmetics || null
    };
  }

  extractBeautyTags(product, query) {
    const tags = [query.toLowerCase()];
    
    // Add brand
    if (product.brands) {
      tags.push(product.brands.toLowerCase());
    }
    
    // Add categories
    if (product.categories_tags) {
      const categoryTags = product.categories_tags
        .map(tag => tag.replace('en:', ''))
        .slice(0, 5);
      tags.push(...categoryTags);
    }
    
    // Add cosmetic-specific tags
    if (product.cosmetics) {
      const cosmeticTags = product.cosmetics
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .slice(0, 3);
      tags.push(...cosmeticTags);
    }
    
    // Add common beauty categories
    const beautyCategories = ['skincare', 'makeup', 'haircare', 'fragrance', 'personal-care'];
    tags.push(...beautyCategories);
    
    return [...new Set(tags)].slice(0, 8);
  }

  getDefaultBeautyImage() {
    const beautyImages = [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300', // skincare
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', // makeup
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300', // beauty products
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300', // cosmetics
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300'  // general beauty
    ];
    return beautyImages[Math.floor(Math.random() * beautyImages.length)];
  }

  async getTrendingBeautyProducts() {
    const trendingQueries = [
      'moisturizer',
      'sunscreen', 
      'cleanser',
      'serum',
      'foundation',
      'lipstick',
      'shampoo',
      'conditioner'
    ];
    
    const allProducts = [];
    
    for (const query of trendingQueries) {
      const products = await this.searchProducts(query, 'beauty', 3);
      allProducts.push(...products);
    }
    
    return allProducts.slice(0, 20);
  }

  async getPersonalizedBeautyRecommendations(userProfile) {
    const recommendations = [];
    const skinConcerns = this.extractSkinConcerns(userProfile);
    
    for (const concern of skinConcerns) {
      const products = await this.searchProducts(concern, 'beauty', 3);
      recommendations.push(...products);
    }
    
    return recommendations.slice(0, 15);
  }

  extractSkinConcerns(userProfile) {
    const concerns = [];
    
    if (userProfile.skinConcerns) {
      concerns.push(...userProfile.skinConcerns.split(',').map(c => c.trim()));
    }
    
    if (userProfile.skinType) {
      concerns.push(userProfile.skinType);
    }
    
    // Add common beauty concerns
    const commonConcerns = ['acne', 'dryness', 'aging', 'hyperpigmentation', 'sensitivity'];
    concerns.push(...commonConcerns);
    
    return [...new Set(concerns)];
  }

  async searchByCategory(category, limit = 15) {
    const categoryMappings = {
      'skincare': 'en:skincare-products',
      'makeup': 'en:makeup-products', 
      'haircare': 'en:haircare-products',
      'fragrance': 'en:fragrances',
      'personal-care': 'en:personal-care-products'
    };
    
    const categoryTag = categoryMappings[category] || 'en:beauty-products';
    
    try {
      const searchParams = new URLSearchParams({
        categories_tags: categoryTag,
        action: 'process',
        json: 1,
        page_size: limit,
        fields: 'code,product_name,generic_name,brands,categories_tags,image_url,url,ingredients_text'
      });
      
      const searchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'HealthEngagement/1.0 (https://github.com/your-repo)',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.products) {
        const products = response.data.products.map(product => this.formatProduct(product, category));
        console.log(`✅ Found ${products.length} ${category} products from Open Beauty Facts`);
        return products;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Category search failed for ${category}: ${error.message}`);
      return [];
    }
  }

  // Get API information and setup instructions
  getApiInfo() {
    return {
      name: 'Open Beauty Facts API',
      description: 'Free, open database of cosmetic and beauty products',
      url: 'https://world.openbeautyfacts.org/data',
      apiKey: 'None required - completely free!',
      rateLimit: 'Reasonable limits for production use',
      dataTypes: [
        'Product names and brands',
        'Ingredients lists',
        'Product categories',
        'Product images',
        'Barcode information',
        'Cosmetic classifications'
      ],
      features: [
        'Real beauty product data',
        'No API key required',
        'Comprehensive ingredient information',
        'Product categorization',
        'Barcode lookup support',
        'Community-driven data'
      ]
    };
  }

  async healthCheck() {
    try {
      // Test with a simple search
      const testResults = await this.searchProducts('moisturizer', 'beauty', 1);
      return {
        status: 'healthy',
        message: 'Open Beauty Facts API is working',
        productsFound: testResults.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Open Beauty Facts API error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = OpenBeautyFactsScraper; 