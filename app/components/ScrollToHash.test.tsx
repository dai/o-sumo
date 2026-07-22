import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScrollToHash from './ScrollToHash';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('ScrollToHash', () => {
  it('scrolls to the element when a hash target exists', async () => {
    const scrollIntoView = vi.fn();
    // JSDOM doesn't implement scrolling; stub to assert intent.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (HTMLElement.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView = scrollIntoView;

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    render(
      <MemoryRouter initialEntries={['/202603-banzuke/#rikishi-1234']}>
        <div id="rikishi-1234">target</div>
        <ScrollToHash />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  it('scrolls to top when there is no hash', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    render(
      <MemoryRouter initialEntries={['/202603-banzuke/']}>
        <div id="rikishi-1234">target</div>
        <ScrollToHash />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});
