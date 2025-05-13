import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from "three";

interface CameraDirectionUpdaterProps {
    setDirection: (dir: Vector3) => void;
}

const CameraDirectionUpdater: React.FC<CameraDirectionUpdaterProps> = ({ setDirection }) => {
    const { camera } = useThree();

    useFrame(() => {
        const direction = new Vector3();
        camera.getWorldDirection(direction);
        setDirection(direction);
    });

    return null;
};

export default CameraDirectionUpdater;