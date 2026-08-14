import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HashPreservingRedirect from './HashPreservingRedirect';

function LocationProbe() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.hash}`}</output>;
}

describe('HashPreservingRedirect', () => {
  it('preserves the hash while redirecting to the canonical path', () => {
    render(
      <MemoryRouter initialEntries={['/202607-banzuke#makunouchi']}>
        <HashPreservingRedirect to="/202607-banzuke/" />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('/202607-banzuke/#makunouchi');
  });
});
