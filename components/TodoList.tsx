"use client";

// TodoList: tunnt skal som antingen visar listan eller en placeholder
// när den är tom. Får uppgifterna redan filtrerade utifrån (page.tsx
// applicerar filterläget innan listan skickas in).

import type { Task } from "@/lib/types";
import { TodoItem } from "./TodoItem";
import styles from "./TodoList.module.css";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  emptyMessage: string;
};

export function TodoList({ tasks, onToggle, onRemove, emptyMessage }: Props) {
  if (tasks.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
