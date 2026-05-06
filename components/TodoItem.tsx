"use client";

// TodoItem: en rad i listan. Innehåller checkbox, text och papperskorg.

import { Trash2 } from "lucide-react";

import type { Task } from "@/lib/types";
import styles from "./TodoItem.module.css";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoItem({ task, onToggle, onRemove }: Props) {
  const checkboxId = `todo-${task.id}`;

  // Bekräftelseruta före borttagning – uppfyller spec:s krav på att inget
  // raderas utan att användaren explicit godkänt det.
  function handleRemove() {
    const confirmed = window.confirm(`Vill du ta bort "${task.text}"?`);
    if (confirmed) {
      onRemove(task.id);
    }
  }

  return (
    <li className={styles.row}>
      <input
        id={checkboxId}
        type="checkbox"
        className={styles.checkbox}
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <label
        htmlFor={checkboxId}
        className={`${styles.label} ${task.done ? styles.done : ""}`}
      >
        {task.text}
      </label>
      <button
        type="button"
        className={styles.removeButton}
        onClick={handleRemove}
        aria-label={`Ta bort "${task.text}"`}
      >
        <Trash2 aria-hidden="true" size={20} />
      </button>
    </li>
  );
}
