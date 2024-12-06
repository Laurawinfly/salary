import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableField = ({ id, name, sourceCategory }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: { id, name, sourceCategory },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`draggable-field ${isDragging ? 'dragging' : ''}`}
    >
      {name}
    </div>
  );
};

export default DraggableField; 