"use client";

// TodoInput: textfält + plus-knapp för att lägga till nya uppgifter.
// Hanterar bara sin egen input-state. Ansvar för att skapa, sortera och
// spara uppgiften ligger i `useTodos`-hooken.

import { Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import styles from "./TodoInput.module.css";

type Props = {
  onAdd: (text: string) => void;
};

const MAX_LENGTH = 200;

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Förhindra dubbla anrop när användaren snabbt klickar/tabbar mellan
  // Enter och plus-knappen – båda triggar samma submit-event.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setText("");
    // Behåll fokus så att användaren snabbt kan lägga till fler uppgifter.
    inputRef.current?.focus();
  }

  const isEmpty = text.trim().length === 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.visuallyHidden} htmlFor="todo-input-text">
        Ny uppgift
      </label>
      <input
        ref={inputRef}
        id="todo-input-text"
        className={styles.input}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv en uppgift…"
        maxLength={MAX_LENGTH}
        autoComplete="off"
      />
      <button
        type="submit"
        className={styles.addButton}
        disabled={isEmpty}
        aria-label="Lägg till"
      >
        <Plus aria-hidden="true" size={20} />
      </button>
    </form>
  );
}
