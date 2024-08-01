import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';

import CameraDirectionUpdater from '@/components/CameraDirectionUpdater';
import ControlButton from '@/components/ControlButton';
import MiniAxes from '@/components/MiniAxes';
import MobileControlGroup from '@/components/MobileControlGroup';
import { Block, FallenCubes, TetriminoSet, TetriminoType, Tetriminos } from '@/components/Tetrimino';
import ThreeSidedGrid from '@/components/ThreeSidedGrid';

import { getRandomPosition, getRandomTetrimino, rotateRandomly } from '@/libs/initUtils.ts';

const Tetris: React.FC = () => {
    const [type, setType] = useState<TetriminoType | null>(null);
    const [position, setPosition] = useState<[number, number, number] | null>(null);
    const [blocks, setBlocks] = useState<Block[] | null>(null);
    const [nextType, setNextType] = useState<TetriminoType | null>(null);
    const [score, setScore] = useState(0);

    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controlsRef = useRef<any>(null);
    const fallIntervalRef = useRef<number | undefined>();

    // 初始化新方块
    const generateNewTetrimino = () => {
        if (gameOver || !nextType) return;

        setType(nextType); // 使用预测的方块作为当前方块

        const newBlocks = rotateRandomly(Tetriminos[nextType].blocks);
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
        const newBlocks = rotateRandomly(Tetriminos[newType].blocks);
        const newPosition = getRandomPosition(newBlocks);

        setType(newType);
        setBlocks(newBlocks);
        setPosition(newPosition);
        setNextType(getRandomTetrimino());

        setIsPaused(false);
    };

    // 结束游戏
    const resetGame = () => {
        setType(null);
        setBlocks(null);
        setPosition(null);
        setNextType(null);
        setScore(0);

        // 清空已落下的方块
        setGridState(prevState => {
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

    // 暂停游戏
    const togglePause = () => {
        setIsPaused(prevIsPaused => !prevIsPaused);
    };

    // 方块开始下落
    const startFall = () => {
        if (!position || !blocks || !type || isPaused || gameOver) return;

        if (fallIntervalRef.current) {
            clearInterval(fallIntervalRef.current);
        }

        fallIntervalRef.current = setInterval(() => {
            const [x, y, z] = position;
            const newY = y - 1;  // 预测的新位置
            const predictedBlocksPosition = blocks.map(block => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));

            if (isValidPosition(predictedBlocksPosition)) {
                setPosition([x, newY, z]);  // 如果预测的新位置有效，再更新
            } else {
                addBlockToGrid(blocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z })), Tetriminos[type].color); // 使用当前位置
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

            if (
                x < 0 || x >= 6 ||
                z < 0 || z >= 6 ||
                y < 0 || y >= 12 ||
                gridState[x][z][y] !== null
            ) {
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

        setScore(prevScore => prevScore + 2);  // 成功下降就+2

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

        // eslint-disable-next-line prefer-const
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
                newBlocks = blocks.map(block => ({ x: block.x, y: block.z, z: -block.y }));
                break;
            // 沿y轴旋转
            case 'E':
                newBlocks = blocks.map(block => ({ x: -block.z, y: block.y, z: block.x }));
                break;
            //沿z轴旋转
            case 'R':
                newBlocks = blocks.map(block => ({ x: block.y, y: -block.x, z: block.z }));
                break;
            case ' ':
                hardDrop();
                return;
            default:
                break;
        }

        const newBlocksPosition = newBlocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z }));
        if (isValidPosition(newBlocksPosition)) {
            setPosition([x, y, z]);
            setBlocks(newBlocks);
            startFall();
        }
    };

    // 硬降落（直接到达底部）
    const hardDrop = () => {
        if (gameOver || !position || !blocks || !type) return;

        // eslint-disable-next-line prefer-const
        let [x, y, z] = position;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const newY = y - 1;
            const predictedBlocksPosition = blocks.map(block => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));
            if (!isValidPosition(predictedBlocksPosition)) {
                break;
            }
            y = newY;
        }

        addBlockToGrid(blocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z })), Tetriminos[type].color);
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
        setScore(prevScore => prevScore + 10);
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

    return (
        <>
            {/* 页面标题 */}
            <div className="game-header">
                <a href="https://github.com/RylanBot/threejs-tetris-react"
                    target="_blank"
                    rel="noopener noreferrer">
                    <img src={'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png'} alt="Project Repository" className="github-logo" />
                </a>

                <h1 className='title-3d'>3D Tetris</h1>

                <div className='game-buttons-container'>
                    <ControlButton
                        onClick={gameStarted ? resetGame : startGame}
                        bgColor='#77c899'
                        shadowColor='#27ae60'
                    > 
                        {gameStarted ? "Quit" : "Start"}
                    </ControlButton>

                    <ControlButton
                        onClick={togglePause}
                        bgColor='#d77469'
                        shadowColor='#c0392b'
                        style = {{display: gameStarted && !gameOver ? 'block' : 'none'}}
                    > 
                        {isPaused ? "Continue" : "Pause"}
                    </ControlButton>
                </div>
            </div>

            {/* 游戏主体 */}
            <div className='game-container'>
                {gameOver && (
                    <div className="game-over-container">
                        <h1>Game Over</h1>
                    </div>
                )}

                {/* 游戏内容 */}
                <div className='game-canvas-left'>
                    <Canvas style={{ width: '100%', height: '100%' }}>
                        <ambientLight intensity={2} />
                        <OrbitControls
                            ref={controlsRef}
                            target={[2, 6, 0]}
                            minDistance={20} maxDistance={20}
                            minPolarAngle={0} maxPolarAngle={Math.PI / 2}
                            minAzimuthAngle={0} maxAzimuthAngle={Math.PI / 2}
                            enabled={!isPaused}
                            enablePan={false}
                        />
                        <CameraDirectionUpdater setDirection={setCameraDirection} />

                        <ThreeSidedGrid />
                        {type && position && blocks && (
                            <TetriminoSet type={type} position={position} blocks={blocks} />
                        )}
                        <FallenCubes gridState={gridState} />
                    </Canvas>
                </div>

                {/* 其余信息 */}
                <div className='game-canvas-right'>
                    <Canvas style={{ width: '100%', height: '100%' }}>
                        <ambientLight />

                        {nextType && (
                            <>
                                <Html position={[-0.75, 1.55, 0]} className='next-block-label'>
                                    <h2>Next:</h2>
                                </Html>
                                <TetriminoSet
                                    type={nextType}
                                    position={[0.55, 1.4, 0]}
                                    blocks={Tetriminos[nextType].blocks}
                                    scale={0.15} />

                                <Html position={[-0.75, 0.75, 0]} className='score-label'>
                                    <h2>Score: &nbsp; {score}</h2>
                                </Html>
                            </>
                        )}
                        <Html position={[-0.85, 0.15, 0]} className='instructions-label'>
                            <ul>
                                <li><strong>Drag:</strong> <span>Mouse</span></li>
                                <li><strong>Rotate:</strong>
                                    <ul>
                                        <li><strong>X-axis:</strong> Q</li>
                                        <li><strong>Y-axis:</strong> E</li>
                                        <li><strong>Z-axis:</strong> R</li>
                                    </ul>
                                </li>
                                <li><strong>Hard Drop:</strong> <span>Space</span></li>
                            </ul>
                        </Html>
                        <MiniAxes cameraDirection={cameraDirection} position={[0.25, -2.5, 0]} />
                    </Canvas>
                </div>

                <MobileControlGroup/>
            </div>
        </>
    );
}

export default Tetris;