const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const User = require('../models/user');
const Post = require('../models/post');

// Search across all content types
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();
    const results = {};

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.findAll({
        where: {
          caption: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture']
        }],
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      results.posts = posts.map(post => ({
        id: post.id,
        type: 'post',
        caption: post.caption,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        user: post.user,
        likeCount: post.Likes ? post.Likes.length : 0
      }));
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${searchTerm}%` } },
            { fullName: { [Op.iLike]: `%${searchTerm}%` } },
            { location: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['id', 'username', 'fullName', 'location', 'profilePicture', 'chronicConditions'],
        limit: 10
      });

      results.users = users.map(user => ({
        id: user.id,
        type: 'user',
        username: user.username,
        fullName: user.fullName,
        location: user.location,
        profilePicture: user.profilePicture,
        chronicConditions: user.chronicConditions ? 
          (typeof user.chronicConditions === 'string' ? 
            JSON.parse(user.chronicConditions) : user.chronicConditions) : []
      }));
    }

    // Search products (mock data for now)
    if (type === 'all' || type === 'products') {
      const mockProducts = [
        {
          id: 1,
          type: 'product',
          name: 'Vitamin D3',
          brand: 'Nature Made',
          description: 'Supports bone health and immune function',
          category: 'Supplements',
          conditionTags: ['PCOS', 'Anxiety'],
          rating: 4.5,
          useCount: 150
        },
        {
          id: 2,
          type: 'product',
          name: 'Probiotic Complex',
          brand: 'Garden of Life',
          description: 'Supports digestive health and gut microbiome',
          category: 'Supplements',
          conditionTags: ['IBS', 'Digestive Issues'],
          rating: 4.2,
          useCount: 89
        },
        {
          id: 3,
          type: 'product',
          name: 'CBD Oil',
          brand: 'Charlotte\'s Web',
          description: 'Natural relief for anxiety and stress',
          category: 'Mental Health',
          conditionTags: ['Anxiety', 'Stress'],
          rating: 4.7,
          useCount: 234
        }
      ];

      const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.conditionTags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      results.products = filteredProducts;
    }

    res.json({
      query: searchTerm,
      results,
      totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.trim();
    const suggestions = [];

    // Get username suggestions
    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${searchTerm}%`
        }
      },
      attributes: ['username'],
      limit: 5
    });

    users.forEach(user => {
      suggestions.push({
        type: 'user',
        text: user.username,
        display: `@${user.username}`
      });
    });

    // Get condition suggestions
    const conditions = ['Anxiety', 'PCOS', 'Eczema', 'IBS', 'Endometriosis', 'Diabetes', 'Asthma'];
    const matchingConditions = conditions.filter(condition =>
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    matchingConditions.forEach(condition => {
      suggestions.push({
        type: 'condition',
        text: condition,
        display: `#${condition}`
      });
    });

    // Get product suggestions
    const products = ['Vitamin D3', 'Probiotic', 'CBD Oil', 'Omega-3', 'Magnesium'];
    const matchingProducts = products.filter(product =>
      product.toLowerCase().includes(searchTerm.toLowerCase())
    );

    matchingProducts.forEach(product => {
      suggestions.push({
        type: 'product',
        text: product,
        display: `Product: ${product}`
      });
    });

    res.json({ suggestions: suggestions.slice(0, 10) });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router; 