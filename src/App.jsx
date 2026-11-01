import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DeskWorkspace } from './components/desk/DeskWorkspace'
import { StudioPageTransition } from './components/transitions/StudioPageTransition'
import { CustomCursor } from './components/ui/CustomCursor'
import { ClickBurstEngine } from './components/ui/ClickBurstEngine'
import { useUrlState } from './hooks/useUrlState'
import { StudioRouter } from './components/studio/StudioRouter'
import { UniversalExportOverlay } from './components/export/UniversalExportOverlay'
import { TimeLetterSharePage } from './components/studio/TimeLetterStudio/TimeLetterSharePage'

function App() {
  const [currentView, setCurrentView] = useUrlState('view', 'desk') // 'desk', 'transitioning', 'studio', 'letter'
  const [activeStudioId, setActiveStudioId] = useUrlState('studioId', null)

  const urlParams = new URLSearchParams(window.location.search);
  const isLetterShareView = currentView === 'letter' || Boolean(urlParams.get('letter')) || window.location.hash.includes('letter=');

  const handleEnterStudio = (studioTitle) => {
    setActiveStudioId(studioTitle)
    setCurrentView('transitioning')
  }

  const handleTransitionComplete = () => {
    setCurrentView('studio')
    setTimeout(() => {
      setCurrentView('studio_active')
    }, 1500)
  }

  const handleExitStudio = () => {
    setCurrentView('transitioning_out')
  }

  const handleTransitionOutComplete = () => {
    setCurrentView('transitioning_out_desk')
    setTimeout(() => {
      setCurrentView('desk')
    }, 4000)
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
          {(currentView === 'desk' || currentView === 'transitioning' || currentView === 'transitioning_out_desk') && (
            <DeskWorkspace onEnterStudio={handleEnterStudio} />
          )}

          {(currentView === 'studio' || currentView === 'studio_active' || currentView === 'transitioning_out') && (
            <StudioRouter studioId={activeStudioId} onExit={handleExitStudio} />
          )}

          <AnimatePresence>
            {(currentView === 'transitioning' || currentView === 'studio') && (
              <StudioPageTransition onComplete={handleTransitionComplete} />
            )}
            {(currentView === 'transitioning_out' || currentView === 'transitioning_out_desk') && (
              <StudioPageTransition isClosing onComplete={handleTransitionOutComplete} />
            )}
          </AnimatePresence>
          <UniversalExportOverlay />
        </>
      )}
    </>
  )
}

export default App
