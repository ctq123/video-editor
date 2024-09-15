import React, { useState, useRef, useEffect } from 'react';
import './Draggable.css';

interface DraggableProps {
  width?: number;
  height?: number;
  /** 初始位置x */
  initialX?: number;
  /** 初始位置y */
  initialY?: number;
  /** 距离可视化窗口的外边距 */
  margin?: number;
  children: React.ReactNode;
}

const Draggable: React.FC<DraggableProps> = ({
  width = 200,
  height = 200,
  initialX = 0,
  initialY = 0,
  margin = 10,
  children
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止默认行为，如文本选择
    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // 拖拽中
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      const maxX = window.innerWidth - width - margin;
      const maxY = window.innerHeight - height - margin;

      // 限制拖拽范围
      setPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(10, Math.min(newY, maxY)),
      });
    }
  };

  // 停止拖拽
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // 监听整个文档的 mousemove 和 mouseup 事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 清除事件监听器
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      className="draggable"
      onMouseDown={handleMouseDown}
      style={{
        top: position.y,
        left: position.x,
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      {children}
    </div>
  );
};

export default Draggable;
