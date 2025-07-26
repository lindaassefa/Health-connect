const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const authMiddleware = require('../middleware/auth');

// Try to load scraper manager, but provide fallback if it fails
let scraperManager = null;
try {
  const ScraperManager = require('../../scrapers/scraper-manager');
  scraperManager = new ScraperManager();
} catch (error) {
  console.log('Scraper manager not available, using fallback mode:', error.message);
  scraperManager = null;
}

// Mock scraper functions for fallback
const mockScraper = async (query, retailer) => {
  // Array of relevant product images from Unsplash
  const productImages = [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center', // skincare
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center', // supplements
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop&crop=center', // wellness
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center', // natural products
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop&crop=center', // health products
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'  // beauty products
  ];
  
  return [
    {
      id: `${retailer}-1`,
      name: `${query} Product 1`,
      brand: `${retailer} Brand`,
      description: `Great ${query} product from ${retailer}`,
      price: Math.floor(Math.random() * 50) + 10,
      imageUrl: productImages[Math.floor(Math.random() * productImages.length)],
      retailer: retailer,
      recommendedByAI: Math.random() > 0.5,
      conditionTags: [query.charAt(0).toUpperCase() + query.slice(1)],
      tags: [query.toLowerCase(), 'wellness', 'health'],
      category: 'Skincare',
      upvotes: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 20) + 5,
      rating: (Math.random() * 1.5) + 3.5,
      useCount: Math.floor(Math.random() * 1000) + 100,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false
    },
    {
      id: `${retailer}-2`,
      name: `${query} Product 2`,
      brand: `${retailer} Premium`,
      description: `Premium ${query} solution from ${retailer}`,
      price: Math.floor(Math.random() * 100) + 50,
      imageUrl: productImages[Math.floor(Math.random() * productImages.length)],
      retailer: retailer,
      recommendedByAI: Math.random() > 0.5,
      conditionTags: [query.charAt(0).toUpperCase() + query.slice(1)],
      tags: [query.toLowerCase(), 'premium', 'natural'],
      category: 'Supplements',
      upvotes: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 20) + 5,
      rating: (Math.random() * 1.5) + 3.5,
      useCount: Math.floor(Math.random() * 1000) + 100,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false
    }
  ];
};

