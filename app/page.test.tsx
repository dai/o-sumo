import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './page';

describe('Home page', () => {
  it('shows the main navigation links and footer-only contact links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202603-banduke');
    expect(screen.getByRole('link', { name: '取組予定' })).toHaveAttribute('href', '/202603-yotei');
    expect(screen.getByRole('link', { name: '結果' })).toHaveAttribute('href', '/202603-torikumi');
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });
});
