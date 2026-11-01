import React from 'react';
import { MemoryTicketStudio } from './MemoryTicketStudio/MemoryTicketStudio';
import { TravelIDStudio } from './TravelIDStudio/TravelIDStudio';
import { PhotoBoothStudio } from './PhotoBoothStudio/PhotoBoothStudio';
import { BountyPosterStudio } from './BountyPosterStudio/BountyPosterStudio';
import { TimeLetterStudio } from './TimeLetterStudio/TimeLetterStudio';

export function StudioRouter({ studioId, onExit }) {
  const normalizedId = studioId?.toUpperCase().trim();

  switch (normalizedId) {
    case 'TICKET STUB':
      return <MemoryTicketStudio onExit={onExit} />;
    
    case 'TRAVEL ID':
      return <TravelIDStudio onExit={onExit} />;
    
    case 'PHOTO BOOTH':
      return <PhotoBoothStudio onExit={onExit} />;

    case 'BOUNTY POSTER':
      return <BountyPosterStudio onExit={onExit} />;

    case 'TIME CAPSULE':
    case 'TIME LETTER':
      return <TimeLetterStudio onExit={onExit} />;
    
    default:
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#F4F1EA]">
          <h2 className="font-marker text-4xl mb-4">Under Construction</h2>
          <p className="font-mono">{studioId} is currently being built.</p>
          <button 
            onClick={onExit}
            className="mt-8 px-6 py-2 border-2 border-[#1A1A1A] font-mono shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all"
          >
            Return to Desk
          </button>
        </div>
      );
  }
}
