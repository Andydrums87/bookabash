import scraper from './lib/webscraper.js';
import aiAnalyzer from './lib/aiAnalyzer.js';

async function testAnalysis() {
  const testUrl = 'https://www.snakes-and-ladders.co.uk/';
  
  try {
    console.log('🔍 Testing scraper...');
    const scrapedData = await scraper.scrapeWebsite(testUrl);
    console.log('✅ Scraping successful');
    
    console.log('🤖 Testing AI analysis...');
    const analysisResult = await aiAnalyzer.analyzeEntertainerProfile(scrapedData);
    console.log('✅ Analysis successful:', analysisResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await scraper.close();
  }
}

testAnalysis();