'use client';

import Column from './Column';
import { DragDropContext } from 'react-beautiful-dnd';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Board({ board, setBoard }) {
  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;
    if (!destination) return;
    const newBoard = JSON.parse(JSON.stringify(board));

    const sourceCol = newBoard.columns.find(c => c.id === source.droppableId);
    const destCol = newBoard.columns.find(c => c.id === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const [moved] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, moved);

    setBoard(newBoard);
  }, [board, setBoard]);

  const addColumn = async () => {
    const title = prompt('Column title');
    if (!title) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard.columns.push({ id: uuidv4(), title, tasks: [] });
    setBoard(newBoard);
  };

  return (
    <div>
      <button onClick={addColumn} style={{ marginBottom: 8 }}>+ Add column</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', overflowX: 'auto' }}>
          {board.columns.map(col => (
            <Column key={col.id} column={col} board={board} setBoard={setBoard} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
