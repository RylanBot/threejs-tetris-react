import { ReactNode, useState } from 'react';

interface ButtonProps {
  children: ReactNode;
  bgColor: string;
  shadowColor: string;
  style?: React.CSSProperties;
  onClick: () => void;
}

/**
 * 立体按钮组件
 */
const ControlButton: React.FC<ButtonProps> = ({
  onClick,
  children,
  bgColor,
  shadowColor,
  style,
}) => {
  const [isActive, setIsActive] = useState(false);

  // rgba 转 rgb
  const rgbBgColor = bgColor
    .match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    ?.slice(1)
    .map((v) => parseInt(v, 16))
    .join(",") || bgColor;

  const defaultStyle = {
    backgroundColor: bgColor,
    boxShadow: `6px 0px 0px ${shadowColor}, 10px 0px 20px rgba(${rgbBgColor}, 0.3)`,
  };

  const activeStyle = {
    transform: 'translate(4px, 4px)',
    boxShadow: `2px 0px 0px ${shadowColor}, 5px 0px 10px rgba(${rgbBgColor}, 0.3)`,
  };

  return (
    <button
      className="button-3d"
      style={{ ...defaultStyle, ...(isActive ? activeStyle : {}), ...style }}
      onClick={onClick}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
      onKeyDown={(event) => {
        if (event.key === " ") event.preventDefault();
      }}
    >
      {children}
    </button>
  );
};

export default ControlButton;