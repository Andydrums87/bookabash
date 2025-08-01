import { NextResponse } from 'next/server';

// Request tracking variables
let requestCount = 0;
let resetTime = Date.now() + (24 * 60 * 60 * 1000); // Reset daily
const REQUEST_LIMIT = 20; // Reduced to 20 requests per day
const requestLog = [];

// In-memory cache for theme suggestions (prevents repeated API calls)
const themeCache = new Map();
const THEME_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class RapidAPIProductService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY;
    this.baseURL = 'https://amazon24.p.rapidapi.com';
  }

  async searchAmazonProducts(query, maxResults = 10) {
    if (!this.apiKey) {
      console.log('⚠️ No API key found, using fake data for:', query);
      return this.getFakeProducts(query, maxResults);
    }

    try {
      console.log('🔍 Searching Amazon for:', query);
      
      // Use GB for UK Amazon marketplace
      const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=GB&sort_by=RELEVANCE&product_condition=ALL`;
      console.log('📡 Making request to:', url);
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.text();
      console.log('✅ API Success! Response length:', result.length);
      
      const data = JSON.parse(result);
      
      if (data.status === 'OK' && data.data?.products) {
        console.log('✅ Found', data.data.products.length, 'real Amazon UK products');
        return this.formatRapidAPIResults(data.data.products.slice(0, maxResults));
      } else if (data.products && Array.isArray(data.products)) {
        console.log('✅ Found', data.products.length, 'real Amazon UK products (alternative format)');
        return this.formatRapidAPIResults(data.products.slice(0, maxResults));
      } else {
        console.log('⚠️ Unexpected response structure:', Object.keys(data));
        throw new Error('No products found in response');
      }
    } catch (error) {
      console.error('❌ RapidAPI search error:', error);
      console.log('🔄 Falling back to fake data...');
      return this.getFakeProducts(query, maxResults);
    }
  }

  getFakeProducts(query, maxResults) {
    // Enhanced fake products with more variety
    const themes = {
      superhero: [
        { title: `${query} - LEGO Batman Batcave Building Set`, price: '£89.99', rating: '4.8', reviews: '1247' },
        { title: `${query} - Superhero Cape and Mask Set`, price: '£16.99', rating: '4.3', reviews: '856' },
        { title: `${query} - Marvel Action Figures 6-Pack`, price: '£34.99', rating: '4.6', reviews: '432' },
        { title: `${query} - Spider-Man Web Shooter Toy`, price: '£24.99', rating: '4.4', reviews: '623' },
        { title: `${query} - Batman Utility Belt Costume`, price: '£19.99', rating: '4.2', reviews: '341' }
      ],
      princess: [
        { title: `${query} - Princess Dress Up Costume Set`, price: '£29.99', rating: '4.7', reviews: '892' },
        { title: `${query} - Tiara and Jewelry Set`, price: '£14.99', rating: '4.5', reviews: '567' },
        { title: `${query} - Princess Castle Playset`, price: '£45.99', rating: '4.6', reviews: '234' },
        { title: `${query} - Magic Wand with Lights`, price: '£12.99', rating: '4.3', reviews: '445' },
        { title: `${query} - Princess Tea Party Set`, price: '£22.99', rating: '4.4', reviews: '321' }
      ],
      default: [
        { title: `${query} - Educational Science Kit`, price: '£24.99', rating: '4.7', reviews: '623' },
        { title: `${query} - Creative Art Set with Crayons`, price: '£12.99', rating: '4.4', reviews: '341' },
        { title: `${query} - Building Blocks Mega Set`, price: '£39.99', rating: '4.6', reviews: '789' },
        { title: `${query} - Musical Keyboard Toy`, price: '£32.99', rating: '4.5', reviews: '456' },
        { title: `${query} - Puzzle Adventure Game`, price: '£18.99', rating: '4.3', reviews: '234' }
      ]
    };

    const themeKey = query.toLowerCase().includes('superhero') ? 'superhero' : 
                     query.toLowerCase().includes('princess') ? 'princess' : 'default';
    
    const selectedTheme = themes[themeKey] || themes.default;
    
    const fakeProducts = selectedTheme.slice(0, maxResults).map((product, index) => ({
      asin: `FAKE00${index + 1}`,
      product_title: product.title,
      product_price: product.price,
      product_photo: `https://images.unsplash.com/photo-${1558060370 + index}?w=300`,
      product_url: `https://amazon.co.uk/dp/FAKE00${index + 1}`,
      product_star_rating: product.rating,
      product_num_ratings: product.reviews
    }));

    return this.formatRapidAPIResults(fakeProducts);
  }

  formatRapidAPIResults(products) {
    return products.map(product => ({
      id: `amazon_${product.asin}`,
      external_id: product.asin,
      name: product.product_title || 'Unknown Product',
      description: this.cleanDescription(product.product_title),
      price: this.extractPrice(product.product_price),
      price_range: this.generatePriceRange(this.extractPrice(product.product_price)),
      image_url: product.product_photo || '/placeholder-gift.jpg',
      buy_url: this.createAffiliateLink(product.product_url),
      amazon_url: product.product_url,
      rating: product.product_star_rating ? parseFloat(product.product_star_rating) : null,
      review_count: product.product_num_ratings ? parseInt(product.product_num_ratings) : 0,
      age_min: 3,
      age_max: 12,
      category: this.categorizeProduct(product.product_title),
      themes: ['general'],
      tags: this.extractTags(product.product_title),
      source: 'amazon',
      last_updated: new Date().toISOString(),
      is_active: true,
      popularity: this.calculatePopularity(product)
    }));
  }

  async getThemeBasedProducts(theme, age, limit = 10) {
    // Check theme cache first
    const cacheKey = `${theme}-${age}-${limit}`;
    const cached = themeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < THEME_CACHE_DURATION) {
      console.log('💾 Using cached theme products for:', theme);
      return cached.data;
    }

    const themeQueries = {
      superhero: ['superhero toys kids', 'batman toys children'],
      princess: ['princess dress up girls', 'princess toys tiara'],
      pirate: ['pirate costume kids', 'pirate ship toy'],
      football: ['football toys kids', 'football kit children'],
      dinosaur: ['dinosaur toys kids', 'dinosaur figures'],
      space: ['space toys kids', 'astronaut costume'],
      unicorn: ['unicorn toys girls', 'unicorn stuffed animal'],
      cars: ['toy cars kids', 'hot wheels cars']
    };

    const queries = themeQueries[theme] || [theme + ' toys kids'];
    
    // Use fake data for theme-based suggestions to preserve API quota
    console.log('🎨 Using cached/fake theme products for:', theme);
    const products = this.getFakeProducts(queries[0], limit);
    
    // Cache the results
    themeCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });
    
    return products;
  }

  // Helper methods remain the same
  extractPrice(priceString) {
    if (!priceString) return null;
    const cleanPrice = priceString.replace(/[£$,]/g, '');
    const match = cleanPrice.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  generatePriceRange(price) {
    if (!price) return 'Price varies';
    if (price < 10) return 'Under £10';
    if (price < 20) return '£10-20';
    if (price < 50) return '£20-50';
    return '£50+';
  }

  createAffiliateLink(amazonUrl) {
    if (!amazonUrl) return null;
    try {
      const url = new URL(amazonUrl);
      const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'partysnap-21';
      url.searchParams.set('tag', associateTag);
      return url.toString();
    } catch (error) {
      return amazonUrl;
    }
  }

  categorizeProduct(title) {
    if (!title) return 'toys';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('book')) return 'books';
    if (lowerTitle.includes('lego') || lowerTitle.includes('building')) return 'toys';
    if (lowerTitle.includes('art') || lowerTitle.includes('craft')) return 'art';
    if (lowerTitle.includes('dress') || lowerTitle.includes('costume')) return 'costumes';
    if (lowerTitle.includes('sport') || lowerTitle.includes('football')) return 'sports';
    if (lowerTitle.includes('game')) return 'games';
    return 'toys';
  }

  extractTags(title) {
    if (!title) return [];
    return title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5);
  }

  calculatePopularity(product) {
    let score = 50;
    if (product.product_star_rating) {
      score += parseFloat(product.product_star_rating) * 10;
    }
    if (product.product_num_ratings) {
      const reviews = parseInt(product.product_num_ratings);
      if (reviews > 100) score += 20;
      if (reviews > 1000) score += 10;
    }
    return Math.min(100, score);
  }

  cleanDescription(title) {
    if (!title) return '';
    return title.length > 100 ? title.substring(0, 100) + '...' : title;
  }
}

