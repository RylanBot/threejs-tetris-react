import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
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
    const [highScore, setHighScore] = useState(() => {
        const savedScore = localStorage.getItem('tetrisHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    });

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

    const controlsRef = useRef<any>(null);
    const fallIntervalRef = useRef<number | undefined>();

 
    const generateNewTetrimino = () => {
        if (gameOver || !nextType) return;

        setType(nextType); 

        const newBlocks = rotateRandomly(Tetriminos[nextType].blocks);
        const newPosition = getRandomPosition(newBlocks);

        setBlocks(newBlocks);
        setPosition(newPosition);
        startFall();

        const newNextType = getRandomTetrimino(); 
        setNextType(newNextType);
    };

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

    
    const handleGameEnd = () => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('tetrisHighScore', score.toString());
        }
        resetGame();
    };

    const resetGame = () => {
        setType(null);
        setBlocks(null);
        setPosition(null);
        setNextType(null);
        setScore(0);
        
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

        if (fallIntervalRef.current) {
            clearInterval(fallIntervalRef.current);
        }
    };

    const togglePause = () => {
        setIsPaused(prevIsPaused => !prevIsPaused);
    };

    const startFall = () => {
        if (!position || !blocks || !type || isPaused || gameOver) return;

        if (fallIntervalRef.current) {
            clearInterval(fallIntervalRef.current);
        }

        fallIntervalRef.current = setInterval(() => {
            const [x, y, z] = position;
            const newY = y - 1;
            const predictedBlocksPosition = blocks.map(block => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));

            if (isValidPosition(predictedBlocksPosition)) {
                setPosition([x, newY, z]);
            } else {
                addBlockToGrid(blocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z })), Tetriminos[type].color);
                generateNewTetrimino();
            }
        }, 1000) as unknown as number;
    };

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

    const addBlockToGrid = (blocksPosition: Block[], color: string) => {
        const newGridState = [...gridState];

        for (const block of blocksPosition) {
            const x = Math.floor(block.x);
            const y = Math.floor(block.y);
            const z = Math.floor(block.z);
            newGridState[x][z][y] = color;
        }
        setGridState(newGridState);

        setScore(prevScore => prevScore + 2);

        for (let y = 0; y < 12; y++) {
            if (isRowFull(y)) {
                clearRow(y);
            }
        }

        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 6; z++) {
                if (newGridState[x][z][11] !== null) {
                    setGameOver(true);
                    break;
                }
            }
        }
    };

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
            case 'Q':
                newBlocks = blocks.map(block => ({ x: block.x, y: block.z, z: -block.y }));
                break;
            case 'E':
                newBlocks = blocks.map(block => ({ x: -block.z, y: block.y, z: block.x }));
                break;
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

    const hardDrop = () => {
        if (gameOver || !position || !blocks || !type) return;

        let [x, y, z] = position;
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

    useEffect(() => {
        if (gameOver && score > highScore) {
            setHighScore(score);
            localStorage.setItem('tetrisHighScore', score.toString());
        }
    }, [gameOver, score, highScore]);

    return (
        <>
            <div className="game-header">
                <a href="https://github.com/RylanBot/threejs-tetris-react"
                    target="_blank"
                    rel="noopener noreferrer">
                    <img src={'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png'} alt="Project Repository" className="github-logo" />
                </a>

                <h1 className='title-3d'>3D Tetris</h1>

                <div className='game-buttons-container'>
                    <ControlButton
                        onClick={gameStarted ? handleGameEnd : startGame}
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

            <div className='game-container'>
                {gameOver && (
                    <div className="game-over-container">
                        <h1>Game Over</h1>
                    </div>
                )}

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

                                <Html position={[-0.75, 0.75, 0]} className='score-container'>
                                    <div style={{ display: 'flex', gap: '20px', color:"white" }}>
                                        <h2>Score: {score}</h2>
                                        <h2>High: {highScore}</h2>
                                    </div>
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