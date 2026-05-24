import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Target, Users, PenTool, Calendar, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

const onboardingSteps = [
  {
    id: 'purpose',
    title: 'What brings you to ShipOS?',
    description: 'Help us understand your goals so we can personalize your experience',
    icon: Target,
    multiSelect: false,
    options: [
      { value: 'content-creation', label: 'Content Creation', description: 'Building a personal brand and sharing ideas' },
      { value: 'growth-marketing', label: 'Growth Marketing', description: 'Growing my business or product on Twitter' },
      { value: 'agency-work', label: 'Agency Work', description: 'Managing Twitter accounts for clients' },
      { value: 'ghostwriting', label: 'Ghostwriting', description: 'Writing content for other people or brands' },
      { value: 'thought-leadership', label: 'Thought Leadership', description: 'Establishing expertise in my industry' }
    ]
  },
  {
    id: 'followers',
    title: 'What\'s your current follower count?',
    description: 'This helps us suggest the right growth strategies for your level',
    icon: Users,
    multiSelect: false,
    options: [
      { value: '0-100', label: 'Just starting out (0-100)', description: 'Building from the ground up' },
      { value: '100-1000', label: 'Growing steadily (100-1K)', description: 'Finding my voice and audience' },
      { value: '1000-10000', label: 'Building momentum (1K-10K)', description: 'Scaling my reach and engagement' },
      { value: '10000-50000', label: 'Established presence (10K-50K)', description: 'Optimizing for quality growth' },
      { value: '50000+', label: 'Large following (50K+)', description: 'Maintaining and monetizing my audience' }
    ]
  },
  {
    id: 'content-type',
    title: 'What type of content do you primarily share?',
    description: 'Select all that apply to your content strategy',
    icon: PenTool,
    multiSelect: true,
    options: [
      { value: 'educational', label: 'Educational Content', description: 'Tips, tutorials, and how-to content' },
      { value: 'industry-insights', label: 'Industry Insights', description: 'Professional expertise and analysis' },
      { value: 'personal-stories', label: 'Personal Stories', description: 'Life experiences and behind-the-scenes' },
      { value: 'news-commentary', label: 'News & Commentary', description: 'Current events and trending topics' },
      { value: 'entertainment', label: 'Entertainment', description: 'Humor, memes, and engaging content' },
      { value: 'mixed', label: 'Mixed Content', description: 'A variety of different content types' }
    ]
  },
  {
    id: 'tools',
    title: 'Do you currently use any scheduling tools?',
    description: 'Select all tools you currently use in your workflow',
    icon: Calendar,
    multiSelect: true,
    options: [
      { value: 'none', label: 'No scheduling tools', description: 'I post manually in real-time' },
      { value: 'native', label: 'Twitter\'s native scheduler', description: 'Using Twitter\'s built-in scheduling' },
      { value: 'buffer', label: 'Buffer', description: 'Currently using Buffer for scheduling' },
      { value: 'hootsuite', label: 'Hootsuite', description: 'Managing through Hootsuite' },
      { value: 'later', label: 'Later or similar', description: 'Using Later or other scheduling platforms' },
      { value: 'multiple', label: 'Other tools', description: 'Using other scheduling platforms' }
    ]
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const navigate = useNavigate();

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers({ ...answers, [currentStepData.id]: value });
  };

  const handleMultiSelect = (value: string) => {
    const currentValues = answers[currentStepData.id] as string[] || [];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    setAnswers({ ...answers, [currentStepData.id]: newValues });
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/create-post');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isOptionSelected = (value: string) => {
    if (currentStepData.multiSelect) {
      const selectedValues = answers[currentStepData.id] as string[] || [];
      return selectedValues.includes(value);
    } else {
      return answers[currentStepData.id] === value;
    }
  };

  const canProceed = () => {
    if (currentStepData.multiSelect) {
      const selectedValues = answers[currentStepData.id] as string[] || [];
      return selectedValues.length > 0;
    } else {
      return answers[currentStepData.id] !== undefined;
    }
  };

  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center mx-auto mb-4 shadow-none group transition-all duration-300">
            <Twitter className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="mb-4">
            <Progress value={progress} className="w-full max-w-md mx-auto h-2 bg-muted shadow-none" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-4">
              Step {currentStep + 1} of {onboardingSteps.length}
            </p>
          </div>
        </div>

        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <CardHeader className="text-center p-6 pb-4">
            <div className="mx-auto w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center mb-3 border border-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground tracking-tight mb-1">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {currentStepData.multiSelect ? (
              <div className="grid gap-2">
                {currentStepData.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect(option.value)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-none border text-left transition-all duration-300",
                      isOptionSelected(option.value) 
                        ? "border-primary bg-primary/5 shadow-none ring-1 ring-primary/20" 
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all duration-300",
                      isOptionSelected(option.value) ? "bg-primary border-primary" : "border-border"
                    )}>
                      {isOptionSelected(option.value) && (
                        <div className="w-2 h-2 rounded-none bg-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">
                        {option.label}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <RadioGroup 
                value={answers[currentStepData.id] as string || ''} 
                onValueChange={handleSingleSelect}
                className="grid gap-2"
              >
                {currentStepData.options.map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-none border cursor-pointer transition-all duration-300",
                        isOptionSelected(option.value)
                          ? "border-primary bg-primary/5 shadow-none ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all duration-300",
                        isOptionSelected(option.value) ? "bg-primary border-primary" : "border-border"
                      )}>
                        {isOptionSelected(option.value) && (
                          <div className="w-2 h-2 rounded-none bg-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground mb-1">
                          {option.label}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-10 px-8 rounded-none border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 shadow-none"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-10 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
          Personalizing your experience for maximum growth
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
