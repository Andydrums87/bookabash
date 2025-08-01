import React, { useState } from 'react';
import { Sparkles, Globe, Loader2, CheckCircle, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DebugAIAssistant = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('https://example.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const handleAIAnalysis = async () => {
    console.log('🔍 Starting AI analysis for:', websiteUrl);
    
    if (!websiteUrl) {
      alert('Please enter your website URL first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    
    try {
      console.log('📡 Making request to /api/ai-analyze-website');
      
      const response = await fetch('/api/ai-analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl,
          serviceType: 'entertainer'
        })
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      
      if (result.success) {
        setAiSuggestions(result.data);
        setAnalysisComplete(true);
        console.log('✅ AI Analysis successful:', result.data);
      } else {
        setAnalysisError(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Analysis request failed:', error);
      setAnalysisError(`Network error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testMockData = () => {
    console.log('🧪 Testing with mock data');
    const mockData = {
      performerType: 'Magician',
      ageGroups: ['3-5 years', '6-8 years'],
      equipment: 'Magic props, sound system',
      confidence: {
        performerType: 95,
        services: 80,
        overall: 85
      }
    };
    setAiSuggestions(mockData);
    setAnalysisComplete(true);
  };

  return (
    <div className="space-y-8 p-4">
      {/* Debug Info */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Debug Mode:</strong> Modal state: {showAIAssistant ? 'Open' : 'Closed'} | 
          Analyzing: {isAnalyzing ? 'Yes' : 'No'} | 
          Complete: {analysisComplete ? 'Yes' : 'No'}
        </AlertDescription>
      </Alert>

      {/* AI Assistant Trigger */}
      <Card className="border-2 border-dashed border-primary-300 bg-gradient-to-r from-primary-50 to-blue-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">AI Assistant Debug</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://www.example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="h-12 text-base border-2 border-gray-200"
                />
              </div>
              <Button 
                onClick={() => {
                  console.log('🔧 Opening AI Assistant modal');
                  setShowAIAssistant(true);
                }}
                disabled={!websiteUrl}
                className="bg-primary-500 hover:bg-primary-600 h-12 px-8 font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                AI Assistant
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={testMockData}
                variant="outline"
                size="sm"
              >
                🧪 Test Mock Data
              </Button>
              <Button 
                onClick={() => console.log('Current state:', { 
                  showAIAssistant, 
                  isAnalyzing, 
                  analysisComplete, 
                  aiSuggestions,
                  analysisError 
                })}
                variant="outline"
                size="sm"
              >
                🔍 Log State
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close if clicking backdrop
            if (e.target === e.currentTarget) {
              console.log('🔧 Closing modal via backdrop');
              setShowAIAssistant(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary-500" />
                  AI Profile Assistant (Debug Mode)
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    console.log('🔧 Closing modal via X button');
                    setShowAIAssistant(false);
                    setAnalysisComplete(false);
                    setAiSuggestions(null);
                    setAnalysisError('');
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Error State */}
              {analysisError && (
                <Alert className="border-red-200 bg-red-50 mb-6">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {analysisError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Initial State */}
              {!isAnalyzing && !analysisComplete && !analysisError && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="w-10 h-10 text-primary-600" />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Ready to Analyze</h4>
                    <p className="text-gray-600 mb-4">
                      URL: <span className="font-medium text-primary-600">{websiteUrl}</span>
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Business info & description</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Performance types & styles</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Equipment & props</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Age groups & pricing</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAIAnalysis}
                      className="bg-primary-500 hover:bg-primary-600 px-8 py-3 text-lg font-semibold"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Analysis
                    </Button>
                    <Button 
                      onClick={testMockData}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      🧪 Use Mock Data
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="text-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Advanced AI Analysis in Progress...</h4>
                    <p className="text-gray-600 mb-6">This advanced analysis takes 25-45 seconds for comprehensive results</p>
                    
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        <span>📸 Taking full page screenshot...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-500"></div>
                        <span>📝 Extracting comprehensive content...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-1000"></div>
                        <span>🤖 GPT-4 Vision analyzing screenshot + content...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-1500"></div>
                        <span>🎯 Generating detailed profile data...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {analysisComplete && aiSuggestions && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Analysis Complete!</h4>
                    <p className="text-gray-600">Here's what we found:</p>
                  </div>

                  {/* Results */}
                  <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {/* Performer Type */}
                    {aiSuggestions.performerType && (
                      <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">Performer Type</h5>
                          <span className="text-xs font-medium text-green-700">
                            {aiSuggestions.confidence?.performerType || 85}% confident
                          </span>
                        </div>
                        <p className="font-medium text-primary-600">{aiSuggestions.performerType}</p>
                      </div>
                    )}

                    {/* Age Groups */}
                    {aiSuggestions.ageGroups && aiSuggestions.ageGroups.length > 0 && (
                      <div className="p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">Age Groups</h5>
                          <span className="text-xs font-medium text-yellow-700">
                            {aiSuggestions.confidence?.services || 80}% confident
                          </span>
                        </div>
                        <p className="text-sm">{aiSuggestions.ageGroups.join(', ')}</p>
                      </div>
                    )}

                    {/* Equipment */}
                    {aiSuggestions.equipment && (
                      <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">Equipment & Props</h5>
                          <span className="text-xs font-medium text-blue-700">
                            {aiSuggestions.confidence?.overall || 85}% confident
                          </span>
                        </div>
                        <p className="text-sm">{aiSuggestions.equipment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAnalysisComplete(false);
                        setAiSuggestions(null);
                      }}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => {
                        console.log('✅ Applying suggestions:', aiSuggestions);
                        alert('Suggestions would be applied to your form!');
                        setShowAIAssistant(false);
                      }}
                      className="flex-1 bg-primary-500 hover:bg-primary-600"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Apply Suggestions
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugAIAssistant;