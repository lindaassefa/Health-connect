const axios = require('axios');

class iHerbAPI {
  constructor() {
    // Note: iHerb doesn't have a public API, so we'll use mock data that's realistic
    this.baseURL = 'https://www.iherb.com';
    this.userAgent = 'Health-Engagement-Platform/1.0';
  }

  async searchProducts(query, category = 'supplements', limit = 20) {
    try {
      console.log(`Searching iHerb for: ${query}`);
      
      // Since iHerb doesn't have a public API, we'll return realistic mock data
      // This simulates what we would get from their actual product database
      const mockProducts = this.generateMockiHerbProducts(query, limit);
      
      return this.formatProducts(mockProducts, query);
    } catch (error) {
      console.error('iHerb API error:', error.message);
      return [];
    }
  }

  async getProductDetails(productId) {
    try {
      // Generate mock product details
      const mockProduct = this.generateMockiHerbProduct(productId);
      return this.formatProductDetail(mockProduct);
    } catch (error) {
      console.error('iHerb product detail error:', error.message);
      return null;
    }
  }

  async getProductsByCondition(condition) {
    // Map common conditions to iHerb categories and search terms
    const conditionMappings = {
      'eczema': ['skin health', 'dermatitis', 'moisturizer'],
      'diabetes': ['blood sugar', 'diabetes support', 'glucose'],
      'arthritis': ['joint health', 'arthritis', 'inflammation'],
      'anxiety': ['anxiety', 'stress', 'calm'],
      'depression': ['mood support', 'depression', 'serotonin'],
      'asthma': ['respiratory', 'asthma', 'breathing'],
      'hypertension': ['blood pressure', 'hypertension', 'cardiovascular'],
      'migraine': ['headache', 'migraine', 'pain relief'],
      'insomnia': ['sleep', 'insomnia', 'relaxation'],
      'pcos': ['hormone balance', 'pcos', 'women health'],
      'acne': ['acne', 'skin care', 'blemish'],
      'back pain': ['back pain', 'muscle relief', 'pain management']
    };

    const searchTerms = conditionMappings[condition.toLowerCase()] || [condition];
    const allProducts = [];

    for (const term of searchTerms) {
      const products = await this.searchProducts(term, 'supplements', 10);
      allProducts.push(...products);
    }

    // Remove duplicates and sort by rating
    return this.removeDuplicates(allProducts).sort((a, b) => b.rating - a.rating);
  }

  generateMockiHerbProducts(query, limit) {
    const queryLower = query.toLowerCase();
    const products = [];

    // Realistic iHerb product database based on common health conditions
    const productDatabase = {
      'eczema': [
        {
          id: 'iherb-ecz-001',
          name: 'Now Foods Vitamin E-1000 IU',
          brand: 'Now Foods',
          description: 'Natural vitamin E supplement that supports skin health and may help with eczema symptoms',
          price: 12.99,
          rating: 4.6,
          reviewCount: 1247,
          category: 'Vitamins',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-ecz-002',
          name: 'Nature\'s Way Evening Primrose Oil',
          brand: 'Nature\'s Way',
          description: 'Cold-pressed evening primrose oil rich in GLA for skin health and eczema support',
          price: 18.49,
          rating: 4.4,
          reviewCount: 892,
          category: 'Herbs',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-ecz-003',
          name: 'Jarrow Formulas Zinc Balance',
          brand: 'Jarrow Formulas',
          description: 'Zinc supplement with copper for immune support and skin health',
          price: 15.99,
          rating: 4.7,
          reviewCount: 567,
          category: 'Minerals',
          inStock: true,
          freeShipping: false
        }
      ],
      'diabetes': [
        {
          id: 'iherb-diab-001',
          name: 'Nature Made Chromium Picolinate',
          brand: 'Nature Made',
          description: 'Chromium supplement that may help support healthy blood sugar levels',
          price: 9.99,
          rating: 4.5,
          reviewCount: 2341,
          category: 'Minerals',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-diab-002',
          name: 'Solgar Cinnamon Extract',
          brand: 'Solgar',
          description: 'Cinnamon extract supplement for blood sugar support and metabolic health',
          price: 22.99,
          rating: 4.3,
          reviewCount: 756,
          category: 'Herbs',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-diab-003',
          name: 'Doctor\'s Best Alpha Lipoic Acid',
          brand: 'Doctor\'s Best',
          description: 'Alpha lipoic acid supplement for antioxidant support and blood sugar health',
          price: 19.99,
          rating: 4.6,
          reviewCount: 1123,
          category: 'Antioxidants',
          inStock: true,
          freeShipping: false
        }
      ],
      'anxiety': [
        {
          id: 'iherb-anx-001',
          name: 'Nature\'s Bounty L-Theanine',
          brand: 'Nature\'s Bounty',
          description: 'L-Theanine supplement for stress relief and calm focus',
          price: 14.99,
          rating: 4.4,
          reviewCount: 1892,
          category: 'Amino Acids',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-anx-002',
          name: 'Now Foods Ashwagandha',
          brand: 'Now Foods',
          description: 'Ashwagandha root extract for stress support and adrenal health',
          price: 16.99,
          rating: 4.5,
          reviewCount: 2341,
          category: 'Herbs',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-anx-003',
          name: 'Jarrow Formulas Magnesium',
          brand: 'Jarrow Formulas',
          description: 'Magnesium glycinate for muscle relaxation and stress relief',
          price: 21.99,
          rating: 4.7,
          reviewCount: 1456,
          category: 'Minerals',
          inStock: true,
          freeShipping: false
        }
      ],
      'arthritis': [
        {
          id: 'iherb-arth-001',
          name: 'Doctor\'s Best Glucosamine Chondroitin',
          brand: 'Doctor\'s Best',
          description: 'Glucosamine and chondroitin supplement for joint health and mobility',
          price: 24.99,
          rating: 4.3,
          reviewCount: 892,
          category: 'Joint Health',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-arth-002',
          name: 'Now Foods Turmeric Curcumin',
          brand: 'Now Foods',
          description: 'Turmeric extract with curcumin for inflammation support and joint health',
          price: 18.99,
          rating: 4.6,
          reviewCount: 1678,
          category: 'Herbs',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-arth-003',
          name: 'Solgar Omega-3 Fish Oil',
          brand: 'Solgar',
          description: 'High-potency fish oil for inflammation support and joint health',
          price: 29.99,
          rating: 4.5,
          reviewCount: 2341,
          category: 'Omega-3',
          inStock: true,
          freeShipping: false
        }
      ]
    };

    // Find matching products based on query
    Object.keys(productDatabase).forEach(condition => {
      if (queryLower.includes(condition) || condition.includes(queryLower)) {
        products.push(...productDatabase[condition]);
      }
    });

    // If no specific matches, return general wellness products
    if (products.length === 0) {
      products.push(
        {
          id: 'iherb-gen-001',
          name: 'Nature Made Multi Complete',
          brand: 'Nature Made',
          description: 'Complete multivitamin with minerals for overall health support',
          price: 19.99,
          rating: 4.4,
          reviewCount: 3456,
          category: 'Multivitamins',
          inStock: true,
          freeShipping: true
        },
        {
          id: 'iherb-gen-002',
          name: 'Now Foods Probiotic-10',
          brand: 'Now Foods',
          description: 'Probiotic supplement with 10 beneficial strains for digestive health',
          price: 16.99,
          rating: 4.5,
          reviewCount: 2134,
          category: 'Probiotics',
          inStock: true,
          freeShipping: true
        }
      );
    }

    return products.slice(0, limit);
  }

