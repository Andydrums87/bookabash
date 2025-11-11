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

  async searchAmazonProducts(query, maxResults = 10, page = 1) {
    if (!this.apiKey) {
      console.log('⚠️ No API key found, using fake data for:', query);
      return {
        products: this.getFakeProducts(query, maxResults, page),
        hasMore: page < 10,  // INCREASED: Allow 10 pages of fake data
        totalResults: 200,   // INCREASED: More realistic total
        currentPage: page
      };
    }
    

    try {
      console.log('🔍 Searching Amazon for:', query, 'Page:', page);
      
      const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&country=GB&sort_by=RELEVANCE&product_condition=ALL`;
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
      const data = JSON.parse(result);
      
      if (data.status === 'OK' && data.data?.products) {
        console.log('✅ Found', data.data.products.length, 'real Amazon UK products');
        return {
          products: this.formatRapidAPIResults(data.data.products.slice(0, maxResults)),
          hasMore: data.data.products.length >= maxResults || page < 5,  // IMPROVED LOGIC
          totalResults: data.data.total_products || Math.max(data.data.products.length * 3, 100),
          currentPage: page
        };
      } else if (data.products && Array.isArray(data.products)) {
        console.log('✅ Found', data.products.length, 'real Amazon UK products');
        return {
          products: this.formatRapidAPIResults(data.products.slice(0, maxResults)),
          hasMore: data.products.length === maxResults,
          totalResults: data.total_results || data.products.length,
          currentPage: page
        };
      } else {
        throw new Error('No products found in response');
      }
    } catch (error) {
      console.error('❌ RapidAPI search error:', error);
      console.log('🔄 Falling back to fake data...');
      return {
        products: this.getFakeProducts(query, maxResults, page),
        hasMore: page < 10,  // INCREASED: Allow 10 pages of fake data  
        totalResults: 200,   // INCREASED: More realistic total
        currentPage: page
      };
    }
  }
  async getTrendingProducts(childAge, limit = 20, page = 1) {
    const trendingQueries = this.getTrendingQueriesForAge(childAge);
    
    // Randomly select a trending category to keep it fresh
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    
    console.log('🔥 Getting trending products for age', childAge, 'with query:', randomQuery);
    
    return await this.searchAmazonProducts(randomQuery, limit, page);
  }

  // NEW METHOD: Get age-appropriate trending search terms
  getTrendingQueriesForAge(age) {
    if (age <= 3) {
      return [
        'toddler educational toys',
        'soft toys baby',
        'wooden toys toddler',
        'musical toys toddler',
        'stacking toys',
        'push pull toys'
      ];
    } else if (age <= 6) {
      return [
        'kids art supplies',
        'preschool learning toys',
        'building blocks kids',
        'dress up costumes kids',
        'puzzles children 4-6',
        'outdoor toys kids'
      ];
    } else if (age <= 10) {
      return [
        'lego sets kids',
        'science kits children',
        'board games kids',
        'craft kits kids',
        'sports equipment kids',
        'books children 7-10'
      ];
    } else {
      return [
        'teen gadgets',
        'books young adult',
        'art supplies teens',
        'board games family',
        'sports equipment teens',
        'stem toys teens'
      ];
    }
  }
  async getBrowseProducts(category, childAge, limit = 20, page = 1) {
    const categoryQueries = {
      toys: ['popular toys kids', 'trending toys ' + new Date().getFullYear()],
      books: ['popular children books', 'kids books age ' + childAge],
      art: ['art supplies kids', 'craft kits children'],
      games: ['board games kids', 'family games'],
      sports: ['sports toys kids', 'outdoor games children'],
      clothes: ['kids clothes age ' + childAge, 'children clothing']
    };

    const queries = categoryQueries[category] || categoryQueries.toys;
    const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
    
    return await this.searchAmazonProducts(selectedQuery, limit, page);
  }

  getFakeProducts(query, maxResults, page = 1) {
    // Generate different products for different pages
    const baseProducts = [
      { title: `LEGO Classic Creative Bricks Set`, price: '£29.99', rating: '4.8', reviews: '1247' },
      { title: `Hot Wheels Track Builder Mega Set`, price: '£45.99', rating: '4.6', reviews: '856' },
      { title: `Playmobil Adventure Playground`, price: '£34.99', rating: '4.7', reviews: '432' },
      { title: `Nerf Elite Disruptor Blaster`, price: '£24.99', rating: '4.4', reviews: '623' },
      { title: `Barbie Dreamhouse Adventures`, price: '£89.99', rating: '4.5', reviews: '341' },
      { title: `PAW Patrol Ultimate Rescue Vehicle`, price: '£39.99', rating: '4.6', reviews: '567' },
      { title: `Pokemon Trading Card Game Battle Academy`, price: '£19.99', rating: '4.3', reviews: '234' },
      { title: `Monopoly Junior Board Game`, price: '£14.99', rating: '4.4', reviews: '445' },
      { title: `Razor A3 Kick Scooter`, price: '£49.99', rating: '4.7', reviews: '321' },
      { title: `Fisher-Price Laugh & Learn Puppy`, price: '£27.99', rating: '4.8', reviews: '789' },
      // Page 2 products
      { title: `Crayola Super Art Coloring Kit`, price: '£22.99', rating: '4.5', reviews: '456' },
      { title: `Jenga Classic Block Game`, price: '£9.99', rating: '4.3', reviews: '234' },
      { title: `Remote Control Stunt Car`, price: '£35.99', rating: '4.6', reviews: '678' },
      { title: `Melissa & Doug Wooden Puzzle`, price: '£12.99', rating: '4.7', reviews: '345' },
      { title: `National Geographic Break Open Geodes`, price: '£18.99', rating: '4.4', reviews: '567' },
      // Page 3 products
      { title: `UNO Card Game`, price: '£6.99', rating: '4.5', reviews: '890' },
      { title: `Play-Doh Kitchen Creations`, price: '£16.99', rating: '4.3', reviews: '432' },
      { title: `Kinetic Sand Sandbox Set`, price: '£28.99', rating: '4.6', reviews: '654' },
      { title: `Rubik's Cube Original 3x3`, price: '£8.99', rating: '4.4', reviews: '321' },
      { title: `Thames & Kosmos Chemistry Set`, price: '£42.99', rating: '4.7', reviews: '234' }
    ];

    const startIndex = (page - 1) * maxResults;
    const endIndex = startIndex + maxResults;
    const pageProducts = baseProducts.slice(startIndex, endIndex);
    
    const fakeProducts = pageProducts.map((product, index) => ({
      asin: `FAKE${page}${String(index + 1).padStart(2, '0')}`,
      product_title: product.title,
      product_price: product.price,
      product_photo: `https://images.unsplash.com/photo-${1558060370 + startIndex + index}?w=300`,
      product_url: `https://amazon.co.uk/dp/FAKE${page}${String(index + 1).padStart(2, '0')}`,
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
    themeCache.clear();
    console.log('🔄 Daily request counter and cache reset');
  }

  try {
    const {
      theme,
      age,
      category,
      limit = 20,        // CHANGED: Increased from 10 to 20
      page = 1,          // NEW: Added pagination support
      searchTerm,
      mode = 'trending',  // NEW: Added mode parameter
      keywords           // NEW: Personalization keywords
    } = await request.json();

    const productService = new RapidAPIProductService();
    let result;
    let usingFallback = false;

    // Rate limit check
    const shouldUseAPI = requestCount < REQUEST_LIMIT;

    // NEW: Handle different modes
    switch (mode) {
      case 'search':
        if (!searchTerm) {
          return NextResponse.json({
            success: false,
            error: 'Search term is required for search mode',
            products: [],
            hasMore: false
          });
        }

        if (shouldUseAPI) {
          requestCount++;
          const logEntry = {
            timestamp,
            query: searchTerm,
            age,
            page,
            requestNumber: requestCount,
            type: 'search'
          };
          requestLog.push(logEntry);
          console.log(`📊 Search Request ${requestCount}/${REQUEST_LIMIT}: "${searchTerm}" (age: ${age}, page: ${page})`);
        }

        result = await productService.searchAmazonProducts(searchTerm, limit, page);
        break;
        
      case 'category':
        if (!category || !age) {
          return NextResponse.json({
            success: false,
            error: 'Category and age are required for category mode',
            products: [],
            hasMore: false
          });
        }
        
        if (shouldUseAPI) {
          requestCount++;
          const logEntry = {
            timestamp,
            query: `category:${category}`,
            age,
            page,
            requestNumber: requestCount,
            type: 'category'
          };
          requestLog.push(logEntry);
        }
        
        result = await productService.getBrowseProducts(category, age, limit, page);
        break;
        
      case 'trending':
      default:
        if (!age) {
          return NextResponse.json({
            success: false,
            error: 'Age is required for trending products',
            products: [],
            hasMore: false
          });
        }

        // If keywords provided (from personalization), search with those instead
        if (keywords && keywords.trim()) {
          console.log('🎯 Using personalized keywords for trending:', keywords);

          if (shouldUseAPI) {
            requestCount++;
            const logEntry = {
              timestamp,
              query: `personalized:${keywords}`,
              age,
              page,
              requestNumber: requestCount,
              type: 'personalized-trending'
            };
            requestLog.push(logEntry);
            console.log(`🎯 Personalized Request ${requestCount}/${REQUEST_LIMIT}: "${keywords}" (age: ${age}, page: ${page})`);
          }

          result = await productService.searchAmazonProducts(keywords, limit, page);
        } else {
          if (shouldUseAPI) {
            requestCount++;
            const logEntry = {
              timestamp,
              query: `trending:age${age}`,
              age,
              page,
              requestNumber: requestCount,
              type: 'trending'
            };
            requestLog.push(logEntry);
            console.log(`🔥 Trending Request ${requestCount}/${REQUEST_LIMIT}: age ${age}, page ${page}`);
          }

          result = await productService.getTrendingProducts(age, limit, page);
        }
        break;
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${mode} request completed in ${duration}ms. Found ${result.products?.length || 0} products`);
    
    return NextResponse.json({
      success: true,
      products: result.products || result,
      count: result.products?.length || result?.length || 0,
      hasMore: result.hasMore || false,          // NEW: Pagination info
      totalResults: result.totalResults || 0,    // NEW: Total count
      currentPage: result.currentPage || page,   // NEW: Current page
      requestCount,
      limit: REQUEST_LIMIT,
      remaining: REQUEST_LIMIT - requestCount,
      usingFallback: !shouldUseAPI || result.products?.some(p => p.id.includes('FAKE')),
      mode  // NEW: Return the mode used
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Request failed after ${duration}ms:`, error.message);
    
    return NextResponse.json({
      success: true,
      products: generateFallbackProducts(),
      hasMore: false,
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