const ApiBasedScraper = require('./api-based-scraper');
const VitacostScraper = require('./vitacost-scraper');
const SwansonScraper = require('./swanson-scraper');
const HealthlineScraper = require('./healthline-scraper');
const WorldBeautyScraper = require('./world-beauty-scraper');
const OpenBeautyFactsScraper = require('./open-beauty-facts-scraper');

class UpdatedHybridScraperManager {
  constructor() {
    this.apiScraper = new ApiBasedScraper();
    this.vitacostScraper = new VitacostScraper();
    this.swansonScraper = new SwansonScraper();
    this.healthlineScraper = new HealthlineScraper();
    this.worldBeautyScraper = new WorldBeautyScraper();
    this.openBeautyFactsScraper = new OpenBeautyFactsScraper();
  }

  async searchAllRetailers(query, category = 'wellness', limit = 10) {
    console.log(`🔍 Updated search for "${query}" across reliable sources...`);
    
    const results = {
      api: [],
      vitacost: [],
      swanson: [],
      healthline: [],
      worldbeauty: [],
      openbeautyfacts: [],
      all: []
    };

    try {
      // Start with API-based data (fast and reliable)
      console.log('📡 Getting API-based results...');
      const apiResults = await this.apiScraper.searchProducts(query, category, Math.floor(limit * 0.4));
      results.api = apiResults;
      results.all.push(...apiResults);
      console.log(`✅ Found ${apiResults.length} products from API`);

      // Try Vitacost (more scraper-friendly)
      try {
        console.log('💊 Trying Vitacost scraper...');
        const vitacostResults = await this.vitacostScraper.searchProducts(query, category, Math.floor(limit * 0.3));
        results.vitacost = vitacostResults;
        results.all.push(...vitacostResults);
        console.log(`✅ Found ${vitacostResults.length} products from Vitacost`);
      } catch (error) {
        console.log(`⚠️ Vitacost failed: ${error.message}`);
      }

      // Try Swanson (another supplement retailer)
      try {
        console.log('🌿 Trying Swanson scraper...');
        const swansonResults = await this.swansonScraper.searchProducts(query, category, Math.floor(limit * 0.2));
        results.swanson = swansonResults;
        results.all.push(...swansonResults);
        console.log(`✅ Found ${swansonResults.length} products from Swanson`);
      } catch (error) {
        console.log(`⚠️ Swanson failed: ${error.message}`);
      }

      // Try Healthline (health content)
      try {
        console.log('🏥 Trying Healthline scraper...');
        const healthlineResults = await this.healthlineScraper.searchConditionProducts(query);
        results.healthline = healthlineResults;
        results.all.push(...healthlineResults);
        console.log(`✅ Found ${healthlineResults.length} products from Healthline`);
      } catch (error) {
        console.log(`⚠️ Healthline failed: ${error.message}`);
      }

      // Try World Beauty (beauty/wellness retailer)
      try {
        console.log('💄 Trying World Beauty scraper...');
        const worldBeautyResults = await this.worldBeautyScraper.searchProducts(query, category, Math.floor(limit * 0.1));
        results.worldbeauty = worldBeautyResults;
        results.all.push(...worldBeautyResults);
        console.log(`✅ Found ${worldBeautyResults.length} products from World Beauty`);
      } catch (error) {
        console.log(`⚠️ World Beauty failed: ${error.message}`);
      }

      // Try Open Beauty Facts (real beauty product data)
      try {
        console.log('💄 Trying Open Beauty Facts API...');
        const beautyFactsResults = await this.openBeautyFactsScraper.searchProducts(query, category, Math.floor(limit * 0.2));
        results.openbeautyfacts = beautyFactsResults;
        results.all.push(...beautyFactsResults);
        console.log(`✅ Found ${beautyFactsResults.length} products from Open Beauty Facts`);
      } catch (error) {
        console.log(`⚠️ Open Beauty Facts failed: ${error.message}`);
      }

      // Remove duplicates and sort by relevance
      results.all = this.removeDuplicates(results.all);
      results.all = this.sortByRelevance(results.all, query);
      results.all = results.all.slice(0, limit);

      console.log(`🎉 Total unique products found: ${results.all.length}`);
      return results;

    } catch (error) {
      console.error('❌ Error in updated search:', error.message);
      // Fallback to API-only
      const fallbackResults = await this.apiScraper.searchProducts(query, category, limit);
      return {
        api: fallbackResults,
        vitacost: [],
        swanson: [],
        healthline: [],
        worldbeauty: [],
        openbeautyfacts: [],
        all: fallbackResults
      };
    }
  }

  async getTrendingProducts() {
    console.log('🔥 Getting trending products from reliable sources...');
    
    const results = {
      api: [],
      vitacost: [],
      swanson: [],
      healthline: [],
      worldbeauty: [],
      openbeautyfacts: [],
      all: []
    };

    try {
      // Get trending from API
      const apiTrending = await this.apiScraper.getTrendingProducts();
      results.api = apiTrending;
      results.all.push(...apiTrending);

      // Try Vitacost trending
      try {
        const vitacostTrending = await this.vitacostScraper.getTrendingProducts();
        results.vitacost = vitacostTrending;
        results.all.push(...vitacostTrending);
      } catch (error) {
        console.log(`⚠️ Vitacost trending failed: ${error.message}`);
      }

      // Try Swanson trending
      try {
        const swansonTrending = await this.swansonScraper.getTrendingProducts();
        results.swanson = swansonTrending;
        results.all.push(...swansonTrending);
      } catch (error) {
        console.log(`⚠️ Swanson trending failed: ${error.message}`);
      }

      // Try World Beauty trending
      try {
        const worldBeautyTrending = await this.worldBeautyScraper.getTrendingProducts();
        results.worldbeauty = worldBeautyTrending;
        results.all.push(...worldBeautyTrending);
      } catch (error) {
        console.log(`⚠️ World Beauty trending failed: ${error.message}`);
      }

      // Try Open Beauty Facts trending
      try {
        const beautyFactsTrending = await this.openBeautyFactsScraper.getTrendingBeautyProducts();
        results.openbeautyfacts = beautyFactsTrending;
        results.all.push(...beautyFactsTrending);
      } catch (error) {
        console.log(`⚠️ Open Beauty Facts trending failed: ${error.message}`);
      }

      // Remove duplicates and limit
      results.all = this.removeDuplicates(results.all);
      results.all = results.all.slice(0, 20);

      return results;
    } catch (error) {
      console.error('❌ Error getting trending products:', error.message);
      return {
        api: await this.apiScraper.getTrendingProducts(),
        vitacost: [],
        swanson: [],
        healthline: [],
        worldbeauty: [],
        openbeautyfacts: [],
        all: await this.apiScraper.getTrendingProducts()
      };
    }
  }

