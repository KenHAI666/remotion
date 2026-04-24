import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const Avatar: React.FC<{ width?: number }> = ({ width = 600 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { stiffness: 100 } });
  const breath = interpolate(Math.sin(frame / 15), [-1, 1], [0.98, 1.02]);

  return (
    <div style={{ width, transform: `scale(${entrance * breath})` }}>
      <img 
        src={require('../assets/cat-v.png')} 
        style={{ width: '100%', height: 'auto' }} 
      />
    </div>
  );
};
