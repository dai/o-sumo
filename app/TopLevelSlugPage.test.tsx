import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TopLevelSlugPage from './TopLevelSlugPage';

function LocationProbe() {
  const location = useLocation();
  return <output>{location.pathname}</output>;
}

describe('TopLevelSlugPage', () => {
  it('falls back to the home page for an unsupported slug', () => {
    render(
      <MemoryRouter initialEntries={['/not-a-supported-slug/']}>
        <Routes>
          <Route path="/:slug/" element={<TopLevelSlugPage />} />
          <Route path="/" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('/');
  });
});
