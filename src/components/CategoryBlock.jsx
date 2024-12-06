import React, { useState } from 'react';
import { useDrop } from 'react-dnd';

const CategoryBlock = ({ id, title, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'FIELD',
    drop: (item) => onDrop(item, id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`category-block ${isOver ? 'drag-over' : ''}`}
    >
      <h3>{title}</h3>
      {/* 字段列表将在这里渲染 */}
    </div>
  );
};

export default CategoryBlock; 