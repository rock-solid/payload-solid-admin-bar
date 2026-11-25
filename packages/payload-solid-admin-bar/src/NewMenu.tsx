'use client';

import type React from 'react';

import type { BarLink } from './Bar.js';
import { Menu } from './Menu.js';

/** The "+ New" menu: the collections the user may create. */
export const NewMenu: React.FC<{ items: BarLink[]; onSelect?: () => void }> = ({
  items,
  onSelect,
}) => (
  <Menu
    label={
      <>
        <span aria-hidden="true">+</span> New
      </>
    }
  >
    {items.map((item) => (
      <li key={item.href}>
        <a className="solid-admin-bar__item" href={item.href} onClick={onSelect}>
          {item.label}
        </a>
      </li>
    ))}
  </Menu>
);
