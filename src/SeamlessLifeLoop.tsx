import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import React from 'react';

export const SeamlessLifeLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  // 1. 核心週期設定
  const cycles = 2; 
  const progress = frame / durationInFrames; 
  const currentPhase = progress * Math.PI * 2 * cycles;
  
  const waveAmplitude = 150; 
  const waveLength = 1080;   

  // 2. 小球精確 Y 座標 (-150 為波峰/好，150 為波谷/差)
  const yOffset = -Math.cos(currentPhase) * waveAmplitude; 
  
  // 3. 文字透明度邏輯
  const goodOpacity = interpolate(yOffset, [-120, -50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badOpacity = interpolate(yOffset, [50, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 4. ✨ 小球光芒同步邏輯 ✨
  // 光芒擴散範圍：在 GOOD (-150) 時光芒最盛(100px)，在 BAD (150) 時光芒收斂(10px)
  const glowSpread = interpolate(yOffset, [-150, 150], [100, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // 光暈顏色漸變：在 GOOD 為金色，中間為白光，在 BAD 為微弱的深藍光
  const glowColor = interpolateColors(
    yOffset,
    [-150, 0, 150],
    ['rgba(255, 215, 0, 0.9)', 'rgba(255, 255, 255, 0.2)', 'rgba(79, 172, 254, 0.5)']
  );

  // 5. 生成數學曲線 (100% 貼合)
  const resolution = 10;
  const polylinePoints = [];
  for (let x = -200; x <= width + 200; x += resolution) {
    const x_rel = x - (width / 2);
    const angle = (x_rel / waveLength) * Math.PI * 2 + currentPhase;
    const y = -Math.cos(angle) * waveAmplitude;
    polylinePoints.push(`${x},${y}`);
  }
  const pointsString = polylinePoints.join(' ');

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* 上方 1/3：文字區 */}
      <div style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '33.33%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold', letterSpacing: '8px' }}>
          <div style={{ 
            opacity: goodOpacity, 
            color: '#FFD700', 
            fontSize: '100px', 
            position: 'absolute', 
            width: '600px', 
            left: '-300px', 
            top: '-60px',
            textShadow: `0 0 50px rgba(255, 215, 0, ${goodOpacity})`
          }}>
            GOOD <br/> <span style={{fontSize: '40px', letterSpacing: '20px'}}>好</span>
          </div>
          <div style={{ 
            opacity: badOpacity, 
            color: '#4facfe', 
            fontSize: '100px', 
            position: 'absolute', 
            width: '600px', 
            left: '-300px', 
            top: '-60px',
            textShadow: `0 0 50px rgba(79, 172, 254, ${badOpacity})`
          }}>
            BAD <br/> <span style={{fontSize: '40px', letterSpacing: '20px'}}>差</span>
          </div>
        </div>
      </div>

      {/* 下方 2/3：圖形區 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '66.67%',
        overflow: 'hidden' 
      }}>
        
        {/* 背景曲線 SVG */}
        <svg 
          style={{ 
            position: 'absolute',
            left: 0,
            top: '50%', 
            width: '100%',
            height: '2px', 
            overflow: 'visible',
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))' 
          }}
        >
          <polyline
            points={pointsString}
            fill="none"
            stroke="white"
            strokeWidth="10" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* 基準水平線 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }} />

        {/* ✨ 運動小球 (套用同步光芒) ✨ */}
        <div style={{
          position: 'absolute',
          left: '50%', 
          top: '50%',  
          width: '80px',
          height: '80px',
          marginLeft: '-40px', 
          marginTop: '-40px',  
          backgroundColor: '#fff',
          borderRadius: '50%',
          transform: `translateY(${yOffset}px)`, 
          // 第一層是動態的情緒光 (glowSpread 與 glowColor)
          // 第二層是固定的環境底光
          boxShadow: `0 0 ${glowSpread}px 10px ${glowColor}, 0 0 80px rgba(255, 255, 255, 0.2)`,
          zIndex: 5
        }} />

      </div>

    </AbsoluteFill>
  );
};