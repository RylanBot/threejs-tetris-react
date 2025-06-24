import ControlButton from './ControlButton';

/**
 * 移动端模拟键盘
 */
const MobileControlGroup = () => {
  if (
    !/Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
  ) {
    return null;
  }

  const simulateKeyPress = (key: string) => {
    return () => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
      });
      document.dispatchEvent(event);
    };
  };

  return (
    <div className="mobile-buttons-group">
      <div className="mobile-button-row">
        <ControlButton
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
          onClick={simulateKeyPress("Q")}          
        >
          Q
        </ControlButton>
        <ControlButton
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
          onClick={simulateKeyPress("W")}
        >
          W
        </ControlButton>
        <ControlButton
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
          onClick={simulateKeyPress("E")}          
        >
          E
        </ControlButton>
        <ControlButton
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
          onClick={simulateKeyPress("R")}
        >
          R
        </ControlButton>
      </div>
      <div className="mobile-button-row">
        <ControlButton
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
          onClick={simulateKeyPress("A")}
        >
          A
        </ControlButton>
        <ControlButton
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
          onClick={simulateKeyPress("S")}
        >
          S
        </ControlButton>
        <ControlButton
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
          onClick={simulateKeyPress("D")}
        >
          D
        </ControlButton>
      </div>
      <div className="mobile-button-row space-row">
        <ControlButton
          style={{ padding: "10px 25px" }}
          bgColor="#a883cb"
          shadowColor="#9e58b4"
          onClick={simulateKeyPress(" ")}
        >
          SPACE
        </ControlButton>
      </div>
    </div>
  );
};

export default MobileControlGroup;