// GET /api/products - fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({ 
      order: [['upvotes', 'DESC'], ['createdAt', 'DESC']] 
    });
    
    // Add default values for frontend compatibility
    const productsWithDefaults = products.map(product => ({
      ...product.toJSON(),
      brand: product.brand || 'Unknown Brand',
      conditionTags: product.conditionTags || [],
      rating: product.rating || 4.5,
      useCount: product.useCount || Math.floor(Math.random() * 1000) + 100,
      comments: product.comments || 0,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false,
      tags: product.tags || []
    }));
    
    res.json(productsWithDefaults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/upvote - upvote a product
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    product.upvotes += 1;
    await product.save();
    
    res.json({ success: true, upvotes: product.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/use - mark product as used
router.post('/:id/use', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // In a real app, you'd track this in a separate UserProduct table
    res.json({ success: true, message: 'Product marked as used' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/bookmark - bookmark a product
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // In a real app, you'd track this in a separate UserBookmark table
    res.json({ success: true, message: 'Product bookmarked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products - create a new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, brand, description, tags, conditionTags, imageUrl, price, category } = req.body;
    
    const product = await Product.create({
      name,
      brand: brand || 'Unknown Brand',
      description,
      tags: tags || [],
      conditionTags: conditionTags || [],
      imageUrl,
      price,
      category,
      recommendedByAI: false // User-submitted products
    });
    
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/real-products - fetch real products from external retailers
router.get("/real-products", async (req, res) => {
  const query = req.query.q || "wellness";

  try {
    console.log(`Fetching products for query: ${query}`);
    
    let combined = [];
    
    // Try to use scrapers if available
    if (scraperManager) {
      try {
        console.log('Trying scraper manager...');
        const results = await scraperManager.searchAllRetailers(query, 'wellness', 12);
        
        if (results && results.all && results.all.length > 0) {
          console.log(`Found ${results.all.length} products from scrapers`);
          combined = results.all.map(product => ({
            id: product.id || Math.random().toString(36).substr(2, 9),
            name: product.name || 'Product',
            brand: product.brand || 'Unknown Brand',
            description: product.description || `Great ${query} product`,
            price: product.price || '$19.99',
            imageUrl: product.imageUrl || product.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
            retailer: product.retailer || 'Online Store',
            rating: product.rating || 4.5,
            tags: product.tags || [],
            conditionTags: product.conditionTags || [query],
            category: product.category || 'Wellness',
            upvotes: product.upvotes || Math.floor(Math.random() * 100) + 10,
            comments: product.comments || Math.floor(Math.random() * 20),
            isUpvoted: false,
            isUsed: false,
            isBookmarked: false
          }));
        }
      } catch (scraperError) {
        console.log('Scraper failed, using fallback:', scraperError.message);
      }
    } else {
      console.log('Scraper manager not available, using fallback mode');
    }

    // If scrapers return no results or are not available, use comprehensive fallback data
    if (combined.length === 0) {
      console.log('Using fallback data');
      combined = generateFallbackProducts(query);
    }

    // Ensure we have at least some products
    if (combined.length === 0) {
      console.log('Using default products');
      combined = generateDefaultProducts(query);
    }

    console.log(`Returning ${combined.length} products for query: ${query}`);
    res.json(combined);
  } catch (error) {
    console.error('Error fetching real products:', error);
    
    // Fallback to generated products on error
    const fallbackProducts = generateFallbackProducts(query);
    res.json(fallbackProducts);
  }
});

// GET /api/products/health-recommendations - get personalized health recommendations
router.get("/health-recommendations", authMiddleware, async (req, res) => {
  try {
    const userProfile = req.user;
    
    console.log(`Getting health recommendations for user: ${userProfile.username}`);
    
    let recommendations = [];
    
    // Only try scrapers if they're available
    if (scraperManager) {
      try {
        recommendations = await scraperManager.getPersonalizedHealthRecommendations(userProfile);
        
        if (recommendations.length > 0) {
          console.log(`Found ${recommendations.length} condition-based recommendations`);
          return res.json(recommendations);
        }
      } catch (scraperError) {
        console.log('Scraper failed, using fallback:', scraperError.message);
      }
    } else {
      console.log('Scraper manager not available, using fallback mode');
    }
    
    // Fallback to general wellness products
    const fallbackProducts = generateFallbackProducts('wellness');
    res.json([{
      condition: 'general wellness',
      products: fallbackProducts
    }]);
    
  } catch (error) {
    console.error('Error getting health recommendations:', error);
    res.status(500).json({ error: 'Failed to get health recommendations' });
  }
});

// GET /api/products/scraper-status - check scraper health
router.get("/scraper-status", async (req, res) => {
  try {
    const healthStatus = await scraperManager.healthCheck();
    const stats = scraperManager.getScraperStats();
    
    res.json({
      health: healthStatus,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Scraper status error:", err);
    res.status(500).json({ error: "Failed to check scraper status" });
  }
});

// Cleanup function to close browsers when server shuts down
process.on('SIGINT', async () => {
  console.log('Shutting down scrapers...');
  await scraperManager.closeAllBrowsers();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down scrapers...');
  await scraperManager.closeAllBrowsers();
  process.exit(0);
});

// Helper function to generate realistic fallback products
function generateFallbackProducts(query) {
  const queryLower = query.toLowerCase();
  
  // Real product data based on common health conditions
  const productDatabase = {
    eczema: [
      {
        id: 'ecz-001',
        name: 'CeraVe Moisturizing Cream',
        brand: 'CeraVe',
        description: 'Fragrance-free moisturizing cream with ceramides and hyaluronic acid for dry, sensitive skin',
        price: '$19.99',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.7',
        tags: ['moisturizer', 'ceramides', 'fragrance-free', 'sensitive skin'],
        conditionTags: ['eczema', 'dry skin', 'sensitive skin'],
        category: 'Skincare'
      },
      {
        id: 'ecz-002',
        name: 'Aveeno Eczema Therapy Moisturizing Cream',
        brand: 'Aveeno',
        description: 'Colloidal oatmeal cream clinically proven to relieve eczema symptoms',
        price: '$15.49',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.5',
        tags: ['colloidal oatmeal', 'clinically proven', 'relief'],
        conditionTags: ['eczema', 'itchy skin', 'irritation'],
        category: 'Skincare'
      },
      {
        id: 'ecz-003',
        name: 'Eucerin Eczema Relief Cream',
        brand: 'Eucerin',
        description: 'Intensive moisturizing cream with colloidal oatmeal for eczema-prone skin',
        price: '$12.99',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.6',
        tags: ['intensive', 'colloidal oatmeal', 'fragrance-free'],
        conditionTags: ['eczema', 'dry skin'],
        category: 'Skincare'
      }
    ],
    acne: [
      {
        id: 'acn-001',
        name: 'La Roche-Posay Effaclar Duo',
        brand: 'La Roche-Posay',
        description: 'Dual-action acne treatment with benzoyl peroxide and niacinamide',
        price: '$39.99',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        retailer: 'Sephora',
        rating: '4.8',
        tags: ['benzoyl peroxide', 'niacinamide', 'acne treatment'],
        conditionTags: ['acne', 'breakouts', 'blemishes'],
        category: 'Skincare'
      },
      {
        id: 'acn-002',
        name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
        brand: 'Paula\'s Choice',
        description: 'Gentle exfoliating toner with salicylic acid for clear, smooth skin',
        price: '$32.00',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
        retailer: 'Sephora',
        rating: '4.9',
        tags: ['salicylic acid', 'exfoliant', 'toner'],
        conditionTags: ['acne', 'blackheads', 'whiteheads'],
        category: 'Skincare'
      }
    ],
    anxiety: [
      {
        id: 'anx-001',
        name: 'Nature Made Calm Magnesium',
        brand: 'Nature Made',
        description: 'Magnesium supplement to support relaxation and stress relief',
        price: '$18.99',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.4',
        tags: ['magnesium', 'relaxation', 'stress relief'],
        conditionTags: ['anxiety', 'stress', 'sleep'],
        category: 'Supplements'
      },
      {
        id: 'anx-002',
        name: 'Olly Stress Relief Gummies',
        brand: 'Olly',
        description: 'Delicious gummies with L-theanine and GABA for daily stress support',
        price: '$14.99',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.6',
        tags: ['L-theanine', 'GABA', 'gummies'],
        conditionTags: ['anxiety', 'stress', 'mood'],
        category: 'Supplements'
      }
    ],
    pms: [
      {
        id: 'pms-001',
        name: 'Pink Stork PMS Relief',
        brand: 'Pink Stork',
        description: 'Natural supplement with chasteberry and magnesium for PMS symptoms',
        price: '$24.99',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.3',
        tags: ['chasteberry', 'magnesium', 'natural'],
        conditionTags: ['PMS', 'hormonal balance', 'mood'],
        category: 'Supplements'
      }
    ],
    'gut health': [
      {
        id: 'gut-001',
        name: 'Garden of Life Dr. Formulated Probiotics',
        brand: 'Garden of Life',
        description: 'Comprehensive probiotic with 50 billion CFU for digestive health',
        price: '$34.99',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        rating: '4.7',
        tags: ['probiotics', '50 billion CFU', 'digestive health'],
        conditionTags: ['gut health', 'digestion', 'bloating'],
        category: 'Supplements'
      }
    ]
  };

  // Find matching products for the query
  let matchingProducts = [];
  
  // Direct match
  if (productDatabase[queryLower]) {
    matchingProducts = productDatabase[queryLower];
  }
  
  // Partial matches
  Object.keys(productDatabase).forEach(key => {
    if (key.includes(queryLower) || queryLower.includes(key)) {
      matchingProducts = [...matchingProducts, ...productDatabase[key]];
    }
  });

  // If no matches, return general wellness products
  if (matchingProducts.length === 0) {
    matchingProducts = [
      ...productDatabase.eczema.slice(0, 2),
      ...productDatabase.anxiety.slice(0, 2),
      ...productDatabase['gut health'].slice(0, 1)
    ];
  }

  // Remove duplicates and limit results
  const uniqueProducts = matchingProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );

  return uniqueProducts.slice(0, 12);
}

// Helper function for default products
function generateDefaultProducts(query) {
  const defaultProducts = [
    {
      id: 'def-001',
      name: 'CeraVe Moisturizing Cream',
      brand: 'CeraVe',
      description: 'A rich, non-greasy moisturizer that helps restore the protective skin barrier.',
      price: '$19.99',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
      retailer: 'Amazon',
      rating: 4.8,
      tags: ['moisturizer', 'barrier repair', 'fragrance-free'],
      conditionTags: ['Eczema', 'Dry Skin'],
      category: 'Skincare',
      upvotes: 156,
      comments: 23,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false
    },
    {
      id: 'def-002',
      name: 'Nature Made Vitamin D3',
      brand: 'Nature Made',
      description: 'Supports bone health and immune system function.',
      price: '$12.99',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
      retailer: 'Walmart',
      rating: 4.6,
      tags: ['vitamin d', 'bone health', 'immune support'],
      conditionTags: ['Vitamin D Deficiency'],
      category: 'Supplements',
      upvotes: 89,
      comments: 12,
      isUpvoted: true,
      isUsed: true,
      isBookmarked: false
    },
    {
      id: 'def-003',
      name: 'Calm Magnesium Supplement',
      brand: 'Calm',
      description: 'Natural magnesium supplement for stress relief and better sleep.',
      price: '$24.99',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
      retailer: 'Amazon',
      rating: 4.9,
      tags: ['magnesium', 'stress relief', 'sleep', 'anxiety'],
      conditionTags: ['Anxiety', 'Insomnia'],
      category: 'Supplements',
      upvotes: 234,
      comments: 45,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: true
    },
    {
      id: 'def-004',
      name: 'Garden of Life Probiotics',
      brand: 'Garden of Life',
      description: 'Comprehensive probiotic with 50 billion CFU for digestive health.',
      price: '$34.99',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop&crop=center',
      retailer: 'Walmart',
      rating: 4.7,
      tags: ['probiotics', '50 billion CFU', 'digestive health'],
      conditionTags: ['Gut Health', 'Digestion'],
      category: 'Supplements',
      upvotes: 189,
      comments: 34,
      isUpvoted: false,
      isUsed: false,
      isBookmarked: false
    }
  ];

  // Filter products based on query if it's a specific condition
  const queryLower = query.toLowerCase();
  const filteredProducts = defaultProducts.filter(product => 
    product.conditionTags.some(tag => tag.toLowerCase().includes(queryLower)) ||
    product.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
    product.name.toLowerCase().includes(queryLower) ||
    product.description.toLowerCase().includes(queryLower)
  );

  return filteredProducts.length > 0 ? filteredProducts : defaultProducts;
}

module.exports = router; 