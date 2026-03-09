import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TorikumiDayPage from './TorikumiDayPage';
import { torikumiArchive } from '../lib/torikumi-data';

describe('TorikumiDayPage', () => {
  it('renders archive navigation and contact links for result pages', () => {
    render(
      <MemoryRouter>
        <TorikumiDayPage day={torikumiArchive.resultDays[0]} mode="result" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '令和八年三月場所 取組結果' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '一覧' })).toHaveAttribute('href', '/202603-torikumi');
    expect(screen.getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202603-banduke');
    expect(screen.getByText('← 前日なし')).toBeInTheDocument();
    expect(screen.getByText('翌日なし →')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'x.com/daisuke' })[0]).toHaveAttribute('href', 'https://x.com/daisuke');
    expect(screen.getByText('豊昇龍（ほうしょうりゅう）')).toBeInTheDocument();
  });
});
