import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { RikishiProfile } from '../../lib/sumo-data';
import { banzukePath } from '../../lib/torikumi-routes';
import './page.css';

// Fallback placeholder SVG for rikishi photos
function profilePlaceholderSvg(name: string): string {
  const label = name.slice(0, 2);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#efe7dc"/><circle cx="100" cy="70" r="38" fill="#c9b49c"/><path d="M40 170c12-35 38-52 60-52s48 17 60 52" fill="#b9956f"/><text x="100" y="185" text-anchor="middle" font-size="20" fill="#6f5338" font-family="sans-serif">${label}</text></svg>`,
  )}`;
}

function ProfileField({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value}</span>
    </div>
  );
}

function CareerStats({ stats }: { stats?: { wins: number; losses: number; draws: number } }) {
  if (!stats) return null;
  return (
    <div className="career-stats">
      <div className="career-stat">
        <span className="career-stat-value win">{stats.wins}</span>
        <span className="career-stat-label">勝</span>
      </div>
      <div className="career-stat">
        <span className="career-stat-value loss">{stats.losses}</span>
        <span className="career-stat-label">敗</span>
      </div>
      {stats.draws > 0 && (
        <div className="career-stat">
          <span className="career-stat-value draw">{stats.draws}</span>
          <span className="career-stat-label">休</span>
        </div>
      )}
    </div>
  );
}

export default function RikishiProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<RikishiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      try {
        // Try to fetch individual profile first
        const response = await fetch(`/api/v1/rikishi/${id}.json`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (id) {
          // Fallback: fetch list and find by id
          const listResponse = await fetch('/api/v1/rikishi.json');
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const rikishiId = parseInt(id);
            const rikishi = listData.rikishi.find((r: { id: number }) => r.id === rikishiId);
            if (rikishi) {
              setProfile({
                ...rikishi,
                // photoUrl and other extended fields may not be available in list
                photoUrl: rikishi.photoUrl,
              });
            } else {
              setError('力士が見つかりません');
            }
          } else {
            setError('データの読み込みに失敗しました');
          }
        }
      } catch (err) {
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">読み込み中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">{error || '力士が見つかりません'}</div>
        <Link to={banzukePath} className="back-link">番付に戻る</Link>
      </div>
    );
  }

  const photoUrl = profile.photoUrl || profilePlaceholderSvg(profile.name);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Link to={banzukePath} className="back-link">← 番付に戻る</Link>

        <div className="profile-header">
          <div className="profile-photo-container">
            <img
              src={photoUrl}
              alt={`${profile.name}のプロフィール写真`}
              className="profile-photo"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = profilePlaceholderSvg(profile.name);
              }}
            />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{profile.name}</h1>
            <div className="profile-yomi">{profile.yomi}</div>
            {profile.currentRank && (
              <span className="profile-rank-badge">{profile.currentRank}</span>
            )}
          </div>
        </div>

        <div className="profile-content">
          <section className="profile-section">
            <h2 className="profile-section-title">基本信息</h2>
            <div className="profile-fields">
              <ProfileField label="生年月日" value={profile.birthDate} />
              <ProfileField label="身長" value={profile.height ? `${profile.height}cm` : undefined} />
              <ProfileField label="体重" value={profile.weight ? `${profile.weight}kg` : undefined} />
              <ProfileField label="出身地" value={profile.shusshin} />
              <ProfileField label="初土俵" value={profile.debut} />
            </div>
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">通算成績</h2>
            <CareerStats stats={profile.careerStats} />
          </section>

          <section className="profile-section">
            <h2 className="profile-section-title">リンク</h2>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="external-profile-link"
            >
              日本相撲協会公式サイトのプロフィール →
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}