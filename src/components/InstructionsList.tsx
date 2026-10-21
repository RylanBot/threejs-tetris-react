interface InstructionsListProps {
  compact?: boolean;
}

/**
 * 操作说明列表
 */
const InstructionsList: React.FC<InstructionsListProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <ul>
        <li>
          <strong>Drag</strong> <span className="button-3d key-3d">Touch</span>
        </li>
        <li>
          <strong>Rotate</strong>
          <ul>
            <li>
              <strong>X</strong> <span className="button-3d key-3d">Q</span>
            </li>
            <li>
              <strong>Y</strong> <span className="button-3d key-3d">E</span>
            </li>
            <li>
              <strong>Z</strong> <span className="button-3d key-3d">R</span>
            </li>
          </ul>
        </li>
        <li>
          <strong>Drop</strong> <span className="button-3d key-3d">Space</span>
        </li>
      </ul>
    );
  }

  return (
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
  );
};

export default InstructionsList;
