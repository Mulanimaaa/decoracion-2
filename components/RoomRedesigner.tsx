import React, { useState, useEffect, useCallback } from 'react';
import { redesignImage, analyzeImage, getDetailedPlan, integrateObject } from '../services/geminiService';
import { ImageFile, StyleOption } from '../types';
import { convertFileToImageFile } from '../utils/fileUtils';
import { DESIGN_STYLES, LOADING_MESSAGES } from '../constants';
import { ImageUploader } from './ImageUploader';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, BrainCircuitIcon, DownloadIcon, LoadingSpinner, SparklesIcon } from './icons';

interface RoomRedesignerProps {
    objectForRedesign: ImageFile | null;
    setObjectForRedesign: (file: ImageFile | null) => void;
}

export const RoomRedesigner: React.FC<RoomRedesignerProps> = ({ objectForRedesign, setObjectForRedesign }) => {
  const [roomImage, setRoomImage] = useState<ImageFile | null>(null);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [designHistory, setDesignHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // -1: original, >=0: generated
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [referenceType, setReferenceType] = useState<'style' | 'object'>('style');

  const referenceImage = objectForRedesign || styleImage;

  useEffect(() => {
    if (objectForRedesign) {
      setStyleImage(null);
      setReferenceType('object');
    }
  }, [objectForRedesign]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleRoomImageUpload = async (file: File) => {
    setRoomImage(await convertFileToImageFile(file));
    setDesignHistory([]);
    setHistoryIndex(-1);
    setAnalysisResult('');
  };

  const handleStyleImageUpload = async (file: File) => {
    setObjectForRedesign(null);
    setStyleImage(await convertFileToImageFile(file));
    setReferenceType('style');
  };

  const handleClearReference = () => {
    setObjectForRedesign(null);
    setStyleImage(null);
  };

  const handleGenerate = async () => {
    if (!roomImage) {
      setError('Please upload a photo of your room first.');
      return;
    }
    
    if (!selectedStyle && !referenceImage && !prompt) {
        setError('Please select a style, upload a reference, or enter a prompt.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseImageForApi: ImageFile = historyIndex >= 0 
        ? { file: new File([], ''), base64: designHistory[historyIndex], mimeType: 'image/jpeg' } 
        : roomImage!;

      let newImageBase64: string;
      if (referenceImage && referenceType === 'object') {
        if (!prompt) {
          setError('Please provide instructions for placing the object (e.g., "place this on the wall").');
          setIsLoading(false);
          return;
        }
        newImageBase64 = await integrateObject(baseImageForApi, referenceImage, prompt);
      } else {
        const generationPrompt = prompt || `Redecorate in a ${selectedStyle?.name || 'new'} style.`;
        newImageBase64 = await redesignImage(baseImageForApi, generationPrompt, referenceImage || undefined);
      }
      
      const newHistory = designHistory.slice(0, historyIndex + 1);
      const updatedHistory = [...newHistory, newImageBase64];
      setDesignHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    const imageToAnalyze = historyIndex >= 0
        ? { file: new File([], ''), base64: designHistory[historyIndex], mimeType: 'image/jpeg' }
        : roomImage;

    if (!imageToAnalyze) {
        setError('Please upload an image or generate a design to analyze.');
        return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    try {
        const prompt = 'Please provide a detailed design plan for this room. Include suggestions for furniture, color palettes, lighting, and decor. Format the response as markdown.';
        const result = await getDetailedPlan(prompt);
        setAnalysisResult(result);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
    } finally {
        setIsAnalyzing(false);
    }
  }

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `design-${new Date().toISOString()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
        setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
      if (historyIndex < designHistory.length - 1) {
          setHistoryIndex(historyIndex + 1);
      }
  }, [historyIndex, designHistory.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        // Prevent shortcuts from firing if user is typing in a text field
        if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
            return;
        }

        const isMac = navigator.userAgent.includes('Mac');
        const undoPressed = (isMac ? event.metaKey : event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z';
        const redoPressed = 
            (isMac && event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z') || 
            (!isMac && event.ctrlKey && event.key.toLowerCase() === 'y');

        if (undoPressed) {
            event.preventDefault();
            handleUndo();
        } else if (redoPressed) {
            event.preventDefault();
            handleRedo();
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const currentImage = historyIndex >= 0 ? `data:image/jpeg;base64,${designHistory[historyIndex]}` : (roomImage ? URL.createObjectURL(roomImage.file) : null);

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Design Controls</h2>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">1. Upload Your Room</h3>
          <div className="h-48">
            <ImageUploader 
              onImageUpload={handleRoomImageUpload} 
              uploadedImage={roomImage ? URL.createObjectURL(roomImage.file) : null}
              clearImage={() => { setRoomImage(null); setDesignHistory([]); setHistoryIndex(-1); }}
              title="Your Room Image"
            />
          </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">2. Choose Your Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DESIGN_STYLES.map(style => (
                <div key={style.id} onClick={() => { setSelectedStyle(style); handleClearReference();}} className={`cursor-pointer rounded-lg overflow-hidden border-4 ${selectedStyle?.id === style.id ? 'border-blue-500' : 'border-transparent'} transition-all`}>
                    <img src={style.imageUrl} alt={style.name} className="w-full h-20 object-cover"/>
                    <p className="text-center bg-gray-100 dark:bg-gray-700 p-1 text-sm font-medium text-gray-800 dark:text-gray-200">{style.name}</p>
                </div>
                ))}
            </div>
            <div className="text-center my-3 text-gray-500 dark:text-gray-400 font-semibold">OR USE A REFERENCE</div>
            <div className="h-32">
                <ImageUploader 
                onImageUpload={handleStyleImageUpload} 
                uploadedImage={referenceImage ? URL.createObjectURL(referenceImage.file) : null}
                clearImage={handleClearReference}
                title="Upload Reference Image"
                />
            </div>
            {referenceImage && (
                <div className="flex items-center justify-center gap-4 mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Use As:</span>
                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                        <input type="radio" value="style" checked={referenceType === 'style'} onChange={() => setReferenceType('style')} className="form-radio text-blue-600" />
                        Style
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                        <input type="radio" value="object" checked={referenceType === 'object'} onChange={() => setReferenceType('object')} className="form-radio text-blue-600" />
                        Object (Inpaint)
                    </label>
                </div>
            )}
        </div>
        
        <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">3. Refine with a Prompt</h3>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={referenceImage && referenceType === 'object' ? 'e.g., Place this chair in front of the window...' : 'e.g., Change the sofa to blue, add a plant...'}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
            />
        </div>

        <button
            onClick={handleGenerate}
            disabled={isLoading || !roomImage}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
            {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-6 h-6" />}
            {isLoading ? loadingMessage : (historyIndex >= 0 ? 'Refine Design' : 'Generate Design')}
        </button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>

      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your New Space</h2>
        <div className="flex-grow w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center relative">
          {isLoading && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg"><LoadingSpinner /></div>}
          {currentImage && !isLoading && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <button
                      onClick={handleUndo}
                      disabled={historyIndex < 0}
                      className="flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white font-bold p-2 rounded-lg hover:bg-white dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      aria-label="Undo"
                  >
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                      onClick={handleRedo}
                      disabled={historyIndex >= designHistory.length - 1}
                      className="flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white font-bold p-2 rounded-lg hover:bg-white dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      aria-label="Redo"
                  >
                      <ArrowUturnRightIcon className="w-5 h-5" />
                  </button>
              </div>
          )}
          {currentImage ? (
            <img src={currentImage} alt="Designed room" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <p className="text-gray-500">Your design will appear here</p>
          )}
          {currentImage && !isLoading && (
            <button onClick={handleDownload} className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg">
              <DownloadIcon className="w-5 h-5"/> Download
            </button>
          )}
        </div>
        <button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !currentImage}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
            {isAnalyzing ? <LoadingSpinner /> : <BrainCircuitIcon className="w-6 h-6" />}
            {isAnalyzing ? 'Analyzing with Gemini Pro...' : 'Get Detailed Design Plan'}
        </button>
        {analysisResult && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg max-h-60 overflow-y-auto">
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Design Analysis</h3>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
            </div>
        )}
      </div>
    </div>
  );
};