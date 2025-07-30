// src/utils/rapidAPIProducts.js
class RapidAPIProductService {
    constructor() {
      this.apiKey = process.env.RAPIDAPI_KEY;
      this.baseURL = 'https://real-time-amazon-data.p.rapidapi.com';
      console.log('🔧 RapidAPI Service initialized, API key exists:', !!this.apiKey);
    }
  
    // Search Amazon products via RapidAPI
    async searchAmazonProducts(query, maxResults = 10) {
      // TEMPORARY: Use fake data until API key is fixed
      if (!this.apiKey) {
        console.log('⚠️ No API key found, using fake data for:', query);
        return this.getFakeProducts(query, maxResults);
      }
  
      try {
        console.log('🔍 Searching Amazon for:', query);
        
        const response = await fetch(`${this.baseURL}/search`, {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: query,
            page: 1,
            country: 'UK',
            sort_by: 'RELEVANCE',
            product_condition: 'ALL'
          })
        });
  
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (data.status === 'OK' && data.data?.products) {
          console.log('✅ Found', data.data.products.length, 'products');
          return this.formatRapidAPIResults(data.data.products.slice(0, maxResults));
        } else {
          console.error('❌ API Error:', data);
          return this.getFakeProducts(query, maxResults); // Fallback to fake
        }
      } catch (error) {
        console.error('❌ RapidAPI search error:', error);
        console.log('🔄 Falling back to fake data...');
        return this.getFakeProducts(query, maxResults); // Fallback to fake
      }
    }
  
    // Temporary fake products for testing
    getFakeProducts(query, maxResults) {
      const fakeProducts = [
        {
          asin: 'FAKE001',
          product_title: `${query} - LEGO Batman Batcave Building Set`,
          product_price: '£89.99',
          product_photo: 'https://images.unsplash.com/photo-1558060370-7c5b72b6a2e1?w=300',
          product_url: 'https://amazon.co.uk/dp/FAKE001',
          product_star_rating: '4.8',
          product_num_ratings: '1247'
        },
        {
          asin: 'FAKE002', 
          product_title: `${query} - Superhero Cape and Mask Set`,
          product_price: '£16.99',
          product_photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
          product_url: 'https://amazon.co.uk/dp/FAKE002',
          product_star_rating: '4.3',
          product_num_ratings: '856'
        },
        {
          asin: 'FAKE003',
          product_title: `${query} - Marvel Action Figures 6-Pack`,
          product_price: '£34.99', 
          product_photo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300',
          product_url: 'https://amazon.co.uk/dp/FAKE003',
          product_star_rating: '4.6',
          product_num_ratings: '432'
        }
      ];
  
      return this.formatRapidAPIResults(fakeProducts.slice(0, maxResults));
    }
  
    // Get theme-based products
    async getThemeBasedProducts(theme, age, limit = 10) {
      const themeQueries = {
        superhero: [
          'superhero toys kids',
          'batman toys children'
        ],
        princess: [
          'princess dress up girls',
          'princess toys tiara'
        ],
        pirate: [
          'pirate costume kids',
          'pirate ship toy'
        ],
        football: [
          'football toys kids',
          'football kit children'
        ]
      };
  
      const queries = themeQueries[theme] || [theme + ' toys kids'];
      const allProducts = [];
  
      // Search with first query only to start (avoid API limits)
      try {
        const products = await this.searchAmazonProducts(queries[0], limit);
        allProducts.push(...products);
      } catch (error) {
        console.error(`Error searching for ${queries[0]}:`, error);
      }
  
      return this.removeDuplicates(allProducts).slice(0, limit);
    }
  
    // Format API results to our structure
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
  
    // Helper methods
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
        return amazonUrl; // Return original if URL parsing fails
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
  
    removeDuplicates(products) {
      const seen = new Set();
      return products.filter(product => {
        if (seen.has(product.external_id)) {
          return false;
        }
        seen.add(product.external_id);
        return true;
      });
    }
  }
  
  // Enhanced suggestions function
  export async function getEnhancedGiftSuggestions(theme, age, category = null, limit = 20) {
    try {
      console.log('🎁 Getting enhanced gift suggestions for:', { theme, age, category });
      
      const rapidAPI = new RapidAPIProductService();
      
      // Get both curated and real products
      const curatedLimit = Math.ceil(limit / 2);
      const realLimit = Math.ceil(limit / 2);
      
      const [curatedResult, realProducts] = await Promise.allSettled([
        // Your existing curated suggestions
        getCuratedSuggestions(theme, age, category, curatedLimit),
        // Real Amazon products
        rapidAPI.getThemeBasedProducts(theme, age, realLimit)
      ]);
  
      const curated = curatedResult.status === 'fulfilled' && curatedResult.value.success 
        ? curatedResult.value.suggestions 
        : [];
        
      const real = realProducts.status === 'fulfilled' 
        ? realProducts.value 
        : [];
  
      console.log('📊 Results:', { curated: curated.length, real: real.length });
      
      // Interleave curated and real products
      const combined = [];
      const maxLength = Math.max(curated.length, real.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (curated[i]) combined.push({ ...curated[i], source: 'curated' });
        if (real[i]) combined.push({ ...real[i], source: 'amazon' });
      }
  
      return { success: true, suggestions: combined.slice(0, limit) };
    } catch (error) {
      console.error('❌ Error getting enhanced suggestions:', error);
      // Fallback to curated only
      return getCuratedSuggestions(theme, age, category, limit);
    }
  }
  
  // Fallback to your existing curated suggestions
  async function getCuratedSuggestions(theme, age, category, limit) {
    // This will use your existing database method
    const { partyDatabaseBackend } = await import('./partyDatabaseBackend');
    return partyDatabaseBackend.getGiftSuggestions(theme, age, category, limit);
  }
  
  export { RapidAPIProductService };