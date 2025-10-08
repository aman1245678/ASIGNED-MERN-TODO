'use client';

import { Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';

export default function Task({ task, index, board, setBoard, columnId }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title || '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const save = () => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const col = newBoard.columns.find(c => c.id === columnId);
    if (!col) return;
    const t = col.tasks.find(tt => tt.id === task.id);
    if (!t) return;
    t.title = title;
    t.assignedTo = assignedTo || null;
    setBoard(newBoard);
    setEditing(false);
  };

  const del = () => {
    if (!confirm('Delete this task?')) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    const col = newBoard.columns.find(c => c.id === columnId);
    col.tasks = col.tasks.filter(tt => tt.id !== task.id);
    setBoard(newBoard);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: 12,
            margin: '0 0 8px 0',
            minHeight: '48px',
            backgroundColor: snapshot.isDragging ? '#fef3c7' : '#ffffff',
            color: 'black',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            ...provided.draggableProps.style
          }}
        >
          {!editing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{task.title}</strong>
                  {task.assignedTo && <span style={{ marginLeft: 8, color: '#6b7280' }}>({task.assignedTo})</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(true)} style={{ fontSize: 12 }}>Edit</button>
                  <button onClick={del} style={{ fontSize: 12 }}>Delete</button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 6, marginBottom: 6 }} />
              <input value={assignedTo || ''} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Assign to" style={{ width: '100%', padding: 6, marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={save}>Save</button>
                <button onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
