import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfficialListPage, OfficialProfilePage } from './page';

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
describe('official directories', () => {
  it('renders a gyoji directory from its JSON API', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ updatedAt: '2026-08-11', source: 'https://www.sumo.or.jp/', officials: [{ id: 'kimura-shonosuke', name: '木村庄之助', yomi: 'きむらしょうのすけ', rank: '立行司' }] }) } as Response);
    render(<MemoryRouter><OfficialListPage kind="gyoji" /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /木村庄之助/ })).toHaveAttribute('href', '/gyoji/kimura-shonosuke/');
  });
  it('renders a profile without a photograph', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ kind: 'yobidashi', id: 'jiro', name: '次郎', yomi: 'じろう', rank: '立呼出', realName: '', affiliation: '', birthDate: '', birthplace: '東京都', debut: '1978年3月', sourceUrl: 'https://www.sumo.or.jp/', updatedAt: '2026-08-11' }) } as Response);
    render(<MemoryRouter initialEntries={['/yobidashi/jiro/']}><Routes><Route path="/yobidashi/:id/" element={<OfficialProfilePage kind="yobidashi" />} /></Routes></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('heading', { name: '次郎', level: 1 })).toBeInTheDocument());
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
