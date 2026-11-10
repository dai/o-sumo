import { render, screen } from '@testing-library/react';
import LanguageToggle from './LanguageToggle';

describe('LanguageToggle', () => {
  it('starts each accessible name with the visible language code', () => {
    render(<LanguageToggle />);

    expect(screen.getByRole('button', { name: /^JA\b/ })).toHaveTextContent('JA');
    expect(screen.getByRole('button', { name: /^EN\b/ })).toHaveTextContent('EN');
  });
});
