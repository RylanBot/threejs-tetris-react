import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import MiniAxes from './MiniAxes';
import NextPreviewCard from './NextPreviewCard';

import type { Vector3 } from 'three';
import type { ThreePosition } from '@/libs/common';
import type { TetriminoType } from './Tetrimino';

type SideHudLayout = {
  panelX: number;
  center: boolean;
  scoreY: number;
  nextY: number;
  instructionsY: number;
  axesPosition: ThreePosition;
  axesScale: number;
  instructionsMobile: boolean;
};

type ScoreLabelProps = {
  score: number;
  highScore: number;
};

type GameSideHudProps = {
  mobile: boolean;
  gameStarted: boolean;
  score: number;
  highScore: number;
  nextType: TetriminoType | null;
  cameraDirection: Vector3;
};

const SIDE_HUD_LAYOUT: { mobile: SideHudLayout; desktop: SideHudLayout } = {
  desktop: {
    panelX: -0.75,
    center: false,
    scoreY: 1.6,
    nextY: 0.65,
    instructionsY: -0.4,
    axesPosition: [0, -2.75, 0],
    axesScale: 0.4,
    instructionsMobile: false,
  },
  mobile: {
    panelX: 0,
    center: true,
    scoreY: 2.15,
    nextY: 1.05,
    instructionsY: -0.75,
    axesPosition: [0, -2.55, 0],
    axesScale: 0.42,
    instructionsMobile: true,
  },
};

const ROTATION_AXES = [
  {
    axis: 'X',
    key: 'Q',
  },
  {
    axis: 'Y',
    key: 'E',
  },
  {
    axis: 'Z',
    key: 'R',
  },
] as const;

const InstructionsList: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => (
  <ul className="instruction-list">
    <li>
      <strong>Drag</strong>
      <span />
      <span className="button-3d key-3d">{mobile ? 'Touch' : 'Mouse'}</span>
    </li>
    <li>
      <strong className="instruction-rotate">Rotate</strong>
      {ROTATION_AXES.map(({ axis, key }) => (
        <span
          key={key}
          className="instruction-pair"
        >
          <strong className="instruction-axis">{mobile ? axis : `${axis}-axis`}</strong>
          <span className="button-3d key-3d">{key}</span>
        </span>
      ))}
    </li>
    <li>
      <strong>Drop</strong>
      <span />
      <span className="button-3d key-3d">Space</span>
    </li>
  </ul>
);

const ScoreLabelItems: React.FC<ScoreLabelProps> = ({ score, highScore }) => (
  <>
    <div className="score-item">
      <h2>Score</h2>
      <h2>{score}</h2>
    </div>
    {highScore > 0 && (
      <div className="score-item">
        <h2>High</h2>
        <h2>{highScore}</h2>
      </div>
    )}
  </>
);

const GameSideHud: React.FC<GameSideHudProps> = ({
  mobile,
  gameStarted,
  score,
  highScore,
  nextType,
  cameraDirection,
}) => {
  const layout = mobile ? SIDE_HUD_LAYOUT.mobile : SIDE_HUD_LAYOUT.desktop;

  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        background: 'transparent',
      }}
    >
      <ambientLight />

      {gameStarted && (
        <Html
          position={[layout.panelX, layout.scoreY, 0]}
          center={layout.center}
          className="score-label"
        >
          <ScoreLabelItems
            score={score}
            highScore={highScore}
          />
        </Html>
      )}

      {nextType && (
        <NextPreviewCard
          type={nextType}
          positionX={layout.panelX}
          positionY={layout.nextY}
          center={layout.center}
        />
      )}

      <Html
        position={[layout.panelX, layout.instructionsY, 0]}
        center={layout.center}
        className="instructions-label"
      >
        <InstructionsList mobile={layout.instructionsMobile} />
      </Html>

      <MiniAxes
        position={layout.axesPosition}
        scale={layout.axesScale}
        direction={cameraDirection}
      />
    </Canvas>
  );
};

export default GameSideHud;
