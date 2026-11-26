import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/common/Feedback';
import { Header } from '@/components/layout/Header';
import { LanguageMenu } from '@/components/common/LanguageSelector';
import { renderWithProviders } from '@/test/testUtils';

function DialogDemo({ kind }: { kind: 'drawer' | 'modal' }) {
  const [open, setOpen] = useState(false);
  const Panel = kind === 'drawer' ? Drawer : Modal;
  return <><button onClick={() => setOpen(true)}>Open panel</button>
    <Panel open={open} onClose={() => setOpen(false)} title="Help panel" description="Help information">
      <button>Last action</button>
    </Panel>
  </>;
}

describe('Keyboard accessibility', () => {
  for (const kind of ['drawer', 'modal'] as const) {
    it(`${kind} traps Tab and restores focus after Escape`, async () => {
      const user = userEvent.setup();
      renderWithProviders(<DialogDemo kind={kind} />);
      const opener = screen.getByRole('button', { name: 'Open panel' });
      await user.click(opener);
      const dialog = screen.getByRole('dialog', { name: 'Help panel' });
      expect(dialog).toHaveAccessibleDescription('Help information');
      const close = within(dialog).getByRole('button', { name: 'Close' });
      const last = within(dialog).getByRole('button', { name: 'Last action' });
      expect(close).toHaveFocus();
      await user.tab({ shift: true });
      expect(last).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    });
  }

  it('keeps focus inside mobile navigation and returns it to its trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const opener = screen.getByRole('button', { name: 'Menu' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Site navigation' });
    const close = within(dialog).getByRole('button', { name: 'Close' });
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes the language menu before closing its parent navigation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Site navigation' });
    const trigger = within(dialog).getByRole('button', { name: /Language.*English/i });
    await user.click(trigger);
    expect(within(dialog).getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(within(dialog).queryByRole('menu')).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes mobile navigation after selecting the current route', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Site navigation' });
    await user.click(within(dialog).getByRole('link', { name: /^Home$/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports an upward, start-aligned language menu for constrained spaces', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageMenu placement="top" align="start" />);
    await user.click(screen.getByRole('button', { name: /Language.*English/i }));
    expect(screen.getByRole('menu')).toHaveClass('bottom-full', 'start-0');
  });

  it('supports keyboard language selection without claiming complete translations', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageMenu />);
    const trigger = screen.getByRole('button', { name: /Language.*English/i });
    await user.click(trigger);
    const english = screen.getByRole('menuitemradio', { name: /English/i });
    expect(english).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: /Urdu/i })).toHaveFocus();
    expect(screen.getByText(/Some pages are still being translated/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
