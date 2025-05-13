import { simulateKeyPress } from "@/libs/keyboardUtils";
import ControlButton from "./ControlButton";

const MobileControlGroup = () => {
  if (
    !/Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
  ) {
    return null;
  }

  return (
    <div className="mobile-buttons-group">
      <div className="mobile-button-row">
        <ControlButton
          onClick={simulateKeyPress("Q")}
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
        >
          Q
        </ControlButton>
        <ControlButton
          onClick={simulateKeyPress("W")}
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
        >
          W
        </ControlButton>
        <ControlButton
          onClick={simulateKeyPress("E")}
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
        >
          E
        </ControlButton>
        <ControlButton
          onClick={simulateKeyPress("R")}
          bgColor="#e6d18d"
          shadowColor="#d3ad60"
        >
          R
        </ControlButton>
      </div>
      <div className="mobile-button-row">
        <ControlButton
          onClick={simulateKeyPress("A")}
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
        >
          A
        </ControlButton>
        <ControlButton
          onClick={simulateKeyPress("S")}
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
        >
          S
        </ControlButton>
        <ControlButton
          onClick={simulateKeyPress("D")}
          bgColor="#69c8d7"
          shadowColor="#57a7ca"
        >
          D
        </ControlButton>
      </div>
      <div className="mobile-button-row space-row">
        <ControlButton
          onClick={simulateKeyPress(" ")}
          bgColor="#a883cb"
          shadowColor="#9e58b4"
          style={{ padding: "10px 25px" }}
        >
          SPACE
        </ControlButton>
      </div>
    </div>
  );
};

export default MobileControlGroup;
