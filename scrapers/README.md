# Product Scrapers

This folder contains external product scrapers for major retailers: Walmart, Sephora, and Ulta Beauty. These scrapers are designed to fetch wellness and beauty products to enhance the product discovery feature of the Health Engagement app.

## 📁 Structure

```
scrapers/
├── walmart-scraper.js      # Walmart product scraper
├── sephora-scraper.js      # Sephora beauty product scraper
├── ulta-scraper.js         # Ulta Beauty product scraper
├── scraper-manager.js      # Main coordinator for all scrapers
├── test-scrapers.js        # Test suite for scrapers
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🚀 Features

### Walmart Scraper
- **Categories**: Wellness, vitamins, supplements, personal care, beauty, health
- **Features**: Product search, trending products, detailed product information
- **Special**: Health-focused product recommendations

### Sephora Scraper
- **Categories**: Skincare, makeup, hair, fragrance, tools, bath, wellness, minis
- **Features**: Beauty product search, ingredient parsing, reviews, similar products
- **Special**: Beauty Insider recommendations, skin concern matching

### Ulta Scraper
- **Categories**: Skincare, makeup, hair, fragrance, tools, bath, wellness, gifts
- **Features**: Product search, rewards integration, deals and promotions
- **Special**: Ulta Rewards member recommendations, age-based suggestions

### Scraper Manager
- **Multi-retailer search**: Search across all retailers simultaneously
- **Personalized recommendations**: Based on user profile and preferences
- **Trending products**: Get popular products from all retailers
- **Health monitoring**: Check scraper status and performance
- **Deduplication**: Remove duplicate products across retailers

## 📦 Installation

```bash
cd scrapers
npm install
```

## 🧪 Testing

Run the test suite to verify all scrapers are working:

```bash
npm test
```

Or run individual tests:

```bash
# Health check
npm run health-check

# Test specific scraper
node test-scrapers.js
```

## 🔧 Usage

### Basic Usage

```javascript
const ScraperManager = require('./scrapers/scraper-manager');

const scraperManager = new ScraperManager();

// Search across all retailers
const results = await scraperManager.searchAllRetailers('vitamin c', 'wellness', 10);

// Get trending products
const trending = await scraperManager.getTrendingProducts();

// Get personalized recommendations
const userProfile = {
  chronicConditions: 'anxiety, insomnia',
  skinConcerns: 'acne, dryness',
  age: 28
};
const recommendations = await scraperManager.getPersonalizedRecommendations(userProfile);
```

### Individual Scraper Usage

```javascript
const WalmartScraper = require('./scrapers/walmart-scraper');
const SephoraScraper = require('./scrapers/sephora-scraper');
const UltaScraper = require('./scrapers/ulta-scraper');

const walmart = new WalmartScraper();
const sephora = new SephoraScraper();
const ulta = new UltaScraper();

// Search specific retailer
const walmartProducts = await walmart.searchProducts('vitamin d', 'wellness', 5);
const sephoraProducts = await sephora.searchProducts('retinol', 'skincare', 5);
const ultaProducts = await ulta.searchProducts('hyaluronic acid', 'skincare', 5);
```

## 📊 API Reference

### ScraperManager Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `searchAllRetailers(query, category, limit)` | Search across all retailers | `query` (string), `category` (string), `limit` (number) | Object with results from each retailer |
| `getTrendingProducts()` | Get trending products from all retailers | None | Object with trending products |
| `getPersonalizedRecommendations(userProfile)` | Get personalized recommendations | `userProfile` (object) | Array of recommended products |
| `getProductDetails(productUrl, retailer)` | Get detailed product information | `productUrl` (string), `retailer` (string) | Product details object |
| `getDealsAndPromotions()` | Get current deals and promotions | None | Object with deals from each retailer |
| `healthCheck()` | Check scraper health status | None | Object with status for each scraper |
| `getScraperStats()` | Get scraper statistics | None | Object with scraper information |

### Product Object Structure

```javascript
{
  id: "unique-product-id",
  name: "Product Name",
  price: "$19.99",
  image: "https://example.com/image.jpg",
  url: "https://retailer.com/product",
  retailer: "Walmart|Sephora|Ulta Beauty",
  rating: "4.5",
  reviews: "1,234 reviews",
  inStock: true,
  category: "wellness|beauty|skincare",
  brand: "Brand Name" // Sephora/Ulta only
}
```

## ⚠️ Important Notes

### Rate Limiting
- All scrapers include built-in rate limiting to respect retailer servers
- Use appropriate delays between requests
- Monitor for any rate limiting responses

### Legal Compliance
- These scrapers are for educational and development purposes
- Respect each retailer's robots.txt and terms of service
- Consider using official APIs where available

### Error Handling
- All scrapers include comprehensive error handling
- Failed requests are logged but don't crash the application
- Use `healthCheck()` to monitor scraper status

### Selector Updates
- Web scraping selectors may need updates if retailer websites change
- Monitor for changes in HTML structure
- Test regularly to ensure functionality

## 🔄 Integration with Main App

To integrate these scrapers with the main Health Engagement app:

1. **Add to main package.json dependencies**:
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12"
  }
}
```

2. **Import in your routes**:
```javascript
const ScraperManager = require('../scrapers/scraper-manager');
```

3. **Add API endpoints**:
```javascript
// GET /api/products/search
app.get('/api/products/search', async (req, res) => {
  const { query, category, limit } = req.query;
  const results = await scraperManager.searchAllRetailers(query, category, limit);
  res.json(results);
});
```

## 🛠️ Development

### Adding New Retailers
1. Create a new scraper class following the existing pattern
2. Implement required methods: `searchProducts()`, `getProductDetails()`
3. Add to `ScraperManager` constructor
4. Update tests and documentation

### Customizing Selectors
Each scraper uses CSS selectors to extract data. If a retailer's website changes:
1. Inspect the new HTML structure
2. Update selectors in the respective scraper
3. Test thoroughly
4. Update documentation

## 📝 License

MIT License - see main project license for details.

## 🤝 Contributing

When contributing to the scrapers:
1. Test thoroughly before submitting
2. Update documentation for any changes
3. Follow the existing code patterns
4. Add appropriate error handling
5. Consider rate limiting and legal compliance 