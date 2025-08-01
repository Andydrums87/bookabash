import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIAnalyzer {
  constructor() {
    this.systemPrompt = `You are an expert at extracting entertainer/performer profile data from UK children's party websites. 

Your task is to analyze website content and extract structured data for a children's party entertainer profile.

IMPORTANT GUIDELINES:
- Focus on UK entertainers (magicians, clowns, princess characters, etc.)
- Be conservative with estimates - if unsure, use lower confidence scores
- Extract only information that is clearly stated or strongly implied
- For pricing, look for package prices, hourly rates, or add-on costs
- Age groups should be realistic for children's parties (0-2, 3-5, 6-8, 9-12, 13+)
- Equipment should be props/tools they bring to events
- Travel radius should be based on areas mentioned or estimated from location

CONFIDENCE SCORING:
- 90-100: Information explicitly stated on the website
- 70-89: Information strongly implied or inferred from context
- 50-69: Reasonable assumption based on industry standards
- Below 50: Wild guess (avoid these)

Return ONLY valid JSON with the exact structure requested.`;
  }

  async analyzeEntertainerProfile(scrapedData) {
    try {
      console.log('🤖 Starting AI analysis...');
      
      const analysisPrompt = `Please analyze this UK entertainer website and extract profile information:

WEBSITE DATA:
Title: ${scrapedData.title}
Description: ${scrapedData.description}
About Section: ${scrapedData.aboutSection}
Services Section: ${scrapedData.servicesSection}
Pricing Section: ${scrapedData.pricingSection}
Contact Section: ${scrapedData.contactSection}
Navigation: ${scrapedData.navItems?.join(', ')}
Headings: ${scrapedData.headings?.join(', ')}
Main Content (first 3000 chars): ${scrapedData.bodyText?.slice(0, 3000)}

EXTRACT INFORMATION FOR:
1. What type of performer (magician, clown, princess, etc.)
2. Age groups they cater to
3. Performance styles (shows, walkabout, workshops, etc.)
4. Equipment and props they provide
5. Years of experience and background
6. Travel radius and logistics
7. Any add-on services with pricing
8. Business information

Return ONLY this JSON structure:
{
  "performerType": "string - one of: Magician, Clown, Princess Character, Superhero, Scientist, Balloon Artist, Face Painter, Musician, Storyteller, Puppeteer, DJ, Entertainer",
  "ageGroups": ["array of strings - '0-2 years', '3-5 years', '6-8 years', '9-12 years', '13+ years', 'All ages'"],
  "performanceStyle": ["array of strings - 'Interactive Show', 'Walkabout Entertainment', 'Workshops', 'Games & Activities', 'Educational', 'Musical Performance'"],
  "equipment": "string - description of props/equipment they provide",
  "travelRadius": "number - miles they travel (estimate 15-30 if not specified)",
  "setupTime": "number - setup time in minutes (estimate 20-45)",
  "specialSkills": "string - qualifications, training, or unique skills",
  "groupSizeMin": "number - minimum group size (default 1)",
  "groupSizeMax": "number - maximum group size (estimate 20-50)",
  "personalBio": {
    "yearsExperience": "string - years of experience",
    "inspiration": "string - what motivates them",
    "favoriteEvent": "string - memorable event description",
    "personalStory": "string - background and what makes them special"
  },
  "addOnServices": [
    {
      "name": "string - service name",
      "price": "number - price in GBP (only if clearly stated)",
      "description": "string - what this includes",
      "category": "string - 'enhancement', 'time', 'premium', 'logistics', or 'seasonal'"
    }
  ],
  "businessInfo": {
    "businessName": "string - business/performer name",
    "description": "string - business description",
    "location": "string - city/area they're based",
    "contactEmail": "string - email if found",
    "contactPhone": "string - phone if found"
  },
  "confidence": {
    "performerType": "number 1-100",
    "services": "number 1-100", 
    "experience": "number 1-100",
    "pricing": "number 1-100",
    "overall": "number 1-100"
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user", 
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      console.log('🤖 Raw AI response length:', content.length);
      
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('AI returned invalid JSON format');
      }
      
      // Validate and clean the data
      const cleanedData = this.validateAndCleanData(parsedData);
      console.log('✅ AI analysis complete');
      
      return cleanedData;

    } catch (error) {
      console.error('❌ AI Analysis Error:', error);
      
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured properly');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded');
      } else if (error.message.includes('rate limit')) {
        throw new Error('OpenAI API rate limit reached. Please try again in a moment.');
      }
      
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  validateAndCleanData(data) {
    // Ensure all required fields have sensible defaults
    const cleaned = {
      performerType: data.performerType || 'Entertainer',
      ageGroups: Array.isArray(data.ageGroups) ? data.ageGroups : [],
      performanceStyle: Array.isArray(data.performanceStyle) ? data.performanceStyle : [],
      equipment: data.equipment || '',
      travelRadius: Math.min(100, Math.max(5, parseInt(data.travelRadius) || 20)),
      setupTime: Math.min(120, Math.max(10, parseInt(data.setupTime) || 30)),
      specialSkills: data.specialSkills || '',
      groupSizeMin: Math.max(1, parseInt(data.groupSizeMin) || 1),
      groupSizeMax: Math.min(200, Math.max(5, parseInt(data.groupSizeMax) || 30)),
      personalBio: {
        yearsExperience: data.personalBio?.yearsExperience || '',
        inspiration: data.personalBio?.inspiration || '',
        favoriteEvent: data.personalBio?.favoriteEvent || '',
        personalStory: data.personalBio?.personalStory || ''
      },
      addOnServices: Array.isArray(data.addOnServices) ? data.addOnServices.map((addon, index) => ({
        id: `ai-${Date.now()}-${index}`,
        name: addon.name || '',
        price: Math.max(0, parseInt(addon.price) || 0),
        description: addon.description || '',
        category: ['enhancement', 'time', 'premium', 'logistics', 'seasonal'].includes(addon.category) 
          ? addon.category 
          : 'enhancement'
      })).filter(addon => addon.name && addon.price > 0) : [],
      businessInfo: {
        businessName: data.businessInfo?.businessName || '',
        description: data.businessInfo?.description || '',
        location: data.businessInfo?.location || '',
        contactEmail: data.businessInfo?.contactEmail || '',
        contactPhone: data.businessInfo?.contactPhone || ''
      },
      confidence: {
        performerType: Math.min(100, Math.max(0, parseInt(data.confidence?.performerType) || 50)),
        services: Math.min(100, Math.max(0, parseInt(data.confidence?.services) || 50)),
        experience: Math.min(100, Math.max(0, parseInt(data.confidence?.experience) || 50)),
        pricing: Math.min(100, Math.max(0, parseInt(data.confidence?.pricing) || 30)),
        overall: Math.min(100, Math.max(0, parseInt(data.confidence?.overall) || 50))
      }
    };

    return cleaned;
  }
}

export default new AIAnalyzer();