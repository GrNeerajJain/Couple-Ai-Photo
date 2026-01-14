
import React, { useState } from 'react';

interface TourStep {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: "Welcome to CoupleAI",
      content: "Create beautiful, shared moments by merging your portraits with any pose or scene you can imagine. Let's show you how!",
      icon: (
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
      )
    },
    {
      title: "Step 1: Upload The Trio",
      content: "Upload a clear portrait of Person A, Person B, and a Reference Image. The Reference Image dictates the pose, background, and lighting.",
      icon: (
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
      )
    },
    {
      title: "Step 2: Perfect the Vibe",
      content: "Use the creative controls to choose your Style, Camera Angle, and Pose Variation. Want it 'Cinematic' or 'Artistic'? The choice is yours.",
      icon: (
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </div>
      )
    },
    {
      title: "Step 3: Generate & Refine",
      content: "After creating your moment, you can 'Re-edit' it with text! Just type instructions like 'Change background to sunset' to refine your result.",
      icon: (
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {steps[currentStep].icon}
          <h2 className="text-2xl font-serif font-bold text-slate-800 mb-3 italic">
            {steps[currentStep].title}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            {steps[currentStep].content}
          </p>
          
          <div className="flex items-center space-x-2 mb-8">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          <div className="flex w-full space-x-3">
            <button 
              onClick={onComplete}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              {currentStep === steps.length - 1 ? "Start Creating" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
