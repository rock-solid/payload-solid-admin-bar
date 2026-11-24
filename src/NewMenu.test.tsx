import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { NewMenu } from './NewMenu.js';

const items = [
  { label: 'Page', href: '/admin/collections/pages/create' },
  { label: 'Article', href: '/admin/collections/articles/create' },
];

const setup = () => {
  render(
    <>
      <NewMenu items={items} />
      <button type="button">Elsewhere</button>
    </>,
  );
  return screen.getByRole('button', { name: 'New' });
};

describe('NewMenu', () => {
  it('opens and closes from its button', async () => {
    const button = setup();
    expect(screen.queryByRole('link', { name: 'Page' })).toBeNull();

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Page' })).toHaveAttribute(
      'href',
      '/admin/collections/pages/create',
    );

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a click outside', async () => {
    const button = setup();
    await userEvent.click(button);

    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and gives focus back to the button', async () => {
    const button = setup();
    await userEvent.click(button);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Page' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('closes when focus leaves it', async () => {
    const button = setup();
    await userEvent.click(button);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
