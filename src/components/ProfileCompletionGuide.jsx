import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Camera, 
  DollarSign, 
  FileText, 
  User, 
  Mail,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';

const getIconForField = (field) => {
  const iconMap = {
    'portfolioImages': Camera,
    'extraHourRate': DollarSign,
    'aboutUs': FileText,
    'owner.name': User,
    'owner.email': Mail,
    'businessName': FileText,
    'serviceDetails.venueType': MapPin
  };
  return iconMap[field] || FileText;
};

const mockSteps = [
  {
    id: 1,
    title: "Basic Information",
    fields: [
      {
        field: 'owner.name',
        displayName: 'Contact Person',
        completed: true,
        estimatedTime: '1 min',
        helpText: 'Your full name as the business contact',
        impact: 'Essential for customer trust'
      },
      {
        field: 'owner.email',
        displayName: 'Email Address',
        completed: true,
        estimatedTime: '1 min',
        helpText: 'Primary email for booking notifications',
        impact: 'Required for booking system'
      }
    ],
    completed: true,
    estimatedTime: '2 min'
  },
  {
    id: 2,
    title: "Business Details",
    fields: [
      {
        field: 'businessName',
        displayName: 'Business Name',
        completed: true,
        estimatedTime: '1 min',
        helpText: 'Your official business name',
        impact: 'How customers will identify you'
      },
      {
        field: 'aboutUs',
        displayName: 'Business Description',
        completed: false,
        estimatedTime: '5 min',
        helpText: 'Write a compelling description (minimum 10 words)',
        impact: 'Increases bookings by 40%',
        priority: 'high'
      }
    ],
    completed: false,
    estimatedTime: '6 min'
  },
  {
    id: 3,
    title: "Pricing & Rates",
    fields: [
      {
        field: 'extraHourRate',
        displayName: 'Extra Hour Rate',
        completed: false,
        estimatedTime: '2 min',
        helpText: 'Set your hourly rate for extending events',
        impact: 'Enables extended booking options',
        priority: 'high'
      }
    ],
    completed: false,
    estimatedTime: '2 min'
  },
  {
    id: 4,
    title: "Portfolio & Media",
    fields: [
      {
        field: 'portfolioImages',
        displayName: 'Portfolio Photos',
        completed: false,
        estimatedTime: '10 min',
        helpText: 'Add at least 3 high-quality photos of your work',
        impact: 'Profiles with photos get 5x more views',
        priority: 'high'
      }
    ],
    completed: false,
    estimatedTime: '10 min'
  }
];

export default function ProfileCompletionGuide() {
  const [currentStep, setCurrentStep] = useState(2); // First incomplete step
  const [expandedStep, setExpandedStep] = useState(null);

  const completedSteps = mockSteps.filter(step => step.completed).length;
  const totalSteps = mockSteps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  const totalEstimatedTime = mockSteps
    .filter(step => !step.completed)
    .reduce((total, step) => total + parseInt(step.estimatedTime), 0);

  const handleStepClick = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleFieldAction = (field) => {
    // Navigate to specific section
    const urlMap = {
      'portfolioImages': '/suppliers/media',
      'extraHourRate': '/suppliers/profile#pricing',
      'aboutUs': '/suppliers/profile#about'
    };
    window.location.href = urlMap[field] || '/suppliers/profile';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-blue-900 mb-2">Profile Setup Guide</CardTitle>
              <p className="text-blue-700 text-sm mb-3">
                Complete these steps to go live and start receiving bookings
              </p>
              <Progress value={overallProgress} className="h-2 bg-blue-100" />
              <p className="text-xs text-blue-600 mt-1">
                {completedSteps} of {totalSteps} steps complete • {totalEstimatedTime} min remaining
              </p>
            </div>
            <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
              {Math.round(overallProgress)}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-0">
            {mockSteps.map((step, index) => {
              const isExpanded = expandedStep === step.id;
              const isCurrent = step.id === currentStep;
              const incompleteFields = step.fields.filter(f => !f.completed);
              
              return (
                <div
                  key={step.id}
                  className={`border-b border-gray-200 ${isCurrent ? 'bg-blue-50' : step.completed ? 'bg-green-50' : 'bg-white'}`}
                >
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          step.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : isCurrent
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-bold">{step.id}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-medium ${step.completed ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-700'}`}>
                            {step.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.estimatedTime}
                            </span>
                            {!step.completed && incompleteFields.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                                {incompleteFields.length} item{incompleteFields.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {step.completed && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Complete
                          </Badge>
                        )}
                        {isCurrent && !step.completed && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="ml-11 space-y-3">
                        {step.fields.map((field) => {
                          const FieldIcon = getIconForField(field.field);
                          return (
                            <div
                              key={field.field}
                              className={`p-3 rounded-lg border ${
                                field.completed 
                                  ? 'bg-green-50 border-green-200' 
                                  : field.priority === 'high'
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-5 h-5 mt-0.5 ${
                                    field.completed ? 'text-green-600' : 'text-gray-400'
                                  }`}>
                                    <FieldIcon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900">
                                        {field.displayName}
                                      </h4>
                                      {field.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400" />
                                      )}
                                      {field.priority === 'high' && (
                                        <Badge className="bg-red-100 text-red-800 text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {field.helpText}
                                    </p>
                                    {field.impact && (
                                      <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                                        <TrendingUp className="w-3 h-3" />
                                        {field.impact}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {field.estimatedTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!field.completed && (
                                  <Button 
                                    size="sm"
                                    className={field.priority === 'high' ? 'bg-red-600 hover:bg-red-700' : ''}
                                    onClick={() => handleFieldAction(field.field)}
                                  >
                                    Complete
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                Continue Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="sm:flex-shrink-0">
                Preview Profile
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Complete all steps to enable the "Go Live" option
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}