  async getPersonalizedRecommendations(userProfile) {
    console.log('👤 Getting personalized recommendations from reliable sources...');
    
    try {
      // Use API-based recommendations as primary
      const apiRecommendations = await this.apiScraper.getPersonalizedRecommendations(userProfile);
      
      // Try to get additional recommendations from Vitacost
      let additionalRecommendations = [];
      try {
        const conditions = this.extractConditionsFromProfile(userProfile);
        for (const condition of conditions.slice(0, 2)) { // Limit to avoid too many requests
          const products = await this.vitacostScraper.searchProducts(condition, 'wellness', 3);
          additionalRecommendations.push(...products);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Be respectful
        }
      } catch (error) {
        console.log(`⚠️ Vitacost recommendations failed: ${error.message}`);
      }

      // Try Swanson recommendations
      try {
        const conditions = this.extractConditionsFromProfile(userProfile);
        for (const condition of conditions.slice(0, 2)) {
          const products = await this.swansonScraper.searchProducts(condition, 'wellness', 3);
          additionalRecommendations.push(...products);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Be respectful
        }
      } catch (error) {
        console.log(`⚠️ Swanson recommendations failed: ${error.message}`);
      }

      // Try World Beauty recommendations
      try {
        const beautyRecommendations = await this.worldBeautyScraper.getBeautyRecommendations(userProfile);
        additionalRecommendations.push(...beautyRecommendations);
      } catch (error) {
        console.log(`⚠️ World Beauty recommendations failed: ${error.message}`);
      }

      // Combine and deduplicate
      const allRecommendations = [...apiRecommendations, ...additionalRecommendations];
      const uniqueRecommendations = this.removeDuplicates(allRecommendations);
      
      return uniqueRecommendations.slice(0, 15);
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error.message);
      return await this.apiScraper.getPersonalizedRecommendations(userProfile);
    }
  }

  async healthCheck() {
    console.log('🏥 Running health check on reliable sources...');
    
    const health = {
      api: true, // API-based scraper should always work
      vitacost: false,
      swanson: false,
      healthline: false,
      worldbeauty: false
    };

    try {
      // Test Vitacost
      const vitacostTest = await this.vitacostScraper.searchProducts('vitamin c', 'wellness', 1);
      health.vitacost = vitacostTest.length > 0;
    } catch (error) {
      console.log(`Vitacost health check failed: ${error.message}`);
    }

    try {
      // Test Swanson
      const swansonTest = await this.swansonScraper.searchProducts('vitamin c', 'wellness', 1);
      health.swanson = swansonTest.length > 0;
    } catch (error) {
      console.log(`Swanson health check failed: ${error.message}`);
    }

    try {
      // Test Healthline
      const healthlineTest = await this.healthlineScraper.searchConditionProducts('vitamin c');
      health.healthline = healthlineTest.length > 0;
    } catch (error) {
      console.log(`Healthline health check failed: ${error.message}`);
    }

    try {
      // Test World Beauty
      const worldBeautyTest = await this.worldBeautyScraper.searchProducts('moisturizer', 'beauty', 1);
      health.worldbeauty = worldBeautyTest.length > 0;
    } catch (error) {
      console.log(`World Beauty health check failed: ${error.message}`);
    }

    return health;
  }

  async closeAllBrowsers() {
    try {
      await this.vitacostScraper.closeBrowser();
      await this.swansonScraper.closeBrowser();
      await this.worldBeautyScraper.closeBrowser();
      console.log('All browser instances closed');
    } catch (error) {
      console.error('Error closing browsers:', error);
    }
  }

  // Utility methods
  removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = `${product.name}-${product.retailer}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  sortByRelevance(products, query) {
    return products.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  calculateRelevanceScore(product, query) {
    let score = 0;
    
    // Name relevance
    const nameLower = product.name.toLowerCase();
    const queryLower = query.toLowerCase();
    if (nameLower.includes(queryLower)) score += 10;
    if (nameLower.startsWith(queryLower)) score += 5;
    
    // Price availability
    if (product.price) score += 3;
    
    // Rating
    if (product.rating) score += product.rating;
    
    // Image availability
    if (product.imageUrl) score += 2;
    
    return score;
  }

  extractConditionsFromProfile(userProfile) {
    const conditions = [];
    
    if (userProfile.chronicConditions) {
      conditions.push(...userProfile.chronicConditions.split(',').map(c => c.trim()));
    }
    
    if (userProfile.skinConcerns) {
      conditions.push(...userProfile.skinConcerns.split(',').map(c => c.trim()));
    }
    
    return conditions;
  }

  getScraperStats() {
    return {
      totalScrapers: 5,
      scrapers: ['api', 'vitacost', 'swanson', 'healthline', 'worldbeauty'],
      lastUpdated: new Date().toISOString(),
      primaryMethod: 'API-based with reliable web scraping',
      description: 'Uses Vitacost, Swanson, Healthline, and World Beauty instead of major retailers'
    };
  }
}

module.exports = UpdatedHybridScraperManager; 