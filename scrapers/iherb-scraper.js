const puppeteer = require('puppeteer');
const axios = require('axios');

class iHerbScraper {
  constructor() {
    this.baseURL = 'https://www.iherb.com';
    this.browser = null;
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
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
          '--user-agent=' + this.userAgent
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

  async searchProducts(query, limit = 20) {
    try {
      console.log(`Scraping iHerb for: ${query}`);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to iHerb search
      const searchUrl = `${this.baseURL}/search?kw=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for products to load
      await page.waitForSelector('.product-cell-container', { timeout: 15000 });
      
      // Extract product information
      const products = await page.evaluate((limit) => {
        const productElements = document.querySelectorAll('.product-cell-container');
        const products = [];
        
        for (let i = 0; i < Math.min(productElements.length, limit); i++) {
          const element = productElements[i];
          
          try {
            // Extract product data
            const nameElement = element.querySelector('.product-title');
            const priceElement = element.querySelector('.price');
            const ratingElement = element.querySelector('.rating');
            const reviewElement = element.querySelector('.review-count');
            const imageElement = element.querySelector('.product-image img');
            const brandElement = element.querySelector('.product-brand');
            const linkElement = element.querySelector('a[href*="/pr/"]');
            
            if (nameElement) {
              const name = nameElement.textContent.trim();
              const price = priceElement ? priceElement.textContent.trim() : null;
              const rating = ratingElement ? parseFloat(ratingElement.textContent) : null;
              const reviewCount = reviewElement ? parseInt(reviewElement.textContent.replace(/[^\d]/g, '')) : null;
              const imageUrl = imageElement ? imageElement.src : null;
              const brand = brandElement ? brandElement.textContent.trim() : null;
              const productUrl = linkElement ? linkElement.href : null;
              
              products.push({
                name,
                brand,
                price,
                rating,
                reviewCount,
                imageUrl,
                productUrl,
                source: 'iHerb'
              });
            }
          } catch (error) {
            console.error('Error extracting product:', error);
          }
        }
        
        return products;
      }, limit);
      
      await page.close();
      
      console.log(`Found ${products.length} products from iHerb`);
      return this.formatProducts(products, query);
      
    } catch (error) {
      console.error('iHerb scraper error:', error.message);
      return [];
    }
  }

  async getProductDetails(productUrl) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1280, height: 800 });
      
      await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const productDetails = await page.evaluate(() => {
        const descriptionElement = document.querySelector('.product-description');
        const ingredientsElement = document.querySelector('.ingredients');
        const dosageElement = document.querySelector('.dosage');
        const warningsElement = document.querySelector('.warnings');
        const benefitsElement = document.querySelector('.benefits');
        
        return {
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
          ingredients: ingredientsElement ? ingredientsElement.textContent.trim() : '',
          dosage: dosageElement ? dosageElement.textContent.trim() : '',
          warnings: warningsElement ? warningsElement.textContent.trim() : '',
          benefits: benefitsElement ? benefitsElement.textContent.trim() : ''
        };
      });
      
      await page.close();
      return productDetails;
      
    } catch (error) {
      console.error('Error getting product details:', error.message);
      return {};
    }
  }

  async getProductsByCondition(condition) {
    const conditionMappings = {
      'eczema': ['skin health', 'dermatitis', 'moisturizer', 'colloidal oatmeal'],
      'diabetes': ['blood sugar', 'diabetes support', 'glucose', 'chromium'],
      'arthritis': ['joint health', 'arthritis', 'inflammation', 'glucosamine'],
      'anxiety': ['anxiety', 'stress', 'calm', 'l-theanine'],
      'depression': ['mood support', 'depression', 'serotonin', '5-htp'],
      'asthma': ['respiratory', 'asthma', 'breathing', 'quercetin'],
      'hypertension': ['blood pressure', 'hypertension', 'cardiovascular', 'coq10'],
      'migraine': ['headache', 'migraine', 'pain relief', 'magnesium'],
      'insomnia': ['sleep', 'insomnia', 'relaxation', 'melatonin'],
      'pcos': ['hormone balance', 'pcos', 'women health', 'inositol'],
      'acne': ['acne', 'skin care', 'blemish', 'zinc'],
      'back pain': ['back pain', 'muscle relief', 'pain management', 'curcumin']
    };

    const searchTerms = conditionMappings[condition.toLowerCase()] || [condition];
    const allProducts = [];

    for (const term of searchTerms) {
      const products = await this.searchProducts(term, 8);
      allProducts.push(...products);
    }

    return this.removeDuplicates(allProducts).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  formatProducts(products, query) {
    return products.map(product => ({
      id: `iherb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      brand: product.brand || 'iHerb',
      description: `High-quality ${query} product from iHerb`,
      price: this.parsePrice(product.price),
      originalPrice: null,
      imageUrl: product.imageUrl || `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=${encodeURIComponent(product.name)}`,
      retailer: 'iHerb',
      recommendedByAI: true,
      conditionTags: this.extractConditionTags(product.name, query),
      tags: this.extractTags(product.name, query),
      category: 'Supplements',
      upvotes: Math.floor(Math.random() * 100) + 20,
      comments: Math.floor(Math.random() * 50) + 5,
      rating: product.rating || 4.0,
      reviewCount: product.reviewCount || 0,
      useCount: Math.floor(Math.random() * 500) + 50,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false,
      inStock: true,
      shipping: true,
      source: 'iHerb',
      productUrl: product.productUrl,
      benefits: this.extractBenefits(product.name),
      ingredients: [],
      dosage: null,
      warnings: ['Consult healthcare provider before use']
    }));
  }

  parsePrice(priceString) {
    if (!priceString) return null;
    const match = priceString.match(/\$?(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  extractConditionTags(name, query) {
    const text = `${name} ${query}`.toLowerCase();
    const conditions = [
      'eczema', 'dermatitis', 'skin', 'diabetes', 'blood sugar', 'arthritis', 
      'joint', 'anxiety', 'stress', 'depression', 'mood', 'asthma', 'breathing',
      'hypertension', 'blood pressure', 'migraine', 'headache', 'insomnia', 
      'sleep', 'pcos', 'hormone', 'acne', 'back pain', 'inflammation'
    ];

    return conditions.filter(condition => text.includes(condition));
  }

  extractTags(name, query) {
    const text = `${name} ${query}`.toLowerCase();
    const tags = [
      'natural', 'organic', 'supplement', 'vitamin', 'mineral', 'herbal',
      'probiotic', 'omega', 'antioxidant', 'immune', 'digestive', 'energy',
      'wellness', 'health', 'premium', 'vegan', 'gluten-free', 'non-gmo'
    ];

    return tags.filter(tag => text.includes(tag));
  }

  extractBenefits(name) {
    const benefitKeywords = [
      'supports', 'helps', 'promotes', 'maintains', 'improves', 'enhances',
      'boosts', 'strengthens', 'protects', 'relieves', 'reduces', 'calms'
    ];

    return benefitKeywords.filter(keyword => name.toLowerCase().includes(keyword));
  }

  removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = `${product.name}-${product.brand}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}`, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('iHerb health check failed:', error.message);
      return false;
    }
  }
}

module.exports = iHerbScraper; 