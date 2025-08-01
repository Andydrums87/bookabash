import { NextResponse } from 'next/server';

// Import with absolute path using @ alias
import scraper from '@/lib/webscraper';
import aiAnalyzer from '@/lib/aiAnalyzer';

// Simple rate limiting with Map (for production, use Redis)
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limit = rateLimit.get(ip);
  
  if (now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Analysis API is working!',
    timestamp: new Date().toISOString(),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY
  });
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Too many requests, please try again later.'
      }, { status: 429 });
    }

    const body = await request.json();
    const { url, serviceType = 'entertainer' } = body;

    console.log(`🔍 AI Analysis request for: ${url}`);

    // Validate input
    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL is required' 
      }, { status: 400 });
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      // Basic security check
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid URL format. Please include http:// or https://' 
      }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API key not found, returning mock data');
      
      // Return mock data if no API key
      const mockData = {
        performerType: 'Magician',
        ageGroups: ['3-5 years', '6-8 years', '9-12 years'],
        performanceStyle: ['Interactive Show', 'Games & Activities'],
        equipment: 'Professional magic props, sound system, wireless microphone (MOCK DATA)',
        travelRadius: 25,
        setupTime: 45,
        specialSkills: 'Close-up magic, stage illusions, balloon modeling (MOCK DATA)',
        groupSizeMin: 5,
        groupSizeMax: 40,
        personalBio: {
          yearsExperience: '8',
          inspiration: 'Creating moments of wonder (MOCK DATA)',
          favoriteEvent: 'Mock event description',
          personalStory: 'Mock personal story for testing'
        },
        addOnServices: [
          { id: 'mock-1', name: 'Face Painting', price: 50, description: 'Mock service', category: 'enhancement' }
        ],
        businessInfo: {
          businessName: 'Mock Business Name',
          description: 'Mock business description',
          location: 'London, UK',
          contactEmail: 'mock@example.com',
          contactPhone: '07123 456789'
        },
        confidence: {
          performerType: 95,
          services: 88,
          experience: 85,
          pricing: 70,
          overall: 85
        }
      };

      return NextResponse.json({
        success: true,
        data: mockData,
        metadata: {
          analyzedAt: new Date().toISOString(),
          sourceUrl: url,
          serviceType: serviceType,
          mockData: true,
          reason: 'No OpenAI API key configured'
        }
      });
    }

    // Step 1: Scrape the website
    console.log('📄 Scraping website...');
    let scrapedData;
    try {
      scrapedData = await scraper.scrapeWebsite(url);
    } catch (scrapeError) {
      console.error('❌ Scraping failed:', scrapeError.message);
      return NextResponse.json({
        success: false,
        error: 'Unable to access website. Please check the URL is correct and publicly accessible.'
      }, { status: 400 });
    }
    
    if (!scrapedData.bodyText || scrapedData.bodyText.length < 200) {
      return NextResponse.json({
        success: false,
        error: 'Website appears to be empty or has very little content. Please check the URL.'
      }, { status: 400 });
    }

    // Step 2: Analyze with AI
    console.log('🤖 Analyzing with AI...');
    let profileData;
    try {
      if (serviceType === 'entertainer') {
        profileData = await aiAnalyzer.analyzeEntertainerProfile(scrapedData);
      } else {
        return NextResponse.json({
          success: false,
          error: 'Service type not supported yet'
        }, { status: 400 });
      }
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError.message);
      return NextResponse.json({
        success: false,
        error: aiError.message.includes('API key') || aiError.message.includes('quota') || aiError.message.includes('rate limit')
          ? aiError.message
          : 'AI analysis failed. Please try again.'
      }, { status: 500 });
    }

    // Step 3: Return results
    console.log('✅ Analysis complete successfully');
    return NextResponse.json({
      success: true,
      data: profileData,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sourceUrl: url,
        serviceType: serviceType,
        contentLength: scrapedData.bodyText.length,
        realAnalysis: true
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}