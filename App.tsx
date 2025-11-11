import React, { useState } from 'react';
import { AppView, ImageFile } from './types';
import { RoomRedesigner } from './components/RoomRedesigner';
import { ImageStudio } from './components/ImageStudio';
import { ChatView } from './components/ChatView';
import { TabButton } from './components/TabButton';
import { PaintBrushIcon, SparklesIcon, ChatBubbleIcon } from './components/icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.REDESIGNER);
  const [objectForRedesign, setObjectForRedesign] = useState<ImageFile | null>(null);

  const handleSetObjectForRedesign = (imageFile: ImageFile) => {
    setObjectForRedesign(imageFile);
    setActiveView(AppView.REDESIGNER);
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.REDESIGNER:
        return <RoomRedesigner 
            objectForRedesign={objectForRedesign}
            setObjectForRedesign={setObjectForRedesign}
        />;
      case AppView.STUDIO:
        return <ImageStudio onSelectObjectForRedesign={handleSetObjectForRedesign} />;
      case AppView.CHAT:
        return <ChatView />;
      default:
        return <RoomRedesigner 
            objectForRedesign={objectForRedesign}
            setObjectForRedesign={setObjectForRedesign}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <nav className="flex flex-col p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700">
        <div className="mb-8 flex items-center justify-center md:justify-start gap-2">
            <PaintBrushIcon className="w-8 h-8 text-blue-600" />
            <h1 className="hidden md:block text-xl font-bold text-gray-800 dark:text-white">AI Designer</h1>
        </div>
        <div className="flex flex-col gap-3">
          <TabButton
            label="Room Redesigner"
            isActive={activeView === AppView.REDESIGNER}
            onClick={() => setActiveView(AppView.REDESIGNER)}
            icon={<PaintBrushIcon className="w-6 h-6" />}
            notification={!!objectForRedesign}
          />
          <TabButton
            label="Image Studio"
            isActive={activeView === AppView.STUDIO}
            onClick={() => setActiveView(AppView.STUDIO)}
            icon={<SparklesIcon className="w-6 h-6" />}
          />
          <TabButton
            label="AI Chat"
            isActive={activeView === AppView.CHAT}
            onClick={() => setActiveView(AppView.CHAT)}
            icon={<ChatBubbleIcon className="w-6 h-6" />}
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;