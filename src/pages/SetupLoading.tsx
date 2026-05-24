
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Twitter, Zap, TrendingUp } from 'lucide-react';

const setupSteps = [
  { id: 'connection', label: 'Verifying Twitter connection', icon: Twitter, duration: 2000 },
  { id: 'analysis', label: 'Analyzing your profile and audience', icon: TrendingUp, duration: 3000 },
  { id: 'optimization', label: 'Setting up your growth strategy', icon: Zap, duration: 2500 },
  { id: 'complete', label: 'Preparing your workspace', icon: CheckCircle, duration: 1500 }
];

const SetupLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep < setupSteps.length) {
      const step = setupSteps[currentStep];
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setCurrentStep(prev => prev + 1);
      }, step.duration);

      return () => clearTimeout(timer);
    } else {
      // All steps completed, redirect to app
      const finalTimer = setTimeout(() => {
        navigate('/create-post');
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, navigate]);

  const currentStepData = setupSteps[currentStep];

  return (
    <div className="min-h-screen bg-[#FFF4ED] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <img 
          src="/logo-black.png" 
          alt="ShipOS Logo" 
          className="h-12 w-auto mx-auto mb-8"
        />

        {/* Main Message */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-[#1E1E1E] mb-3">
            Hold on... We're setting up your Twitter command center
          </h1>
          <p className="text-[#4A4A4A] text-base">
            This will just take a moment while we personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6 mb-8">
          {setupSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === index;
            const isPending = currentStep < index;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isCurrent 
                      ? 'bg-[#FF6154] text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="animate-spin rounded-none h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p 
                    className={`text-sm font-medium transition-all duration-300 ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isCurrent 
                        ? 'text-[#1E1E1E]' 
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-500 mt-1">✓ Complete</p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-[#FF6154] mt-1">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#FF6154] rounded-none animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        <p className="text-xs text-[#4A4A4A]">
          Setting up your personalized Twitter growth strategy...
        </p>
      </div>
    </div>
  );
};

export default SetupLoading;
