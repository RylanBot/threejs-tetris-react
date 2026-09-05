import { useEffect, useRef, useState } from 'react';

import { Vector3 } from 'three';
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import {
  CameraDirectionUpdater,
  ControlButton,
  MiniAxes,
  MobileControlGroup,
  NextPreviewCard,
  ThreeSidedGrid,
} from '@/components';
import { TetriminoGroup, TetriminoPile, TETRIMINOS } from '@/components/Tetrimino';
import { HIGH_SCORE_KEY, isMobileDevice } from '@/libs/common';
import { applyRandomRotation, getRandomPosition, getRandomTetrimino } from '@/libs/generator';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Block, TetriminoType } from '@/components/Tetrimino';
import type { ThreePosition } from '@/libs/common';

const Tetris: React.FC = () => {
  const [currType, setCurrType] = useState<TetriminoType | null>(null);
  const [nextType, setNextType] = useState<TetriminoType | null>(null);
  const [position, setPosition] = useState<ThreePosition | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
    return savedScore ? parseInt(savedScore) : 0;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const isMobile = isMobileDevice();
  const panelX = isMobile ? -0.25 : -0.75;

  const [cameraDirection, setCameraDirection] = useState(new Vector3());
  const [gridState, setGridState] = useState<(string | null)[][][]>(() => {
    const initialState = [];
    for (let i = 0; i < 6; i++) {
      const xLayer = [];
      for (let j = 0; j < 6; j++) {
        const yLayer = new Array(12).fill(null);
        xLayer.push(yLayer);
      }
      initialState.push(xLayer);
    }
    return initialState;
  });

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const fallIntervalRef = useRef<number | undefined>();

  // 初始化新方块
  const generateNewTetrimino = () => {
    if (gameOver || !nextType) return;

    setCurrType(nextType); // 使用预测的方块作为当前方块

    const newBlocks = applyRandomRotation(TETRIMINOS[nextType].blocks);
    const newPosition = getRandomPosition(newBlocks);

    setBlocks(newBlocks);
    setPosition(newPosition);
    startFall();

    const newNextType = getRandomTetrimino(); // 预测下一个方块
    setNextType(newNextType);
  };

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);

    const newType = getRandomTetrimino();
    const newBlocks = applyRandomRotation(TETRIMINOS[newType].blocks);
    const newPosition = getRandomPosition(newBlocks);

    setCurrType(newType);
    setBlocks(newBlocks);
    setPosition(newPosition);
    setNextType(getRandomTetrimino());

    setIsPaused(false);
  };

  // 结束游戏
  const resetGame = () => {
    setCurrType(null);
    setBlocks(null);
    setPosition(null);
    setNextType(null);
    setScore(0);

    // 清空已落下的方块
    setGridState((prevState) => {
      const newState = [...prevState];
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          newState[i][j].fill(null);
        }
      }
      return newState;
    });

    setIsPaused(false);
    setGameStarted(false);
    setGameOver(false);

    // 停止方块下落
    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current);
    }
  };

  const handleGameEnd = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
    resetGame();
  };

  // 暂停游戏
  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  // 方块开始下落
  const startFall = () => {
    if (!position || !blocks || !currType || isPaused || gameOver) return;

    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current);
    }

    fallIntervalRef.current = setInterval(() => {
      const [x, y, z] = position;
      const newY = y - 1; // 预测的新位置
      const predictedBlocksPosition = blocks.map((block) => ({
        x: block.x + x,
        y: block.y + newY,
        z: block.z + z,
      }));

      if (isValidPosition(predictedBlocksPosition)) {
        setPosition([x, newY, z]); // 如果预测的新位置有效，再更新
      } else {
        addBlockToGrid(
          blocks.map((block) => ({
            x: block.x + x,
            y: block.y + y,
            z: block.z + z,
          })),
          TETRIMINOS[currType].color,
        ); // 使用当前位置
        generateNewTetrimino();
      }
    }, 1000) as unknown as number;
  };

  // 限制方块运动边界
  const isValidPosition = (newBlocks: Block[]) => {
    for (let { x, y, z } of newBlocks) {
      x = Math.floor(x);
      y = Math.floor(y);
      z = Math.floor(z);

      if (x < 0 || x >= 6 || z < 0 || z >= 6 || y < 0 || y >= 12 || gridState[x][z][y] !== null) {
        return false;
      }
    }

    return true;
  };

  // 添加当前方块到已下落的方块集合
  const addBlockToGrid = (blocksPosition: Block[], color: string) => {
    const newGridState = [...gridState];

    for (const block of blocksPosition) {
      const x = Math.floor(block.x);
      const y = Math.floor(block.y);
      const z = Math.floor(block.z);
      newGridState[x][z][y] = color;
    }
    setGridState(newGridState);

    setScore((prevScore) => prevScore + 2); // 成功下降就 +2

    for (let y = 0; y < 12; y++) {
      if (isRowFull(y)) {
        clearRow(y);
      }
    }

    // 检查顶层是否已满
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 6; z++) {
        if (newGridState[x][z][11] !== null) {
          setGameOver(true);
          break;
        }
      }
    }
  };

  // 操控位置移动
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isPaused || !position || !blocks) return;

    let [x, y, z] = position;
    let newBlocks = blocks;
    const azimuthAngle = controlsRef.current?.getAzimuthalAngle() || 0;

    switch (e.key.toUpperCase()) {
      case 'W':
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          z -= 1;
        } else {
          x -= 1;
        }
        break;
      case 'S':
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          z += 1;
        } else {
          x += 1;
        }
        break;
      case 'A':
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          x -= 1;
        } else {
          z += 1;
        }
        break;
      case 'D':
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          x += 1;
        } else {
          z -= 1;
        }
        break;
      // 沿x轴旋转
      case 'Q':
        newBlocks = blocks.map((block) => ({
          x: block.x,
          y: block.z,
          z: -block.y,
        }));
        break;
      // 沿y轴旋转
      case 'E':
        newBlocks = blocks.map((block) => ({
          x: -block.z,
          y: block.y,
          z: block.x,
        }));
        break;
      //沿z轴旋转
      case 'R':
        newBlocks = blocks.map((block) => ({
          x: block.y,
          y: -block.x,
          z: block.z,
        }));
        break;
      case ' ':
        hardDrop();
        return;
      default:
        break;
    }

    const newBlocksPosition = newBlocks.map((block) => ({
      x: block.x + x,
      y: block.y + y,
      z: block.z + z,
    }));
    if (isValidPosition(newBlocksPosition)) {
      setPosition([x, y, z]);
      setBlocks(newBlocks);
      startFall();
    }
  };

  // 硬降落（直接到达底部）
  const hardDrop = () => {
    if (gameOver || !position || !blocks || !currType) return;

    let [x, y, z] = position;
    while (true) {
      const newY = y - 1;
      const predictedBlocksPosition = blocks.map((block) => ({
        x: block.x + x,
        y: block.y + newY,
        z: block.z + z,
      }));
      if (!isValidPosition(predictedBlocksPosition)) {
        break;
      }
      y = newY;
    }

    addBlockToGrid(
      blocks.map((block) => ({
        x: block.x + x,
        y: block.y + y,
        z: block.z + z,
      })),
      TETRIMINOS[currType].color,
    );
    generateNewTetrimino();
  };

  // 检查某一行是否已满
  const isRowFull = (y: number): boolean => {
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 6; z++) {
        if (gridState[x][z][y] === null) {
          return false;
        }
      }
    }
    return true;
  };

  // 清空已满的一行
  const clearRow = (y: number) => {
    const newGridState = [...gridState];
    for (let i = y; i < 11; i++) {
      for (let x = 0; x < 6; x++) {
        for (let z = 0; z < 6; z++) {
          newGridState[x][z][i] = newGridState[x][z][i + 1];
        }
      }
    }
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 6; z++) {
        newGridState[x][z][11] = null;
      }
    }
    setGridState(newGridState);
    setScore((prevScore) => prevScore + 10);
  };

  useEffect(() => {
    const cleanupFall = () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current);
      }
    };

    if (gameStarted && !isPaused) {
      startFall();
      window.addEventListener('keydown', handleKeyDown);
    } else {
      cleanupFall();
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      cleanupFall();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, blocks, gameStarted, isPaused]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [gameOver, score, highScore]);

  return (
    <>
      {/* 页面标题 */}
      <div className="game-header">
        <div>
          <a
            className="github-logo"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/RylanBot/threejs-tetris-react"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.38-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.77.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.53-1.52.12-3.18 0 0 .98-.31 3.21 1.23a11.1 11.1 0 0 1 2.92-.39c.99.01 2.02.14 3.01.39 2.29-1.54 3.28-1.23 3.28-1.23.65 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0Z" />
            </svg>
          </a>

          <h1 className="title-3d">3D Tetris</h1>
        </div>

        <div className="game-buttons-container">
          <ControlButton
            bgColor="#77c899"
            shadowColor="#27ae60"
            onClick={gameStarted ? handleGameEnd : startGame}
          >
            {gameStarted ? 'Quit' : 'Start'}
          </ControlButton>

          <ControlButton
            style={{ display: gameStarted && !gameOver ? 'block' : 'none' }}
            bgColor="#d77469"
            shadowColor="#c0392b"
            onClick={togglePause}
          >
            {isPaused ? 'Continue' : 'Pause'}
          </ControlButton>
        </div>
      </div>

      {/* 游戏主体 */}
      <div className="game-container">
        {gameOver && (
          <div className="game-over-container">
            <h1>GAME OVER</h1>
          </div>
        )}

        {/* 游戏内容 */}
        <div className="game-canvas-left">
          <Canvas>
            <ambientLight intensity={2} />
            <OrbitControls
              ref={controlsRef}
              target={[2, 6, 0]}
              minDistance={20}
              maxDistance={20}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
              minAzimuthAngle={0}
              maxAzimuthAngle={Math.PI / 2}
              enabled={!isPaused}
              enablePan={false}
            />
            <CameraDirectionUpdater onChange={setCameraDirection} />

            <ThreeSidedGrid />
            {currType && position && blocks && (
              <TetriminoGroup
                position={position}
                type={currType}
                blocks={blocks}
              />
            )}
            <TetriminoPile grid={gridState} />
          </Canvas>
        </div>

        {/* 其余信息 */}
        <div className="game-canvas-right">
          <Canvas
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <ambientLight />

            {gameStarted && (
              <Html
                position={[panelX, 1.6, 0]}
                className="score-label"
              >
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
              </Html>
            )}

            {nextType && (
              <NextPreviewCard
                type={nextType}
                positionX={panelX}
              />
            )}

            <Html
              position={[panelX, -0.4, 0]}
              className="instructions-label"
            >
              <ul>
                <li>
                  <strong>Drag</strong> <span className="button-3d key-3d">Mouse</span>
                </li>
                <li>
                  <strong>Rotate</strong>
                  <ul>
                    <li>
                      <strong>X-axis</strong> <span className="button-3d key-3d">Q</span>
                    </li>
                    <li>
                      <strong>Y-axis</strong> <span className="button-3d key-3d">E</span>
                    </li>
                    <li>
                      <strong>Z-axis</strong> <span className="button-3d key-3d">R</span>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Drop</strong> <span className="button-3d key-3d">Space</span>
                </li>
              </ul>
            </Html>

            <MiniAxes
              position={[panelX + 0.75, -2.75, 0]}
              direction={cameraDirection}
            />
          </Canvas>
        </div>

        <MobileControlGroup />
      </div>
    </>
  );
};

export default Tetris;
