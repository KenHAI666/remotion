import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';

const SLIDE_FRAMES = 90;
const TOTAL_SLIDES = 5;
const DURATION = SLIDE_FRAMES * TOTAL_SLIDES;

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 28,
  padding: '120px 90px',
  color: '#fff',
  fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
  textAlign: 'center',
  background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 55%, #2c2c2c 100%)',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 860,
  borderRadius: 28,
  padding: '50px 46px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 65px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(4px)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 76,
  fontWeight: 900,
  lineHeight: 1.2,
  letterSpacing: 1,
  margin: 0,
};

const subStyle: React.CSSProperties = {
  fontSize: 44,
  lineHeight: 1.45,
  fontWeight: 600,
  opacity: 0.95,
  margin: 0,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '10px 0 0 0',
  padding: 0,
  display: 'grid',
  gap: 16,
  textAlign: 'left',
};

const listItemStyle: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 600,
  lineHeight: 1.4,
  padding: '0 8px',
};

const Slide: React.FC<{ children: React.ReactNode; from: number }> = ({ children, from }) => {
  const frame = useCurrentFrame();
  const local = frame - from;

  const opacity = interpolate(local, [0, 12, SLIDE_FRAMES - 14, SLIDE_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(local, [0, 18], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ ...pageStyle, opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const StaircaseScript: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={SLIDE_FRAMES}>
        <Slide from={0}>
          <div style={cardStyle}>
            <h1 style={titleStyle}>你看到的奇蹟，</h1>
            <h1 style={titleStyle}>其實是樓梯。</h1>
            <p style={{ ...subStyle, marginTop: 28 }}>沒人能直接跳到終點。</p>
          </div>
        </Slide>
      </Sequence>

      <Sequence from={SLIDE_FRAMES} durationInFrames={SLIDE_FRAMES}>
        <Slide from={SLIDE_FRAMES}>
          <div style={cardStyle}>
            <h2 style={{ ...titleStyle, fontSize: 62 }}>痛點：你以為自己不夠厲害</h2>
            <p style={{ ...subStyle, marginTop: 20 }}>其實只是把「過程」當成「天賦差距」。</p>
            <p style={{ ...subStyle, marginTop: 8 }}>普通人會在起點懷疑，高手在階梯上累積。</p>
          </div>
        </Slide>
      </Sequence>

      <Sequence from={SLIDE_FRAMES * 2} durationInFrames={SLIDE_FRAMES}>
        <Slide from={SLIDE_FRAMES * 2}>
          <div style={cardStyle}>
            <h2 style={{ ...titleStyle, fontSize: 62 }}>How：五階行動路徑</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>PLAN：制定具體可執行的計畫</li>
              <li style={listItemStyle}>ACTION：先完成，再完美</li>
              <li style={listItemStyle}>FOCUS：屏蔽雜訊，專注賽道</li>
              <li style={listItemStyle}>PATIENCE：熬過無人問津的時期</li>
              <li style={listItemStyle}>DISCIPLINE：把熱情變成肌肉記憶</li>
            </ul>
          </div>
        </Slide>
      </Sequence>

      <Sequence from={SLIDE_FRAMES * 3} durationInFrames={SLIDE_FRAMES}>
        <Slide from={SLIDE_FRAMES * 3}>
          <div style={cardStyle}>
            <h2 style={{ ...titleStyle, fontSize: 62 }}>What：差距其實在階梯位置</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>普通人：在 PLAN 與 ACTION 之間內耗</li>
              <li style={listItemStyle}>頂尖 IP：在 PATIENCE 與 DISCIPLINE 扎根</li>
              <li style={listItemStyle}>結果：一邊焦慮，一邊形成護城河</li>
            </ul>
          </div>
        </Slide>
      </Sequence>

      <Sequence from={SLIDE_FRAMES * 4} durationInFrames={SLIDE_FRAMES}>
        <Slide from={SLIDE_FRAMES * 4}>
          <div style={{ ...cardStyle, border: '1px solid rgba(255, 229, 122, 0.55)' }}>
            <h2 style={{ ...titleStyle, fontSize: 64, color: '#ffe57a' }}>CTA</h2>
            <p style={{ ...subStyle, marginTop: 16 }}>留言「紀律」</p>
            <p style={subStyle}>私訊你我私藏的《創作者日更查核表》</p>
            <p style={{ ...subStyle, fontWeight: 800, marginTop: 10 }}>限時 24 小時領取</p>
          </div>
        </Slide>
      </Sequence>
    </AbsoluteFill>
  );
};

export const staircaseScriptDuration = DURATION;
