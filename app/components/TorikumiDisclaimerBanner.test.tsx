import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TorikumiDisclaimerBanner from './TorikumiDisclaimerBanner';

describe('TorikumiDisclaimerBanner', () => {
  it('renders the shared disclaimer inside an aside with the top variant by default', () => {
    render(<TorikumiDisclaimerBanner mode="result" />);
    const banner = screen.getByRole('note');
    expect(banner).toBeInTheDocument();
    expect(banner.tagName).toBe('ASIDE');
    expect(banner).toHaveAttribute('data-mode', 'result');
    expect(banner.className).toContain('torikumi-disclaimer-banner');
    expect(banner.className).toContain('torikumi-disclaimer-banner--top');
    expect(banner.textContent).not.toBe('');
  });

  it('applies the below-table variant class when variant="below-table"', () => {
    render(<TorikumiDisclaimerBanner mode="schedule" variant="below-table" />);
    const banner = screen.getByRole('note');
    expect(banner.className).toContain('torikumi-disclaimer-banner--below-table');
    expect(banner.className).not.toContain('torikumi-disclaimer-banner--top');
    expect(banner).toHaveAttribute('data-mode', 'schedule');
  });

  it('mirrors the visible disclaimer text into aria-label for assistive tech', () => {
    render(<TorikumiDisclaimerBanner mode="result" />);
    const banner = screen.getByRole('note');
    const ariaLabel = banner.getAttribute('aria-label') ?? '';
    expect(ariaLabel.length).toBeGreaterThan(0);
    expect(ariaLabel).toBe(banner.textContent);
  });
});
