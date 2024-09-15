import React, { useState } from 'react';
import './Draggable.css';

interface IProps {
    // Add props here if needed
    children?: React.ReactNode;
}

const Draggable: React.FC<IProps> = ({ children }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragging(true);
        setRel({
            x: e.pageX - position.x,
            y: e.pageY - position.y,
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!dragging) return;
        setPosition({
            x: e.pageX - rel.x,
            y: e.pageY - rel.y,
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    return (
        <div
            className="draggable"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            { children }
        </div>
    );
};

export default Draggable;
