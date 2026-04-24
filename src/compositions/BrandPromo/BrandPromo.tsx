import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../../theme';
import { Avatar } from '../../components/Avatar';

export const BrandPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: theme.colors.dark,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}>
      <Avatar width={600} />
      <div style={{
        opacity: titleOpacity,
        fontSize: 80,
        fontWeight: 900,
        color: theme.colors.primary,
        fontFamily: 'sans-serif',
        marginTop: 40,
      }}>
        被看見，才能變現
      </div>
    </AbsoluteFill>
  );
};
