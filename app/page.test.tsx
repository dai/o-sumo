import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './page';

describe('Home page', () => {
  it('shows the main dated navigation links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202603-banduke');
    expect(screen.getByRole('link', { name: '初日結果' })).toHaveAttribute('href', '/20260308-torikumi');
    expect(screen.getByRole('link', { name: '初日予定' })).toHaveAttribute('href', '/20260308-yotei');
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });
});
