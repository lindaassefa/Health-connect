const ApiBasedScraper = require('./api-based-scraper');
const iHerbScraper = require('./iherb-scraper');
const HealthlineScraper = require('./healthline-scraper');

class HybridScraperManager {
  constructor() {
    this.apiScraper = new ApiBasedScraper();
    this.iherbScraper = new iHerbScraper();
    this.healthlineScraper = new HealthlineScraper();
  }

  async searchAllRetailers(query, category = 'wellness', limit = 10) {
    console.log(`🔍 Searching for "${query}" across all sources...`);
    
    const results = {
      api: [],
      iherb: [],
      healthline: [],
      all: []
    };

    try {
      // Start with API-based data (fast and reliable)
      console.log('📡 Getting API-based results...');
      const apiResults = await this.apiScraper.searchProducts(query, category, Math.floor(limit * 0.6));
      results.api = apiResults;
      results.all.push(...apiResults);
      console.log(`✅ Found ${apiResults.length} products from API`);

      // Try iHerb (more likely to work than major retailers)
      try {
        console.log('🌿 Trying iHerb scraper...');
        const iherbResults = await this.iherbScraper.searchProducts(query, category, Math.floor(limit * 0.2));
        results.iherb = iherbResults;
        results.all.push(...iherbResults);
        console.log(`✅ Found ${iherbResults.length} products from iHerb`);
      } catch (error) {
        console.log(`⚠️ iHerb failed: ${error.message}`);
      }

      // Try Healthline (health content, less likely to block)
      try {
        console.log('🏥 Trying Healthline scraper...');
        const healthlineResults = await this.healthlineScraper.searchConditionProducts(query);
        results.healthline = healthlineResults;
        results.all.push(...healthlineResults);
        console.log(`✅ Found ${healthlineResults.length} products from Healthline`);
      } catch (error) {
        console.log(`⚠️ Healthline failed: ${error.message}`);
      }

      // Remove duplicates and sort by relevance
      results.all = this.removeDuplicates(results.all);
      results.all = this.sortByRelevance(results.all, query);
      results.all = results.all.slice(0, limit);

      console.log(`🎉 Total unique products found: ${results.all.length}`);
      return results;

    } catch (error) {
      console.error('❌ Error in hybrid search:', error.message);
      // Fallback to API-only
      const fallbackResults = await this.apiScraper.searchProducts(query, category, limit);
      return {
        api: fallbackResults,
        iherb: [],
        healthline: [],
        all: fallbackResults
      };
    }
  }

  async getTrendingProducts() {
    console.log('🔥 Getting trending products...');
    
    const results = {
      api: [],
      iherb: [],
      healthline: [],
      all: []
    };

    try {
      // Get trending from API
      const apiTrending = await this.apiScraper.getTrendingProducts();
      results.api = apiTrending;
      results.all.push(...apiTrending);

      // Try iHerb trending
      try {
        const iherbTrending = await this.iherbScraper.getTrendingProducts();
        results.iherb = iherbTrending;
        results.all.push(...iherbTrending);
      } catch (error) {
        console.log(`⚠️ iHerb trending failed: ${error.message}`);
      }

      // Remove duplicates and limit
      results.all = this.removeDuplicates(results.all);
      results.all = results.all.slice(0, 20);

      return results;
    } catch (error) {
      console.error('❌ Error getting trending products:', error.message);
      return {
        api: await this.apiScraper.getTrendingProducts(),
        iherb: [],
        healthline: [],
        all: await this.apiScraper.getTrendingProducts()
      };
    }
  }

  async getPersonalizedRecommendations(userProfile) {
    console.log('👤 Getting personalized recommendations...');
    
    try {
      // Use API-based recommendations as primary
      const apiRecommendations = await this.apiScraper.getPersonalizedRecommendations(userProfile);
      
      // Try to get additional recommendations from iHerb
      let additionalRecommendations = [];
      try {
        const conditions = this.extractConditionsFromProfile(userProfile);
        for (const condition of conditions.slice(0, 3)) { // Limit to avoid too many requests
          const products = await this.iherbScraper.getProductsByCondition(condition);
          additionalRecommendations.push(...products);
        }
      } catch (error) {
        console.log(`⚠️ iHerb recommendations failed: ${error.message}`);
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
    console.log('🏥 Running health check...');
    
    const health = {
      api: true, // API-based scraper should always work
      iherb: false,
      healthline: false
    };

    try {
      // Test iHerb
      const iherbTest = await this.iherbScraper.searchProducts('vitamin c', 'wellness', 1);
      health.iherb = iherbTest.length > 0;
    } catch (error) {
      console.log(`iHerb health check failed: ${error.message}`);
    }

    try {
      // Test Healthline
      const healthlineTest = await this.healthlineScraper.searchConditionProducts('vitamin c');
      health.healthline = healthlineTest.length > 0;
    } catch (error) {
      console.log(`Healthline health check failed: ${error.message}`);
    }

    return health;
  }

  async closeAllBrowsers() {
    try {
      await this.iherbScraper.closeBrowser();
      await this.healthlineScraper.closeBrowser();
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
      // Score based on name match, price availability, and rating
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
      totalScrapers: 3,
      scrapers: ['api', 'iherb', 'healthline'],
      lastUpdated: new Date().toISOString(),
      primaryMethod: 'API-based with web scraping fallback'
    };
  }
}

module.exports = HybridScraperManager; 