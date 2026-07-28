import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TrailingSlashRoute from './TrailingSlashRoute';

function LocationProbe() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.hash}`}</output>;
}

describe('TrailingSlashRoute', () => {
  it('adds a trailing slash without dropping the hash', () => {
    render(
      <MemoryRouter initialEntries={['/rikishi/1#career']}>
        <Routes>
          <Route
            path="/rikishi/:id"
            element={(
              <TrailingSlashRoute>
                <LocationProbe />
              </TrailingSlashRoute>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('/rikishi/1/#career');
  });

  it('renders its page without redirecting an already canonical URL', () => {
    render(
      <MemoryRouter initialEntries={['/rikishi/1/']}>
        <Routes>
          <Route
            path="/rikishi/:id"
            element={(
              <TrailingSlashRoute>
                <p>Profile page</p>
              </TrailingSlashRoute>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Profile page')).toBeInTheDocument();
  });
});
