'use client';

import Task from './Task';
import { Droppable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Column({ column, board, setBoard }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newTaskTitle.trim()) return;
    setAdding(true);
    const newBoard = JSON.parse(JSON.stringify(board));
    const col = newBoard.columns.find(c => c.id === column.id);
    const newTask = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      assignedTo: null
    };
    col.tasks.unshift(newTask);
    setBoard(newBoard);
    setNewTaskTitle('');
    setAdding(false);
  };
  const handleDeleteColumn = () => {
    if (!confirm(`Delete column "${column.title}"?`)) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard.columns = newBoard.columns.filter(c => c.id !== column.id);
    setBoard(newBoard);
  };
  return (
    <div style={{ minWidth: 280, background: '#f3f4f6', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{column.title}</h3>
        <button onClick={handleDeleteColumn} title="Delete column" style={{ fontSize: 12 }}>✕</button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: 80,
              padding: 4,
              transition: 'background 0.2s',
              background: snapshot.isDraggingOver ? '#e6f0ff' : 'transparent',
              borderRadius: 6
            }}
          >
            {column.tasks.map((task, idx) => (
              <Task key={task.id} task={task} index={idx} board={board} setBoard={setBoard} columnId={column.id} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div style={{ marginTop: 8 }}>
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
        />
        <button onClick={handleAdd} disabled={adding} style={{ marginTop: 6 }}>Add Task</button>
      </div>
    </div>
  );
}
