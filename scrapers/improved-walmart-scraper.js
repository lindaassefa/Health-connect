const ImprovedScraperBase = require('./improved-scraper-base');

class ImprovedWalmartScraper extends ImprovedScraperBase {
  constructor() {
    super();
    this.baseUrl = 'https://www.walmart.com';
    this.searchUrl = 'https://www.walmart.com/search';
  }

  async searchProducts(query, category = 'wellness', limit = 20) {
    let browser = null;
    let page = null;
    
    try {
      browser = await this.initBrowser();
      page = await this.createStealthPage(browser);
      
      // Construct search URL with better parameters
      const searchParams = new URLSearchParams({
        q: query,
        cat_id: this.getCategoryId(category),
        sort: 'best_seller',
        page: 1
      });
      
      const fullSearchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      console.log(`Searching Walmart for: ${query}`);
      await this.navigateWithRetry(page, fullSearchUrl);
      
      // Updated selectors for Walmart
      const selectors = [
        '[data-item-id]',
        '[data-testid="product-card"]',
        '.product-card',
        '.css-1w0iwyp',
        '.product-tile',
        '[data-product-id]',
        '.search-result-gridview-item',
        '.product-card-container',
        '[data-testid="search-result-item"]',
        '.css-1w0iwyp'
      ];

      const extractFunction = (selector) => {
        const products = [];
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
          if (index >= 20) return; // Limit to 20 products
          
          try {
            // Try multiple ways to extract product info
            const nameElement = element.querySelector('[data-testid="product-title"]') ||
                              element.querySelector('.product-title') ||
                              element.querySelector('h3') ||
                              element.querySelector('h2') ||
                              element.querySelector('.css-1w0iwyp');
            
            const priceElement = element.querySelector('[data-testid="price-wrap"]') ||
                               element.querySelector('.price-main') ||
                               element.querySelector('.price-characteristic') ||
                               element.querySelector('.css-1w0iwyp');
            
            const imageElement = element.querySelector('img');
            const ratingElement = element.querySelector('[data-testid="rating"]') ||
                                element.querySelector('.stars') ||
                                element.querySelector('.css-1w0iwyp');
            
            const linkElement = element.querySelector('a') || element.closest('a');
            
            if (nameElement) {
              const product = {
                name: nameElement.textContent?.trim() || 'Unknown Product',
                price: priceElement ? this.extractPrice(priceElement.textContent) : null,
                imageUrl: imageElement?.src || imageElement?.getAttribute('data-src') || null,
                rating: ratingElement ? this.extractRating(ratingElement.textContent) : null,
                url: linkElement ? this.makeAbsoluteUrl(linkElement.href) : null,
                retailer: 'Walmart',
                category: category,
                tags: this.generateTags(nameElement.textContent, query)
              };
              
              if (product.name !== 'Unknown Product') {
                products.push(product);
              }
            }
          } catch (e) {
            console.log('Error extracting product:', e);
          }
        });
        
        return products;
      };

      const products = await this.extractProductsWithRetry(page, selectors, extractFunction);
      
      console.log(`Found ${products.length} products on Walmart`);
      return products.slice(0, limit);
      
    } catch (error) {
      console.error('Walmart scraper error:', error.message);
      return [];
    } finally {
      if (page) await page.close();
      if (browser) await this.closeBrowser();
    }
  }

  extractPrice(priceText) {
    if (!priceText) return null;
    const match = priceText.match(/[\$]?[\d,]+\.?\d*/);
    return match ? match[0] : null;
  }

  extractRating(ratingText) {
    if (!ratingText) return null;
    const match = ratingText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }

  makeAbsoluteUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  generateTags(productName, query) {
    const tags = [query.toLowerCase()];
    const words = productName.toLowerCase().split(/\s+/);
    tags.push(...words.filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word)));
    return [...new Set(tags)].slice(0, 5);
  }

  getCategoryId(category) {
    const categories = {
      'wellness': '0',
      'vitamins': '976760',
      'supplements': '976760',
      'skincare': '1085666',
      'beauty': '1085666',
      'health': '976760'
    };
    return categories[category.toLowerCase()] || '0';
  }

  async getTrendingProducts() {
    const trendingQueries = ['vitamin d', 'omega 3', 'probiotics', 'collagen', 'biotin'];
    const allProducts = [];
    
    for (const query of trendingQueries) {
      try {
        const products = await this.searchProducts(query, 'wellness', 5);
        allProducts.push(...products);
        await this.randomDelay(2000, 4000); // Be respectful with delays
      } catch (error) {
        console.log(`Error getting trending products for ${query}:`, error.message);
      }
    }
    
    return allProducts.slice(0, 20);
  }
}

module.exports = ImprovedWalmartScraper; 