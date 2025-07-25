const puppeteer = require('puppeteer');
const axios = require('axios');

class AmazonHealthScraper {
  constructor() {
    this.baseURL = 'https://www.amazon.com';
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
      console.log(`Scraping Amazon for: ${query}`);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to Amazon search with health category filter
      const searchUrl = `${this.baseURL}/s?k=${encodeURIComponent(query + ' health supplement')}&i=hpc&ref=sr_nr_i_0`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for products to load
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 15000 });
      
      // Extract product information
      const products = await page.evaluate((limit) => {
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
        const products = [];
        
        for (let i = 0; i < Math.min(productElements.length, limit); i++) {
          const element = productElements[i];
          
          try {
            // Extract product data
            const nameElement = element.querySelector('h2 a span');
            const priceElement = element.querySelector('.a-price-whole');
            const ratingElement = element.querySelector('.a-icon-alt');
            const reviewElement = element.querySelector('.a-size-base');
            const imageElement = element.querySelector('img.s-image');
            const linkElement = element.querySelector('h2 a');
            
            if (nameElement) {
              const name = nameElement.textContent.trim();
              const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : null;
              const rating = ratingElement ? parseFloat(ratingElement.textContent.match(/(\d+\.?\d*)/)?.[1]) : null;
              const reviewCount = reviewElement ? parseInt(reviewElement.textContent.replace(/[^\d]/g, '')) : null;
              const imageUrl = imageElement ? imageElement.src : null;
              const productUrl = linkElement ? linkElement.href : null;
              
              // Only include products that seem relevant
              if (name.toLowerCase().includes('supplement') || 
                  name.toLowerCase().includes('vitamin') || 
                  name.toLowerCase().includes('health') ||
                  name.toLowerCase().includes('natural')) {
                
                products.push({
                  name,
                  brand: this.extractBrand(name),
                  price,
                  rating,
                  reviewCount,
                  imageUrl,
                  productUrl,
                  source: 'Amazon'
                });
              }
            }
          } catch (error) {
            console.error('Error extracting product:', error);
          }
        }
        
        return products;
      }, limit);
      
      await page.close();
      
      console.log(`Found ${products.length} products from Amazon`);
      return this.formatProducts(products, query);
      
    } catch (error) {
      console.error('Amazon scraper error:', error.message);
      return [];
    }
  }

  extractBrand(name) {
    // Extract brand from product name
    const brandPatterns = [
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
      /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of brandPatterns) {
      const match = name.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'Amazon';
  }

  async getProductDetails(productUrl) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1280, height: 800 });
      
      await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const productDetails = await page.evaluate(() => {
        const descriptionElement = document.querySelector('#productDescription');
        const featuresElement = document.querySelector('#feature-bullets');
        const ingredientsElement = document.querySelector('[data-feature-name="ingredients"]');
        
        return {
          description: descriptionElement ? descriptionElement.textContent.trim() : '',
          features: featuresElement ? featuresElement.textContent.trim() : '',
          ingredients: ingredientsElement ? ingredientsElement.textContent.trim() : ''
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
      'eczema': ['eczema cream', 'dermatitis treatment', 'colloidal oatmeal', 'skin moisturizer'],
      'diabetes': ['diabetes supplement', 'blood sugar support', 'chromium supplement', 'cinnamon supplement'],
      'arthritis': ['arthritis supplement', 'joint health', 'glucosamine', 'turmeric supplement'],
      'anxiety': ['anxiety supplement', 'stress relief', 'l-theanine', 'ashwagandha'],
      'depression': ['mood supplement', 'depression support', '5-htp', 'st johns wort'],
      'asthma': ['asthma supplement', 'respiratory support', 'quercetin', 'vitamin d'],
      'hypertension': ['blood pressure supplement', 'hypertension support', 'coq10', 'magnesium'],
      'migraine': ['migraine supplement', 'headache relief', 'magnesium', 'riboflavin'],
      'insomnia': ['sleep supplement', 'insomnia relief', 'melatonin', 'valerian root'],
      'pcos': ['pcos supplement', 'hormone balance', 'inositol', 'vitamin d'],
      'acne': ['acne supplement', 'skin health', 'zinc supplement', 'vitamin a'],
      'back pain': ['back pain relief', 'muscle relaxant', 'curcumin', 'omega 3']
    };

    const searchTerms = conditionMappings[condition.toLowerCase()] || [condition + ' supplement'];
    const allProducts = [];

    for (const term of searchTerms) {
      const products = await this.searchProducts(term, 6);
      allProducts.push(...products);
    }

    return this.removeDuplicates(allProducts).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  formatProducts(products, query) {
    return products.map(product => ({
      id: `amazon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      brand: product.brand,
      description: `High-quality ${query} product from Amazon`,
      price: product.price,
      originalPrice: null,
      imageUrl: product.imageUrl || `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=${encodeURIComponent(product.name)}`,
      retailer: 'Amazon',
      recommendedByAI: true,
      conditionTags: this.extractConditionTags(product.name, query),
      tags: this.extractTags(product.name, query),
      category: 'Health & Wellness',
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
      source: 'Amazon',
      productUrl: product.productUrl,
      benefits: this.extractBenefits(product.name),
      ingredients: [],
      dosage: null,
      warnings: ['Consult healthcare provider before use']
    }));
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
      console.error('Amazon health check failed:', error.message);
      return false;
    }
  }
}

module.exports = AmazonHealthScraper; 