const HybridScraperManager = require('./hybrid-scraper-manager');

class ScraperManager {
  constructor() {
    this.hybridManager = new HybridScraperManager();
  }

  async closeAllBrowsers() {
    await this.hybridManager.closeAllBrowsers();
  }

  async searchHealthProducts(condition, limit = 20) {
    console.log(`Searching health products for condition: ${condition}`);
    return await this.hybridManager.searchAllRetailers(condition, 'wellness', limit);
  }

  async getPersonalizedHealthRecommendations(userProfile) {
    return await this.hybridManager.getPersonalizedRecommendations(userProfile);
  }

  async searchAllRetailers(query, category = 'wellness', limit = 10) {
    return await this.hybridManager.searchAllRetailers(query, category, limit);
  }

  async getTrendingProducts() {
    return await this.hybridManager.getTrendingProducts();
  }

  async getPersonalizedRecommendations(userProfile) {
    return await this.hybridManager.getPersonalizedRecommendations(userProfile);
  }

  async getProductDetails(productUrl, retailer) {
    // This would need to be implemented based on the specific retailer
    console.log(`Getting product details for ${productUrl} from ${retailer}`);
    return null;
  }

  async getDealsAndPromotions() {
    // For now, return empty deals since the original scrapers aren't working
    return {
      walmart: [],
      sephora: [],
      ulta: [],
      all: []
    };
  }

  async healthCheck() {
    return await this.hybridManager.healthCheck();
  }

  getScraperStats() {
    return this.hybridManager.getScraperStats();
  }
}

module.exports = ScraperManager; 