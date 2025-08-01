// Track usage and costs
export function logAPIUsage(endpoint, tokens, cost) {
    console.log(`API Usage - ${endpoint}: ${tokens} tokens, $${cost.toFixed(4)}`);
    
    // Send to your analytics service
    // analytics.track('ai_analysis_used', { tokens, cost, endpoint });
  }