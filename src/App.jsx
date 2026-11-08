import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { DeskWorkspace } from './components/desk/DeskWorkspace'
import { StudioPageTransition } from './components/transitions/StudioPageTransition'
import { CustomCursor } from './components/ui/CustomCursor'
import { ClickBurstEngine } from './components/ui/ClickBurstEngine'
import { useUrlState } from './hooks/useUrlState'
import { StudioRouter } from './components/studio/StudioRouter'
import { UniversalExportOverlay } from './components/export/UniversalExportOverlay'
import { TimeLetterSharePage } from './components/studio/TimeLetterStudio/TimeLetterSharePage'
import { LegalModal } from './components/desk/LegalModal'
import { CookieConsentBanner } from './components/ui/CookieConsentBanner'

function App() {
  const [currentView, setCurrentView] = useUrlState('view', 'desk') // 'desk', 'transitioning', 'studio', 'letter', 'privacy', 'terms'
  const [activeStudioId, setActiveStudioId] = useUrlState('studioId', null)

  const urlParams = new URLSearchParams(window.location.search);
  const isLetterShareView = currentView === 'letter' || Boolean(urlParams.get('letter')) || window.location.hash.includes('letter=');

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(currentView === 'privacy' || currentView === 'terms');
  const [legalTab, setLegalTab] = useState(currentView === 'terms' ? 'terms' : 'privacy');

  // One-time entrance intro on first visit: tracks completion via localStorage
  const [isFirstVisitIntro, setIsFirstVisitIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'letter' || params.has('letter') || window.location.hash.includes('letter=')) {
      return false;
    }
    try {
      return !localStorage.getItem('kitte_first_visit_completed');
    } catch {
      return false;
    }
  });

  const handleFirstVisitIntroFinish = () => {
    try {
      localStorage.setItem('kitte_first_visit_completed', 'true');
    } catch (_) {}
    setIsFirstVisitIntro(false);
  };

  // Synchronize URL view parameter changes
  useEffect(() => {
    if (currentView === 'privacy') {
      setLegalTab('privacy');
      setIsLegalModalOpen(true);
    } else if (currentView === 'terms') {
      setLegalTab('terms');
      setIsLegalModalOpen(true);
    }
  }, [currentView]);

  // Global event listener to open legal modal from any component
  useEffect(() => {
    const handleOpenLegalEvent = (e) => {
      const tab = e?.detail?.tab || 'privacy';
      setLegalTab(tab);
      setIsLegalModalOpen(true);
      setCurrentView(tab);
    };
    window.addEventListener('OPEN_LEGAL', handleOpenLegalEvent);
    return () => window.removeEventListener('OPEN_LEGAL', handleOpenLegalEvent);
  }, [setCurrentView]);

  // Prevent mobile browser page-level pinch zoom (especially iOS Safari gesture events)
  useEffect(() => {
    const handleGesture = (e) => {
      e.preventDefault();
    };
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
    };
  }, []);

  const handleCloseLegal = () => {
    setIsLegalModalOpen(false);
    if (currentView === 'privacy' || currentView === 'terms') {
      setCurrentView('desk');
    }
  };

  const handleEnterStudio = (studioTitle) => {
    setActiveStudioId(studioTitle)
    setCurrentView('transitioning')
  }

  const handleTransitionComplete = () => {
    setCurrentView('studio')
  }

  const handleTransitionFinish = () => {
    setCurrentView('studio_active')
  }

  const handleExitStudio = () => {
    setCurrentView('transitioning_out')
  }

  const handleTransitionOutComplete = () => {
    setCurrentView('transitioning_out_desk')
  }

  const handleTransitionOutFinish = () => {
    setCurrentView('desk')
    setActiveStudioId(null)
  }

  return (
    <>
      {/* Global Squiggle SVG Filters for .handwritten-text */}
      <svg className="hidden absolute pointer-events-none w-0 h-0">
        <defs>
          <filter id="squiggle-0">
            <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="0" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
          <filter id="squiggle-1">
            <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="2" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
          <filter id="squiggle-2">
            <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="4" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>

      <CustomCursor />
      <ClickBurstEngine />
      
      {isLetterShareView ? (
        <TimeLetterSharePage />
      ) : (
        <>
          {(currentView === 'desk' || currentView === 'privacy' || currentView === 'terms' || currentView === 'transitioning' || currentView === 'transitioning_out_desk') && (
            <DeskWorkspace onEnterStudio={handleEnterStudio} />
          )}

          {(currentView === 'studio' || currentView === 'studio_active' || currentView === 'transitioning_out') && (
            <StudioRouter studioId={activeStudioId} onExit={handleExitStudio} />
          )}

          <AnimatePresence>
            {isFirstVisitIntro && (
              <StudioPageTransition 
                key="first-visit-intro"
                isFirstIntro
                onComplete={() => {}} 
                onFinish={handleFirstVisitIntroFinish} 
              />
            )}
            {(currentView === 'transitioning' || currentView === 'studio') && (
              <StudioPageTransition 
                key="studio-enter-transition"
                onComplete={handleTransitionComplete} 
                onFinish={handleTransitionFinish} 
              />
            )}
            {(currentView === 'transitioning_out' || currentView === 'transitioning_out_desk') && (
              <StudioPageTransition 
                key="studio-exit-transition"
                isClosing 
                onComplete={handleTransitionOutComplete} 
                onFinish={handleTransitionOutFinish} 
              />
            )}
          </AnimatePresence>
          <UniversalExportOverlay />

          {/* Privacy & Legal Archival Modal (CrafterNotes Style) */}
          <LegalModal
            isOpen={isLegalModalOpen}
            initialTab={legalTab}
            onClose={handleCloseLegal}
          />

          {/* Cookie Consent Banner (Desk only, bottom-right) */}
          <CookieConsentBanner 
            currentView={currentView}
            isAnyModalOpen={isLegalModalOpen || Boolean(activeStudioId)}
            onOpenPrivacy={() => {
              setLegalTab('privacy');
              setIsLegalModalOpen(true);
              setCurrentView('privacy');
            }}
          />

          {/* Privacy-First Vercel Analytics */}
          <Analytics />
        </>
      )}
    </>
  )
}

export default App
