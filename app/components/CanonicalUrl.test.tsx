import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { StrictMode } from 'react';
import { Link, MemoryRouter } from 'react-router-dom';
import CanonicalUrl from './CanonicalUrl';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
});

describe('CanonicalUrl', () => {
  it('publishes one absolute canonical URL without query or hash', async () => {
    render(
      <MemoryRouter initialEntries={['/20260310-yotei/?view=compact#juryo']}>
        <CanonicalUrl />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const canonicalLinks = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLinks).toHaveLength(1);
      expect(canonicalLinks[0].href).toBe('https://osada.us/20260310-yotei/');
    });
  });

  it('updates the existing canonical link after client-side navigation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <CanonicalUrl />
        <Link to="/archives/">Archives</Link>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Archives' }));

    await waitFor(() => {
      const canonicalLinks = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLinks).toHaveLength(1);
      expect(canonicalLinks[0].href).toBe('https://osada.us/archives/');
    });
  });

  it('reuses one canonical link and removes duplicates under StrictMode', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<link rel="canonical" href="https://osada.us/old/"><link rel="canonical" href="https://osada.us/duplicate/">',
    );

    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/analytics/']}>
          <CanonicalUrl />
        </MemoryRouter>
      </StrictMode>,
    );

    await waitFor(() => {
      const canonicalLinks = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLinks).toHaveLength(1);
      expect(canonicalLinks[0].href).toBe('https://osada.us/analytics/');
    });
  });
});
