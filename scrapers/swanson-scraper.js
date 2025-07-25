const puppeteer = require('puppeteer');

class SwansonScraper {
  constructor() {
    this.baseUrl = 'https://www.swansonvitamins.com';
    this.searchUrl = 'https://www.swansonvitamins.com/search';
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async searchProducts(query, category = 'wellness', limit = 20) {
    let browser = null;
    let page = null;
    
    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.swansonvitamins.com/'
      });

      // Construct search URL
      const searchParams = new URLSearchParams({
        q: query
      });
      
      const fullSearchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      console.log(`Searching Swanson for: ${query}`);
      await page.goto(fullSearchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for product grid to load
      const selectors = [
        '.product-grid',
        '.product-list',
        '.product-item',
        '.product-card',
        '[data-testid="product-grid"]',
        '.search-results'
      ];
      
      let foundSelector = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 8000 });
          foundSelector = true;
          console.log(`Found products with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!foundSelector) {
        console.log('No product grid found, trying to wait for any content...');
        await page.waitForTimeout(3000);
      }
      
      // Extract products
      const products = await page.evaluate((selector) => {
        const productElements = document.querySelectorAll(selector || '.product-item, .product-card, [data-testid="product-item"]');
        const products = [];
        
        productElements.forEach((element, index) => {
          if (index >= 20) return; // Limit to 20 products
          
          try {
            // Try multiple selectors for product info
            const nameElement = element.querySelector('.product-name') ||
                              element.querySelector('.product-title') ||
                              element.querySelector('h3') ||
                              element.querySelector('h2') ||
                              element.querySelector('[data-testid="product-name"]');
            
            const priceElement = element.querySelector('.product-price') ||
                               element.querySelector('.price') ||
                               element.querySelector('[data-testid="product-price"]');
            
            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a') || element.closest('a');
            
            if (nameElement) {
              const product = {
                name: nameElement.textContent?.trim() || 'Unknown Product',
                price: priceElement ? priceElement.textContent?.trim() : null,
                imageUrl: imageElement?.src || imageElement?.getAttribute('data-src') || null,
                rating: null, // Swanson might not show ratings on search page
                url: linkElement ? this.makeAbsoluteUrl(linkElement.href) : null,
                retailer: 'Swanson Vitamins',
                category: 'wellness',
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
      }, foundSelector);
      
      console.log(`Found ${products.length} products on Swanson`);
      return products.slice(0, limit);
      
    } catch (error) {
      console.error('Swanson scraper error:', error.message);
      return [];
    } finally {
      if (page) await page.close();
    }
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

  async getTrendingProducts() {
    const trendingQueries = ['vitamin d', 'omega 3', 'probiotics', 'collagen', 'biotin'];
    const allProducts = [];
    
    for (const query of trendingQueries) {
      try {
        const products = await this.searchProducts(query, 'wellness', 4);
        allProducts.push(...products);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Be respectful
      } catch (error) {
        console.log(`Error getting trending products for ${query}:`, error.message);
      }
    }
    
    return allProducts.slice(0, 20);
  }
}

module.exports = SwansonScraper; 