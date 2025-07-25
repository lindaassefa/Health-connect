const puppeteer = require('puppeteer');

class ImprovedScraperBase {
  constructor() {
    this.browser = null;
    this.userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
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
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceLogging',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--no-default-browser-check',
          '--no-pings',
          '--no-zygote',
          '--password-store=basic',
          '--use-mock-keychain',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
    }
    return this.browser;
  }

  async createStealthPage(browser) {
    const page = await browser.newPage();
    
    // Random user agent
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await page.setUserAgent(userAgent);
    
    // Set viewport
    await page.setViewport({ 
      width: 1920 + Math.floor(Math.random() * 100), 
      height: 1080 + Math.floor(Math.random() * 100) 
    });

    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    });

    return page;
  }

  async navigateWithRetry(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt}/${maxRetries} to ${url}`);
        
        // Add random delay between attempts
        if (attempt > 1) {
          const delay = 2000 + Math.random() * 3000;
          await page.waitForTimeout(delay);
        }

        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 45000 
        });

        // Check if we got blocked
        const isBlocked = await this.checkIfBlocked(page);
        if (isBlocked) {
          throw new Error('Access blocked by website');
        }

        return true;
      } catch (error) {
        console.log(`Navigation attempt ${attempt} failed: ${error.message}`);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  async checkIfBlocked(page) {
    try {
      const blockedIndicators = [
        'access denied',
        'blocked',
        'captcha',
        'robot',
        'bot',
        'suspicious',
        'security check'
      ];

      const pageContent = await page.content().toLowerCase();
      return blockedIndicators.some(indicator => pageContent.includes(indicator));
    } catch (error) {
      return false;
    }
  }

  async waitForProducts(page, selectors, timeout = 10000) {
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout });
        console.log(`Found products with selector: ${selector}`);
        return selector;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    return null;
  }

  async extractProductsWithRetry(page, selectors, extractFunction) {
    // Try multiple times with different wait strategies
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Wait for any of the selectors
        const foundSelector = await this.waitForProducts(page, selectors, 8000);
        
        if (!foundSelector) {
          console.log(`Attempt ${attempt}: No product selectors found, waiting longer...`);
          await page.waitForTimeout(3000 + attempt * 2000);
          continue;
        }

        // Extract products
        const products = await page.evaluate(extractFunction, foundSelector);
        
        if (products && products.length > 0) {
          console.log(`Successfully extracted ${products.length} products on attempt ${attempt}`);
          return products;
        }

        console.log(`Attempt ${attempt}: No products extracted, trying again...`);
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt === 3) throw error;
      }
    }
    
    return [];
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Utility function to add random delays
  async randomDelay(min = 1000, max = 3000) {
    const delay = min + Math.random() * (max - min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = ImprovedScraperBase; 