  generateMockiHerbProduct(productId) {
    // Generate a mock product based on ID
    return {
      id: productId,
      name: 'Sample iHerb Product',
      brand: 'iHerb Brand',
      description: 'High-quality supplement for health and wellness',
      price: 19.99,
      rating: 4.5,
      reviewCount: 1000,
      category: 'Supplements',
      inStock: true,
      freeShipping: true
    };
  }

  formatProducts(products, query) {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || null,
      imageUrl: `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=${encodeURIComponent(product.name)}`,
      retailer: 'iHerb',
      recommendedByAI: true,
      conditionTags: this.extractConditionTags(product.name, product.description, query),
      tags: this.extractTags(product.name, product.description, product.category),
      category: product.category || 'Supplements',
      upvotes: Math.floor(Math.random() * 100) + 20,
      comments: Math.floor(Math.random() * 50) + 5,
      rating: product.rating,
      reviewCount: product.reviewCount,
      useCount: Math.floor(Math.random() * 500) + 50,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false,
      inStock: product.inStock,
      shipping: product.freeShipping,
      source: 'iHerb',
      productUrl: `https://www.iherb.com/pr/${product.id}`,
      benefits: this.extractBenefits(product.description),
      ingredients: [],
      dosage: null,
      warnings: ['Consult healthcare provider before use']
    }));
  }

  formatProductDetail(product) {
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      imageUrl: `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=${encodeURIComponent(product.name)}`,
      rating: product.rating,
      reviewCount: product.reviewCount,
      reviews: [],
      ingredients: [],
      dosage: null,
      warnings: ['Consult healthcare provider before use'],
      benefits: this.extractBenefits(product.description),
      conditionTags: this.extractConditionTags(product.name, product.description),
      tags: this.extractTags(product.name, product.description, product.category),
      category: product.category,
      inStock: product.inStock,
      shipping: product.freeShipping,
      source: 'iHerb',
      productUrl: `https://www.iherb.com/pr/${product.id}`
    };
  }

  extractConditionTags(name, description, query = '') {
    const text = `${name} ${description} ${query}`.toLowerCase();
    const conditions = [
      'eczema', 'dermatitis', 'skin', 'diabetes', 'blood sugar', 'arthritis', 
      'joint', 'anxiety', 'stress', 'depression', 'mood', 'asthma', 'breathing',
      'hypertension', 'blood pressure', 'migraine', 'headache', 'insomnia', 
      'sleep', 'pcos', 'hormone', 'acne', 'back pain', 'inflammation'
    ];

    return conditions.filter(condition => text.includes(condition));
  }

  extractTags(name, description, category) {
    const text = `${name} ${description} ${category}`.toLowerCase();
    const tags = [
      'natural', 'organic', 'supplement', 'vitamin', 'mineral', 'herbal',
      'probiotic', 'omega', 'antioxidant', 'immune', 'digestive', 'energy',
      'wellness', 'health', 'premium', 'vegan', 'gluten-free', 'non-gmo'
    ];

    return tags.filter(tag => text.includes(tag));
  }

  extractBenefits(description) {
    if (!description) return [];
    
    const benefitKeywords = [
      'supports', 'helps', 'promotes', 'maintains', 'improves', 'enhances',
      'boosts', 'strengthens', 'protects', 'relieves', 'reduces', 'calms'
    ];

    const sentences = description.split(/[.!?]+/);
    return sentences
      .filter(sentence => 
        benefitKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
      )
      .slice(0, 3);
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

module.exports = iHerbAPI; 