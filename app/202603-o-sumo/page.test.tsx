import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BanzukePage from './page';

describe('BanzukePage', () => {
  it('keeps contact links in the footer and reverses rank-group sort order', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute('href', 'https://github.com/dai/o-sumo');

    const initialFirstRank = screen.getAllByRole('heading', { level: 3 })[0];
    expect(initialFirstRank).toHaveTextContent('横綱');

    await user.click(screen.getByRole('button', { name: '降順' }));

    const reversedFirstRank = screen.getAllByRole('heading', { level: 3 })[0];
    expect(reversedFirstRank.textContent).not.toBe('横綱');
  });
});
