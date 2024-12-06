import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryBlock from './CategoryBlock';
import DraggableField from './DraggableField';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  
  const handleCreateCategory = () => {
    const newCategory = {
      id: Date.now(),
      title: `新分类 ${categories.length + 1}`,
      fields: []
    };
    setCategories([...categories, newCategory]);
  };

  const handleFieldDrop = (field, targetCategoryId) => {
    setCategories(categories.map(category => {
      // 从源分类中移除字段
      if (category.id === field.sourceCategory) {
        return {
          ...category,
          fields: category.fields.filter(f => f.id !== field.id)
        };
      }
      // 添加字段到目标分类
      if (category.id === targetCategoryId) {
        return {
          ...category,
          fields: [...category.fields, field]
        };
      }
      return category;
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="category-manager">
        <button onClick={handleCreateCategory}>创建新分类</button>
        <div className="categories-container">
          {categories.map(category => (
            <CategoryBlock
              key={category.id}
              id={category.id}
              title={category.title}
              onDrop={handleFieldDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default CategoryManager; 