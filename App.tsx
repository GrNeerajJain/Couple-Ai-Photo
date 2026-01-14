
import React, { useState, useEffect } from 'react';
import { ImageData, GenerationState, AspectRatio, GenerationStyle, DetailLevel, PoseVariation, CameraAngle } from './types';
import { ImageUploader } from './components/ImageUploader';
import { OnboardingTour } from './components/OnboardingTour';
import { SupportChat } from './components/SupportChat';
import { generateCouplePhoto, refineGeneratedPhoto } from './services/geminiService';

const App: React.FC = () => {
  const [person1, setPerson1] = useState<ImageData | null>(null);
  const [person2, setPerson2] = useState<ImageData | null>(null);
  const [reference, setReference] = useState<ImageData | null>(null);
  
  const [showTour, setShowTour] = useState(false);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => {
    const saved = localStorage.getItem('couple_ai_aspect_ratio');
    return (saved as AspectRatio) || '9:16';
  });
  const [style, setStyle] = useState<GenerationStyle>(() => {
    const saved = localStorage.getItem('couple_ai_style');
    return (saved as GenerationStyle) || 'realistic';
  });
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(() => {
    const saved = localStorage.getItem('couple_ai_detail_level');
    return (saved as DetailLevel) || 'default';
  });
  const [poseVariation, setPoseVariation] = useState<PoseVariation>(() => {
    const saved = localStorage.getItem('couple_ai_pose_variation');
    return (saved as PoseVariation) || 'default';
  });
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(() => {
    const saved = localStorage.getItem('couple_ai_camera_angle');
    return (saved as CameraAngle) || 'default';
  });
  
  const [prompt, setPrompt] = useState<string>('');
  const [refinementInput, setRefinementInput] = useState<string>('');
  
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    status: '',
    error: null,
    resultUrl: null,
  });

  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('couple_ai_tour_completed');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('couple_ai_tour_completed', 'true');
    setShowTour(false);
  };

  useEffect(() => {
    localStorage.setItem('couple_ai_aspect_ratio', aspectRatio);
  }, [aspectRatio]);

  useEffect(() => {
    localStorage.setItem('couple_ai_style', style);
  }, [style]);

  useEffect(() => {
    localStorage.setItem('couple_ai_detail_level', detailLevel);
  }, [detailLevel]);

  useEffect(() => {
    localStorage.setItem('couple_ai_pose_variation', poseVariation);
  }, [poseVariation]);

  useEffect(() => {
    localStorage.setItem('couple_ai_camera_angle', cameraAngle);
  }, [cameraAngle]);

  const handleGenerate = async () => {
    if (!person1 || !person2 || !reference) return;

    setState({
      isGenerating: true,
      status: 'Initializing Flash Engine...',
      error: null,
      resultUrl: null,
    });

    try {
      const statusUpdates = [
        { msg: 'Analyzing facial features...', delay: 1000 },
        { msg: 'Matching reference geometry...', delay: 2500 },
        { msg: 'Synthesizing scene...', delay: 4000 },
        { msg: 'Enhancing textures...', delay: 5500 }
      ];

      statusUpdates.forEach(update => {
        setTimeout(() => {
          setState(prev => prev.isGenerating ? { ...prev, status: update.msg } : prev);
        }, update.delay);
      });

      const result = await generateCouplePhoto(
        person1, 
        person2, 
        reference, 
        aspectRatio, 
        style, 
        detailLevel, 
        poseVariation, 
        cameraAngle, 
        prompt
      );
      
      setState({
        isGenerating: false,
        status: 'Success!',
        error: null,
        resultUrl: result,
      });
    } catch (err) {
      console.error(err);
      setState({
        isGenerating: false,
        status: '',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
        resultUrl: null,
      });
    }
  };

  const handleRefine = async () => {
    if (!state.resultUrl || !refinementInput.trim() || isRefining) return;

    setIsRefining(true);
    setState(prev => ({ ...prev, status: 'Applying Flash Edit...' }));
    try {
      const refinedResult = await refineGeneratedPhoto(state.resultUrl, refinementInput);
      setState(prev => ({ ...prev, resultUrl: refinedResult, status: 'Success!' }));
      setRefinementInput('');
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, error: 'Refinement failed. Please try again.' }));
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    setState({
      isGenerating: false,
      status: '',
      error: null,
      resultUrl: null,
    });
    setRefinementInput('');
  };

  const isComplete = person1 && person2 && reference;

  const aspectRatios: { label: string; value: AspectRatio; class: string }[] = [
    { label: '1:1', value: '1:1', class: 'aspect-square' },
    { label: '3:4', value: '3:4', class: 'aspect-[3/4]' },
    { label: '4:3', value: '4:3', class: 'aspect-[4/3]' },
    { label: '9:16', value: '9:16', class: 'aspect-[9/16]' },
    { label: '16:9', value: '16:9', class: 'aspect-[16/9]' },
  ];

  const styleOptions: { label: string; value: GenerationStyle }[] = [
    { label: 'Realistic', value: 'realistic' },
    { label: 'Cinematic', value: 'cinematic' },
    { label: 'Artistic', value: 'artistic' },
    { label: 'Vintage', value: 'vintage' },
    { label: 'Anime', value: 'anime' },
  ];

  const detailLevels: { label: string; value: DetailLevel }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  const poseVariations: { label: string; value: PoseVariation }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Exact', value: 'exact' },
    { label: 'Relaxed', value: 'relaxed' },
    { label: 'Dynamic', value: 'dynamic' },
  ];

  const cameraAngleOptions: { label: string; value: CameraAngle; icon: React.ReactNode }[] = [
    { 
      label: 'Match Ref', 
      value: 'default', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
    { 
      label: 'Eye Level', 
      value: 'eye-level', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> 
    },
    { 
      label: 'Low Angle', 
      value: 'low-angle', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg> 
    },
    { 
      label: 'High Angle', 
      value: 'high-angle', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5-5v12" /></svg> 
    },
    { 
      label: 'Wide Shot', 
      value: 'wide-shot', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      label: 'Close Up', 
      value: 'close-up', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
      <SupportChat />
      
      <header className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4 italic">
          CoupleAI <span className="text-indigo-600 not-italic">Moments</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Merge your photos into a single beautiful portrait using high-performance Nano Banana synthesis.
        </p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-semibold">1</span>
              Upload Portraits & Reference
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploader 
                label="Person A" 
                description="Clear headshot"
                imageData={person1}
                onUpload={(data) => setPerson1(data)}
                onClear={() => setPerson1(null)}
                disabled={state.isGenerating || isRefining}
              />
              <ImageUploader 
                label="Person B" 
                description="Clear headshot"
                imageData={person2}
                onUpload={(data) => setPerson2(data)}
                onClear={() => setPerson2(null)}
                disabled={state.isGenerating || isRefining}
              />
              <ImageUploader 
                label="Pose Reference" 
                description="Target scene/pose"
                imageData={reference}
                onUpload={(data) => setReference(data)}
                onClear={() => setReference(null)}
                disabled={state.isGenerating || isRefining}
              />
            </div>

            <div className="mt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        disabled={state.isGenerating || isRefining}
                        className={`
                          flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 transition-all min-w-[54px]
                          ${aspectRatio === ratio.value 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}
                          ${state.isGenerating || isRefining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`w-4 border-2 border-current rounded-sm mb-1 ${ratio.class}`}></div>
                        <span className="text-[10px] font-bold uppercase">{ratio.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Generation Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {styleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStyle(opt.value)}
                        disabled={state.isGenerating || isRefining}
                        className={`
                          px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all
                          ${style === opt.value 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}
                          ${state.isGenerating || isRefining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Pose Variation
                  </label>
                  <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {poseVariations.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPoseVariation(p.value)}
                        disabled={state.isGenerating || isRefining}
                        className={`
                          px-4 py-2 rounded-lg text-xs font-bold transition-all
                          ${poseVariation === p.value 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'}
                          ${state.isGenerating || isRefining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Detail Level
                  </label>
                  <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {detailLevels.map((lvl) => (
                      <button
                        key={lvl.value}
                        onClick={() => setDetailLevel(lvl.value)}
                        disabled={state.isGenerating || isRefining}
                        className={`
                          px-4 py-2 rounded-lg text-xs font-bold transition-all
                          ${detailLevel === lvl.value 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'}
                          ${state.isGenerating || isRefining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Camera Angle
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {cameraAngleOptions.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setCameraAngle(a.value)}
                      disabled={state.isGenerating || isRefining}
                      className={`
                        flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all group
                        ${cameraAngle === a.value 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}
                        ${state.isGenerating || isRefining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className={`mb-1.5 transition-transform group-hover:scale-110 ${cameraAngle === a.value ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {a.icon}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-tight text-center leading-none">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Initial Scene Instructions (Optional)
                </label>
                <textarea 
                  placeholder="E.g., 'Make it look like a rainy night in Paris' or 'Add a vintage polaroid filter'"
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4 resize-none transition-all h-24 border focus:outline-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={state.isGenerating || isRefining}
                />
              </div>
            </div>
          </div>

          {!state.resultUrl && (
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={!isComplete || state.isGenerating || isRefining}
                className={`
                  px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95
                  ${isComplete && !state.isGenerating && !isRefining
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
              >
                {state.isGenerating ? (
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{state.status}</span>
                  </div>
                ) : (
                  'Create Our Moment'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-3 text-sm font-semibold">2</span>
              Result
            </h2>

            {state.resultUrl ? (
              <div className="flex-1 flex flex-col animate-in fade-in duration-700">
                <div className={`relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 mb-6 flex items-center justify-center w-full max-h-[600px] border border-slate-100`}>
                  <img src={state.resultUrl!} alt="Generated Moment" className="w-full h-full object-contain" />
                  {isRefining && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                      <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm font-bold text-indigo-900">{state.status}</p>
                    </div>
                  )}
                </div>
                
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Refine with Flash Edit
                  </h3>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Try 'Add a retro filter' or 'Make background snowy'..."
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      disabled={isRefining}
                      className="flex-1 text-sm rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <button 
                      onClick={handleRefine}
                      disabled={!refinementInput.trim() || isRefining}
                      className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Powered by Gemini 2.5 Flash Image (Nano Banana)</p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button 
                    onClick={handleReset}
                    disabled={isRefining}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Create New
                  </button>
                  
                  <a 
                    href={state.resultUrl || '#'} 
                    download={'moment-photo.png'}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl text-center font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform transition-transform active:scale-[0.98] flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Image
                  </a>
                </div>
              </div>
            ) : state.isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{state.status}</h3>
                  <p className="text-sm text-slate-500">
                    Flash generation is usually very fast...
                  </p>
                </div>
              </div>
            ) : state.error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Something went wrong</h3>
                <p className="text-sm text-slate-500">{state.error}</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40 grayscale">
                <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <p className="text-slate-500">Your masterpiece will appear here after generation.</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-3 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Quick Tips
            </h3>
            <ul className="text-xs text-indigo-800 space-y-2 opacity-80">
              <li>• Portraits: High resolution, front-facing.</li>
              <li>• Reference: Clear pose and environment.</li>
              <li>• <strong>Flash Power:</strong> Enjoy fast, cinematic synthesis powered by Nano Banana.</li>
              <li>• <strong>Text Edit:</strong> Once generated, use the Flash Edit box to refine your image with text prompts.</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-slate-200 w-full max-w-6xl text-center text-slate-400 text-sm">
        <p>© 2025 CoupleAI. Powered by Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;
