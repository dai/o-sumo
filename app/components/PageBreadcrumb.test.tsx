import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageBreadcrumb from './PageBreadcrumb';

describe('PageBreadcrumb', () => {
  it('renders a navigation landmark with the supplied aria label', () => {
    render(
      <MemoryRouter>
        <PageBreadcrumb ariaLabel="パンくず" items={[{ label: 'ホーム', href: '/' }, { label: '力士' }]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'パンくず' })).toBeInTheDocument();
  });

  it('marks only the trailing item as current and omits its href link', () => {
    render(
      <MemoryRouter>
        <PageBreadcrumb
          ariaLabel="Breadcrumb"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Rikishi', href: '/rikishi/' },
            { label: 'Houshouryuu' },
          ]}
        />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.querySelector('[aria-current="page"]')!.textContent).toBe('Houshouryuu');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Rikishi' })).toHaveAttribute('href', '/rikishi/');
    expect(screen.queryByRole('link', { name: 'Houshouryuu' })).not.toBeInTheDocument();
  });

  it('renders nothing for an empty item list', () => {
    const { container } = render(
      <MemoryRouter>
        <PageBreadcrumb ariaLabel="Empty" items={[]} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('uses a custom current marker when supplied', () => {
    render(
      <MemoryRouter>
        <PageBreadcrumb
          ariaLabel="Trail"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compare', href: '/compare/', current: true },
            { label: 'Tertiary', href: '/compare/?ids=1' },
          ]}
        />
      </MemoryRouter>,
    );

    const current = screen.getByRole('navigation', { name: 'Trail' }).querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Compare');
  });
});