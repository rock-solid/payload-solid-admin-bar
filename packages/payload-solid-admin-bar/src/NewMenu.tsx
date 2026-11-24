'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

import type { BarLink } from './Bar.js';

/**
 * The "+ New" menu: a disclosure button and its list. It closes on a click outside, on Escape
 * (giving focus back to the button) and when focus leaves it.
 */
export const NewMenu: React.FC<{ items: BarLink[] }> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className="solid-admin-bar__menu"
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      ref={root}
    >
      <button
        aria-controls={listId}
        aria-expanded={open}
        className="solid-admin-bar__item"
        onClick={() => setOpen((value) => !value)}
        ref={button}
        type="button"
      >
        <span aria-hidden="true">+</span> New
      </button>
      <ul className="solid-admin-bar__dropdown" hidden={!open} id={listId}>
        {items.map((item) => (
          <li key={item.href}>
            <a className="solid-admin-bar__item" href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
