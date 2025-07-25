const puppeteer = require('puppeteer');

class WalmartScraper {
  constructor() {
    this.baseUrl = 'https://www.walmart.com';
    this.searchUrl = 'https://www.walmart.com/search';
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
          '--disable-features=VizDisplayCompositor'
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
        'Referer': 'https://www.walmart.com/'
      });

      // Construct search URL
      const searchParams = new URLSearchParams({
        q: query,
        cat_id: this.getCategoryId(category)
      });
      
      const fullSearchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      console.log(`Searching Walmart for: ${query}`);
      await page.goto(fullSearchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for product grid to load - try multiple selectors
      const selectors = [
        '[data-item-id]',
        '.product-card',
        '[data-testid="product-card"]',
        '.css-1w0iwyp',
        '.product-tile',
        '[data-product-id]'
      ];
      
      let foundSelector = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          foundSelector = true;
          console.log(`Found products with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!foundSelector) {
        console.log('No product grid found, trying to wait for any content...');
        await page.waitForTimeout(5000);
      }
      
      // Additional wait for dynamic content
      await page.waitForTimeout(3000);
      
      // Extract products
      const products = await page.evaluate((baseUrl, limit) => {
        const productElements = document.querySelectorAll('[data-item-id], .product-card, [data-testid="product-card"], .css-1w0iwyp, .product-tile, [data-product-id]');
        const products = [];
        
        for (let i = 0; i < Math.min(productElements.length, limit); i++) {
          const element = productElements[i];
          
          // Try multiple selectors for product name
          let name = '';
          const nameSelectors = [
            '[data-testid="product-title"]',
            '.product-title',
            'h3',
            '.product-name',
            '[data-testid="product-name"]',
            '.css-1w0iwyp',
            'span[data-testid="product-title"]'
          ];
          
          for (const selector of nameSelectors) {
            const nameEl = element.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              break;
            }
          }
          
          // Try multiple selectors for price
          let price = '';
          const priceSelectors = [
            '[data-testid="price-wrap"]',
            '.product-price',
            '.price',
            '[data-testid="price"]',
            '.css-1w0iwyp',
            'span[data-testid="price-wrap"]'
          ];
          
          for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl && priceEl.textContent.trim()) {
              price = priceEl.textContent.trim();
              break;
            }
          }
          
          // Try multiple selectors for image
          let image = '';
          const imageSelectors = [
            'img[src*="walmart"]',
            '.product-image img',
            'img[data-testid="product-image"]',
            'img[alt*="product"]',
            'img'
          ];
          
          for (const selector of imageSelectors) {
            const imgEl = element.querySelector(selector);
            if (imgEl && imgEl.src) {
              image = imgEl.src;
              // Ensure we get the full resolution image
              if (image.includes('walmart') && !image.includes('original')) {
                image = image.replace(/\.jpg.*$/, '.jpg');
                image = image.replace(/\.png.*$/, '.png');
              }
              break;
            }
          }
          
          // Try multiple selectors for rating
          let rating = '';
          const ratingSelectors = [
            '[data-testid="rating"]',
            '.product-rating',
            '.rating',
            '.css-1w0iwyp'
          ];
          
          for (const selector of ratingSelectors) {
            const ratingEl = element.querySelector(selector);
            if (ratingEl && ratingEl.textContent.trim()) {
              rating = ratingEl.textContent.trim();
              break;
            }
          }
          
          // Try multiple selectors for brand
          let brand = '';
          const brandSelectors = [
            '[data-testid="product-brand"]',
            '.product-brand',
            '.brand-name',
            '.css-1w0iwyp'
          ];
          
          for (const selector of brandSelectors) {
            const brandEl = element.querySelector(selector);
            if (brandEl && brandEl.textContent.trim()) {
              brand = brandEl.textContent.trim();
              break;
            }
          }
          
          // Get product URL
          let url = '';
          const linkEl = element.querySelector('a[href*="/ip/"], a[href*="/product/"]');
          if (linkEl && linkEl.href) {
            url = linkEl.href;
            if (!url.startsWith('http')) {
              url = baseUrl + url;
            }
          }
          
          // Get product ID
          const id = element.getAttribute('data-item-id') || 
                    element.getAttribute('data-product-id') || 
                    element.getAttribute('data-testid') || 
                    `walmart-${Date.now()}-${i}`;
          
          if (name && price) {
            // Generate tags based on product name and query
            const tags = generateTagsFromProduct(name, query);
            const conditionTags = [query.charAt(0).toUpperCase() + query.slice(1)];
            const category = detectCategory(name, query);
            
            products.push({
              id,
              name,
              price,
              image,
              url,
              rating,
              brand,
              retailer: 'Walmart',
              category,
              tags,
              conditionTags
            });
          }
        }
        
        return products;
      }, this.baseUrl, limit);
      
      console.log(`Found ${products.length} products on Walmart`);
      return products;
      
    } catch (error) {
      console.error('Walmart scraper error:', error.message);
      return [];
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async getProductDetails(productUrl) {
    let browser = null;
    let page = null;
    
    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log(`Fetching product details from: ${productUrl}`);
      await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for product content to load
      await page.waitForSelector('[data-testid="product-title"], h1, .product-title', { timeout: 10000 });
      await page.waitForTimeout(3000);
      
      const productDetails = await page.evaluate(() => {
        // Product name
        let name = '';
        const nameSelectors = [
          '[data-testid="product-title"]',
          '.product-title',
          'h1',
          '[data-testid="product-name"]'
        ];
        
        for (const selector of nameSelectors) {
          const nameEl = document.querySelector(selector);
          if (nameEl && nameEl.textContent.trim()) {
            name = nameEl.textContent.trim();
            break;
          }
        }
        
        // Price
        let price = '';
        const priceSelectors = [
          '[data-testid="price-wrap"]',
          '.product-price',
          '.price',
          '[data-testid="price"]'
        ];
        
        for (const selector of priceSelectors) {
          const priceEl = document.querySelector(selector);
          if (priceEl && priceEl.textContent.trim()) {
            price = priceEl.textContent.trim();
            break;
          }
        }
        
        // Description
        let description = '';
        const descSelectors = [
          '[data-testid="product-description"]',
          '.product-description',
          '.description',
          '[data-testid="description"]'
        ];
        
        for (const selector of descSelectors) {
          const descEl = document.querySelector(selector);
          if (descEl && descEl.textContent.trim()) {
            description = descEl.textContent.trim();
            break;
          }
        }
        
        // Images
        const images = [];
        const imageSelectors = [
          '.product-image img',
          '[data-testid="product-image"] img',
          '.gallery-image img',
          'img[src*="walmart"]'
        ];
        
        for (const selector of imageSelectors) {
          const imgElements = document.querySelectorAll(selector);
          imgElements.forEach(img => {
            if (img.src && !images.includes(img.src)) {
              let imgSrc = img.src;
              // Ensure we get the full resolution image
              if (imgSrc.includes('walmart') && !imgSrc.includes('original')) {
                imgSrc = imgSrc.replace(/\.jpg.*$/, '.jpg');
                imgSrc = imgSrc.replace(/\.png.*$/, '.png');
              }
              images.push(imgSrc);
            }
          });
        }
        
        // Rating
        let rating = '';
        const ratingSelectors = [
          '[data-testid="rating"]',
          '.product-rating',
          '.rating'
        ];
        
        for (const selector of ratingSelectors) {
          const ratingEl = document.querySelector(selector);
          if (ratingEl && ratingEl.textContent.trim()) {
            rating = ratingEl.textContent.trim();
            break;
          }
        }
        
        // Reviews count
        let reviews = '';
        const reviewsSelectors = [
          '[data-testid="review-count"]',
          '.review-count',
          '.reviews'
        ];
        
        for (const selector of reviewsSelectors) {
          const reviewsEl = document.querySelector(selector);
          if (reviewsEl && reviewsEl.textContent.trim()) {
            reviews = reviewsEl.textContent.trim();
            break;
          }
        }
        
        // Brand
        let brand = '';
        const brandSelectors = [
          '[data-testid="product-brand"]',
          '.product-brand',
          '.brand-name'
        ];
        
        for (const selector of brandSelectors) {
          const brandEl = document.querySelector(selector);
          if (brandEl && brandEl.textContent.trim()) {
            brand = brandEl.textContent.trim();
            break;
          }
        }
        
        return {
          name,
          price,
          description,
          images,
          rating,
          reviews,
          brand,
          url: window.location.href
        };
      });
      
      return productDetails;
      
    } catch (error) {
      console.error('Error fetching product details:', error.message);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  getCategoryId(category) {
    const categories = {
      'wellness': '0',
      'vitamins': '976759',
      'supplements': '976760',
      'personal-care': '1085666',
      'beauty': '1085666',
      'health': '976759'
    };
    return categories[category] || categories['wellness'];
  }

  async getTrendingProducts() {
    const trendingQueries = [
      'vitamin d',
      'omega 3',
      'probiotics',
      'collagen',
      'biotin',
      'magnesium',
      'zinc',
      'vitamin b12'
    ];

    const allProducts = [];
    for (const query of trendingQueries.slice(0, 5)) {
      const products = await this.searchProducts(query, 'wellness', 4);
      allProducts.push(...products);
    }

    return allProducts.slice(0, 20);
  }

  async getWalmartPlusRecommendations(userProfile) {
    // Mock function for Walmart Plus member recommendations
    const recommendations = [];
    
    if (userProfile.walmartPlusMember) {
      const premiumProducts = await this.searchProducts('premium wellness', 'wellness', 5);
      recommendations.push(...premiumProducts);
    }
    
    if (userProfile.purchaseHistory?.includes('vitamins')) {
      const vitaminProducts = await this.searchProducts('vitamin supplements', 'vitamins', 5);
      recommendations.push(...vitaminProducts);
    }
    
    if (userProfile.healthConditions?.includes('diabetes')) {
      const diabetesProducts = await this.searchProducts('diabetes management', 'health', 5);
      recommendations.push(...diabetesProducts);
    }

    return recommendations.slice(0, 15);
  }

  async getRollbackDeals() {
    let browser = null;
    let page = null;
    
    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log('Fetching Walmart rollback deals');
      await page.goto(`${this.baseUrl}/deals/rollback`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for deals content to load
      await page.waitForSelector('[data-item-id], .product-card', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const deals = await page.evaluate(() => {
        const dealElements = document.querySelectorAll('[data-item-id], .product-card');
        const deals = [];
        
        dealElements.forEach(element => {
          const deal = {
            title: element.querySelector('[data-testid="product-title"]')?.textContent.trim() || '',
            price: element.querySelector('[data-testid="price-wrap"]')?.textContent.trim() || '',
            originalPrice: element.querySelector('.original-price')?.textContent.trim() || '',
            discount: element.querySelector('.discount-badge')?.textContent.trim() || '',
            category: element.querySelector('.product-category')?.textContent.trim() || ''
          };
          
          if (deal.title && deal.price) {
            deals.push(deal);
          }
        });
        
        return deals;
      });
      
      return deals;
      
    } catch (error) {
      console.error('Error fetching rollback deals:', error.message);
      return [];
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}

// Helper function to generate tags from product name and query
function generateTagsFromProduct(productName, query) {
  const name = productName.toLowerCase();
  const queryLower = query.toLowerCase();
  const tags = [queryLower, 'wellness', 'health'];
  
  // Add tags based on product name keywords
  if (name.includes('vitamin') || name.includes('supplement')) tags.push('vitamins', 'supplements', 'nutrition');
  if (name.includes('protein') || name.includes('amino')) tags.push('protein', 'fitness', 'nutrition');
  if (name.includes('omega') || name.includes('fish oil')) tags.push('omega', 'fish oil', 'nutrition');
  if (name.includes('probiotic') || name.includes('digestive')) tags.push('probiotic', 'digestive', 'gut health');
  if (name.includes('collagen') || name.includes('beauty')) tags.push('collagen', 'beauty', 'skincare');
  if (name.includes('melatonin') || name.includes('sleep')) tags.push('melatonin', 'sleep', 'relaxation');
  if (name.includes('cbd') || name.includes('hemp')) tags.push('cbd', 'hemp', 'relaxation');
  if (name.includes('tea') || name.includes('herbal')) tags.push('tea', 'herbal', 'natural');
  if (name.includes('essential oil') || name.includes('aromatherapy')) tags.push('essential oils', 'aromatherapy', 'natural');
  if (name.includes('bandage') || name.includes('band-aid')) tags.push('first aid', 'bandages', 'wound care');
  if (name.includes('pain') || name.includes('ache')) tags.push('pain relief', 'analgesic');
  if (name.includes('allergy') || name.includes('antihistamine')) tags.push('allergy', 'antihistamine');
  if (name.includes('cold') || name.includes('flu')) tags.push('cold', 'flu', 'immune support');
  if (name.includes('immune') || name.includes('defense')) tags.push('immune support', 'defense');
  if (name.includes('natural') || name.includes('organic')) tags.push('natural', 'organic');
  if (name.includes('gluten') || name.includes('dairy')) tags.push('dietary', 'restrictions');
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

// Helper function to detect category from product name and query
function detectCategory(productName, query) {
  const name = productName.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Category detection logic
  if (name.includes('vitamin') || name.includes('supplement') || name.includes('mineral')) {
    return 'Supplements';
  }
  
  if (name.includes('protein') || name.includes('amino') || name.includes('fitness')) {
    return 'Fitness';
  }
  
  if (name.includes('tea') || name.includes('herbal') || name.includes('natural')) {
    return 'Natural Remedies';
  }
  
  if (name.includes('bandage') || name.includes('band-aid') || name.includes('first aid')) {
    return 'First Aid';
  }
  
  if (name.includes('pain') || name.includes('ache') || name.includes('relief')) {
    return 'Pain Relief';
  }
  
  if (name.includes('allergy') || name.includes('antihistamine')) {
    return 'Allergy';
  }
  
  if (name.includes('cold') || name.includes('flu') || name.includes('immune')) {
    return 'Cold & Flu';
  }
  
  if (name.includes('collagen') || name.includes('beauty') || name.includes('skincare')) {
    return 'Beauty & Skincare';
  }
  
  // Default to Wellness for most health products
  return 'Wellness';
}

module.exports = WalmartScraper; 