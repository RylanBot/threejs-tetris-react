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

const NextPreviewCard: React.FC<{ type: TetriminoType; positionX: number }> = ({ type, positionX }) => {
  const blocks = TETRIMINOS[type].blocks;
  const { scale, position } = getPreviewLayout(blocks);

  return (
    <Html
      position={[positionX, 0.65, 0]}
      className="next-label"
    >
      <h2>Next</h2>
      <div className="next-preview">
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
      </div>
    </Html>
  );
};

export default NextPreviewCard;
