import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FooterLink, FooterLinks } from './FooterFrame';
import { HeaderSelect } from './HeaderSelect';

describe('HeaderSelect', () => {
  it('shows the current value and reports the chosen one', () => {
    const onChange = vi.fn();
    render(<HeaderSelect label="Theme" value="light" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'Theme' });
    expect((select as HTMLSelectElement).value).toBe('light');
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(onChange).toHaveBeenCalledWith('dark');
  });
});

describe('FooterLinks', () => {
  it("names the list, reads a link's detail after its label and opens external links with noopener only", () => {
    render(
      <FooterLinks label="Source">
        <FooterLink href="https://example.org" detail="the source" external>
          Repo
        </FooterLink>
        <FooterLink href="/docs">Docs</FooterLink>
      </FooterLinks>
    );
    const column = screen.getByRole('navigation', { name: 'Source' });
    expect(column).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Repo\s?: the source$/ }).getAttribute('rel')).toBe('noopener');
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('rel')).toBeNull();
  });
});