function generateFallbackProducts(query = 'general') {
  const fallbackProducts = [
    {
      asin: 'FALLBACK001',
      product_title: `${query} - Demo LEGO Building Set`,
      product_price: '£29.99',
      product_photo: 'https://images.unsplash.com/photo-1558060370-7c5b72b6a2e1?w=300',
      product_url: 'https://amazon.co.uk/dp/FALLBACK001',
      product_star_rating: '4.5',
      product_num_ratings: '234'
    },
    {
      asin: 'FALLBACK002',
      product_title: `${query} - Demo Art Supplies Kit`,
      product_price: '£18.99',
      product_photo: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300',
      product_url: 'https://amazon.co.uk/dp/FALLBACK002',
      product_star_rating: '4.2',
      product_num_ratings: '156'
    }
  ];

  const service = new RapidAPIProductService();
  return service.formatRapidAPIResults(fallbackProducts);
}

export async function POST(request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Reset counter daily
  if (Date.now() > resetTime) {
    requestCount = 0;
    resetTime = Date.now() + (24 * 60 * 60 * 1000);
    requestLog.length = 0;
    themeCache.clear(); // Clear theme cache on reset
    console.log('🔄 Daily request counter and cache reset');
  }

  try {
    const { theme, age, category, limit = 10, searchTerm } = await request.json();
    
    // Validate inputs
    if (!searchTerm && (!theme || theme === 'undefined' || !age)) {
      console.log('🚫 Skipping request - invalid theme or age:', { theme, age, searchTerm });
      return NextResponse.json({
        success: true,
        products: [],
        count: 0,
        requestCount,
        limit: REQUEST_LIMIT,
        remaining: REQUEST_LIMIT - requestCount,
        usingFallback: false,
        skipped: true,
        reason: 'Invalid theme or age parameters'
      });
    }
    
    const productService = new RapidAPIProductService();
    
    let products;
    let usingFallback = false;
    
    if (searchTerm) {
      // For actual search terms, check rate limit and make API calls
      if (requestCount >= REQUEST_LIMIT) {
        console.log(`🚫 Request limit exceeded: ${requestCount}/${REQUEST_LIMIT}`);
        products = generateFallbackProducts(searchTerm);
        usingFallback = true;
      } else {
        // Log the request
        const logEntry = {
          timestamp,
          query: searchTerm,
          age,
          requestNumber: requestCount + 1,
          type: 'search'
        };
        requestLog.push(logEntry);
        
        console.log(`📊 Search Request ${requestCount + 1}/${REQUEST_LIMIT}: "${searchTerm}" (age: ${age})`);
        
        // Increment counter for search requests
        requestCount++;
        
        products = await productService.searchAmazonProducts(searchTerm, limit);
        usingFallback = products.some(p => p.id.includes('FAKE'));
      }
    } else {
      // For theme-based products, use cached/fake data (no API calls)
      console.log('🎨 Getting cached theme-based products for:', theme);
      products = await productService.getThemeBasedProducts(theme, age, limit);
      usingFallback = true; // Theme products use fake data to preserve API quota
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Request completed in ${duration}ms. Found ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      requestCount,
      limit: REQUEST_LIMIT,
      remaining: REQUEST_LIMIT - requestCount,
      usingFallback,
      cacheHit: !searchTerm // Theme requests are always cached
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Request failed after ${duration}ms:`, error.message);
    
    // Don't count failed requests against limit
    
    return NextResponse.json({
      success: true,
      products: generateFallbackProducts(),
      usingFallback: true,
      error: error.message,
      requestCount,
      limit: REQUEST_LIMIT,
      remaining: REQUEST_LIMIT - requestCount
    });
  }
}

// Debug endpoint to check usage
export async function GET() {
  return NextResponse.json({
    requestCount,
    limit: REQUEST_LIMIT,
    remaining: REQUEST_LIMIT - requestCount,
    resetTime: new Date(resetTime).toISOString(),
    recentRequests: requestLog.slice(-10), // Last 10 requests
    status: requestCount >= REQUEST_LIMIT ? 'LIMIT_EXCEEDED' : 'ACTIVE'
  });
}