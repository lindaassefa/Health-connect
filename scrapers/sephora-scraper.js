const puppeteer = require('puppeteer');

class SephoraScraper {
  constructor() {
    this.baseUrl = 'https://www.sephora.com';
    this.searchUrl = 'https://www.sephora.com/search';
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

  async searchProducts(query, category = 'skincare', limit = 20) {
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
        'Referer': 'https://www.sephora.com/'
      });

      // Construct search URL
      const searchParams = new URLSearchParams({
        keyword: query,
        categoryCode: this.getCategoryCode(category),
        pageSize: limit,
        currentPage: 1
      });
      
      const fullSearchUrl = `${this.searchUrl}?${searchParams.toString()}`;
      
      console.log(`Searching Sephora for: ${query}`);
      await page.goto(fullSearchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for product grid to load - try multiple selectors
      const selectors = [
        '[data-comp="ProductCard"]',
        '.css-1w0iwyp',
        '[data-testid="product-card"]',
        '.product-card',
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
        const productElements = document.querySelectorAll('[data-comp="ProductCard"], .css-1w0iwyp, [data-testid="product-card"], .product-card, [data-product-id]');
        const products = [];
        
        for (let i = 0; i < Math.min(productElements.length, limit); i++) {
          const element = productElements[i];
          
          // Try multiple selectors for product name
          let name = '';
          const nameSelectors = [
            '[data-at="product_name"]',
            '.css-1w0iwyp',
            'h3',
            '.product-name',
            '[data-testid="product-name"]',
            '.product-title'
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
            '[data-at="price"]',
            '.css-1w0iwyp',
            '.price',
            '.product-price',
            '[data-testid="price"]'
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
            'img[src*="sephora"]',
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
              if (image.includes('sephora') && !image.includes('original')) {
                image = image.replace(/\.jpg.*$/, '.jpg');
                image = image.replace(/\.png.*$/, '.png');
              }
              break;
            }
          }
          
          // Try multiple selectors for rating
          let rating = '';
          const ratingSelectors = [
            '[data-at="rating"]',
            '.css-1w0iwyp',
            '.rating',
            '[data-testid="rating"]'
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
            '[data-at="brand_name"]',
            '.css-1w0iwyp',
            '.brand-name',
            '[data-testid="brand"]'
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
          const linkEl = element.querySelector('a[href*="/product/"], a[href*="/p/"]');
          if (linkEl && linkEl.href) {
            url = linkEl.href;
            if (!url.startsWith('http')) {
              url = baseUrl + url;
            }
          }
          
          // Get product ID
          const id = element.getAttribute('data-product-id') || 
                    element.getAttribute('data-testid') || 
                    `sephora-${Date.now()}-${i}`;
          
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
              retailer: 'Sephora',
              category,
              tags,
              conditionTags
            });
          }
        }
        
        return products;
      }, this.baseUrl, limit);
      
      console.log(`Found ${products.length} products on Sephora`);
      return products;
      
    } catch (error) {
      console.error('Sephora scraper error:', error.message);
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
      await page.waitForSelector('[data-at="product_name"], h1, .product-title', { timeout: 10000 });
      await page.waitForTimeout(3000);
      
      const productDetails = await page.evaluate(() => {
        // Product name
        let name = '';
        const nameSelectors = [
          '[data-at="product_name"]',
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
          '[data-at="price"]',
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
          '[data-at="product_description"]',
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
          '[data-at="product_image"] img',
          '.gallery-image img',
          'img[src*="sephora"]'
        ];
        
        for (const selector of imageSelectors) {
          const imgElements = document.querySelectorAll(selector);
          imgElements.forEach(img => {
            if (img.src && !images.includes(img.src)) {
              let imgSrc = img.src;
              // Ensure we get the full resolution image
              if (imgSrc.includes('sephora') && !imgSrc.includes('original')) {
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
          '[data-at="rating"]',
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
          '[data-at="review_count"]',
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
          '[data-at="brand_name"]',
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

  getCategoryCode(category) {
    const categories = {
      'skincare': 'CATEGORY_SKINCARE',
      'makeup': 'CATEGORY_MAKEUP',
      'hair': 'CATEGORY_HAIR',
      'fragrance': 'CATEGORY_FRAGRANCE',
      'tools': 'CATEGORY_TOOLS',
      'bath': 'CATEGORY_BATH',
      'wellness': 'CATEGORY_WELLNESS',
      'minis': 'CATEGORY_MINIS'
    };
    return categories[category] || categories['skincare'];
  }

  async getTrendingProducts() {
    const trendingQueries = [
      'vitamin c serum',
      'retinol',
      'hyaluronic acid',
      'niacinamide',
      'peptides',
      'ceramides',
      'sunscreen',
      'moisturizer'
    ];

    const allProducts = [];
    for (const query of trendingQueries.slice(0, 5)) {
      const products = await this.searchProducts(query, 'skincare', 4);
      allProducts.push(...products);
    }

    return allProducts.slice(0, 20);
  }

  async getSephoraBeautyInsiderRecommendations(userProfile) {
    // Mock function for Sephora Beauty Insider member recommendations
    const recommendations = [];
    
    if (userProfile.beautyInsiderLevel === 'rouge') {
      const luxuryProducts = await this.searchProducts('luxury skincare', 'skincare', 5);
      recommendations.push(...luxuryProducts);
    }
    
    if (userProfile.purchaseHistory?.includes('makeup')) {
      const makeupProducts = await this.searchProducts('best selling makeup', 'makeup', 5);
      recommendations.push(...makeupProducts);
    }
    
    if (userProfile.skinConcerns?.includes('aging')) {
      const antiAgingProducts = await this.searchProducts('anti aging', 'skincare', 5);
      recommendations.push(...antiAgingProducts);
    }

    return recommendations.slice(0, 15);
  }

  async getBeautyDeals() {
    let browser = null;
    let page = null;
    
    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log('Fetching Sephora beauty deals');
      await page.goto(`${this.baseUrl}/deals`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for deals content to load
      await page.waitForSelector('[data-comp="ProductCard"], .deal-card', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const deals = await page.evaluate(() => {
        const dealElements = document.querySelectorAll('[data-comp="ProductCard"], .deal-card');
        const deals = [];
        
        dealElements.forEach(element => {
          const deal = {
            title: element.querySelector('[data-at="product_name"]')?.textContent.trim() || '',
            price: element.querySelector('[data-at="price"]')?.textContent.trim() || '',
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
      console.error('Error fetching beauty deals:', error.message);
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
  const tags = [queryLower, 'beauty', 'wellness'];
  
  // Add tags based on product name keywords
  if (name.includes('serum')) tags.push('serum', 'skincare');
  if (name.includes('moisturizer') || name.includes('cream')) tags.push('moisturizer', 'hydration', 'skincare');
  if (name.includes('cleanser') || name.includes('wash')) tags.push('cleanser', 'skincare');
  if (name.includes('foundation') || name.includes('concealer')) tags.push('makeup', 'foundation');
  if (name.includes('lipstick') || name.includes('gloss')) tags.push('makeup', 'lips');
  if (name.includes('mascara') || name.includes('eyeliner')) tags.push('makeup', 'eyes');
  if (name.includes('shampoo') || name.includes('conditioner')) tags.push('haircare', 'hair');
  if (name.includes('perfume') || name.includes('fragrance')) tags.push('fragrance', 'perfume');
  if (name.includes('sunscreen') || name.includes('spf')) tags.push('sunscreen', 'protection', 'skincare');
  if (name.includes('anti-aging') || name.includes('wrinkle')) tags.push('anti-aging', 'skincare');
  if (name.includes('acne') || name.includes('blemish')) tags.push('acne', 'skincare');
  if (name.includes('sensitive') || name.includes('gentle')) tags.push('sensitive', 'gentle');
  if (name.includes('natural') || name.includes('organic')) tags.push('natural', 'organic');
  if (name.includes('vitamin') || name.includes('c') || name.includes('e') || name.includes('a')) tags.push('vitamins', 'skincare');
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

// Helper function to detect category from product name and query
function detectCategory(productName, query) {
  const name = productName.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Category detection logic
  if (name.includes('foundation') || name.includes('concealer') || name.includes('powder') || 
      name.includes('lipstick') || name.includes('gloss') || name.includes('mascara') || 
      name.includes('eyeliner') || name.includes('blush') || name.includes('bronzer')) {
    return 'Makeup';
  }
  
  if (name.includes('shampoo') || name.includes('conditioner') || name.includes('hair') || 
      name.includes('styling') || name.includes('brush') || name.includes('comb')) {
    return 'Haircare';
  }
  
  if (name.includes('perfume') || name.includes('fragrance') || name.includes('cologne')) {
    return 'Fragrance';
  }
  
  if (name.includes('bath') || name.includes('body') || name.includes('lotion') || 
      name.includes('soap') || name.includes('wash')) {
    return 'Bodycare';
  }
  
  // Default to Skincare for most beauty products
  return 'Skincare';
}

module.exports = SephoraScraper; 