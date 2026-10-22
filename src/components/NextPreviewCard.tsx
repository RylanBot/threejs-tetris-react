import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { TetriminoGroup, TETRIMINOS } from './Tetrimino';

import type { ThreePosition } from '@/libs/common';
import type { Block, TetriminoType } from './Tetrimino';

const NEXT_PREVIEW_SIZE = 1.7;

const getPreviewLayout = (blocks: Block[]) => {
  const xs = blocks.map((block) => block.x);
  const ys = blocks.map((block) => block.y);
  const zs = blocks.map((block) => block.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1) + 1;
  const scale = NEXT_PREVIEW_SIZE / extent;

  return {
    scale,
    position: [
      (-(minX + maxX) / 2) * scale,
      (-(minY + maxY) / 2) * scale,
      (-(minZ + maxZ) / 2) * scale,
    ] as ThreePosition,
  };
};

const PreviewCanvas: React.FC<{ type: TetriminoType }> = ({ type }) => {
  const blocks = TETRIMINOS[type].blocks;
  const { scale, position } = getPreviewLayout(blocks);

  return (
    <Canvas
      camera={{
        position: [1.6, 1.2, 3.6],
        fov: 40,
      }}
      gl={{
        alpha: true,
        antialias: true,
      }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[2, 3, 4]}
        intensity={0.85}
      />
      <TetriminoGroup
        position={position}
        type={type}
        blocks={blocks}
        scale={scale}
      />
    </Canvas>
  );
};

const NextPreviewCard: React.FC<{
  type: TetriminoType;
  positionX?: number;
  positionY?: number;
  center?: boolean;
}> = ({ type, positionX = 0, positionY = 0.65, center = false }) => (
  <Html
    position={[positionX, positionY, 0]}
    center={center}
    className="next-label"
  >
    <h2>Next</h2>
    <div className="next-preview">
      <PreviewCanvas type={type} />
    </div>
  </Html>
);

export default NextPreviewCard;
