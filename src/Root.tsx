import { Composition } from 'remotion';
import { SeamlessLifeLoop } from './SeamlessLifeLoop';
import { BasketChallenge } from './BasketChallenge';
import { PersistenceVideo } from './PersistenceVideo';  
import { StartWins50 } from './StartWins50';
import { PersistWins90 } from './PersistWins90';
import { CompoundBarChart } from './CompoundBarChart';
import { FocusVsMultitasking } from './FocusVsMultitasking'; 
import { StaircaseScript, staircaseScriptDuration } from './StaircaseScript';
import React from 'react';

const IG_CONFIG = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition 
      id="LifeLoop" 
      component={SeamlessLifeLoop} 
      durationInFrames={450} 
      {...IG_CONFIG} 
    />
    
    <Composition 
      id="BasketChallenge" 
      component={BasketChallenge} 
      durationInFrames={450} 
      {...IG_CONFIG} 
    />

    <Composition
      id="PersistenceVideo"
      component={PersistenceVideo}
      durationInFrames={450}
      {...IG_CONFIG}  
    />

    <Composition
      id="StartWins50"
      component={StartWins50}
      durationInFrames={270}
      {...IG_CONFIG}
    />

    <Composition
      id="PersistWins90"
      component={PersistWins90}
      durationInFrames={360}
      {...IG_CONFIG}
    />

    <Composition
      id="CompoundBarChart"
      component={CompoundBarChart}
      durationInFrames={180} 
      {...IG_CONFIG}
    />

    <Composition
      id="FocusVsMultitasking"
      component={FocusVsMultitasking}
      durationInFrames={300} 
      {...IG_CONFIG}
    />

    <Composition
      id="StaircaseScript"
      component={StaircaseScript}
      durationInFrames={staircaseScriptDuration}
      {...IG_CONFIG}
    /> 
  </>
);