import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TorikumiHubPage from './page';

describe('TorikumiHubPage', () => {
  it('renders all 15 days and allows descending sort', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TorikumiHubPage mode="result" />
      </MemoryRouter>,
    );

    const dayLinks = screen.getAllByRole('link').filter((link) => /^\/202603\d{2}-torikumi$/.test(link.getAttribute('href') ?? ''));
    expect(dayLinks).toHaveLength(15);
    expect(screen.getByText('初日')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '降順' }));

    const firstCardHeading = screen.getAllByRole('heading', { level: 3 })[0];
    expect(firstCardHeading).toHaveTextContent('千秋楽');
  });
});
