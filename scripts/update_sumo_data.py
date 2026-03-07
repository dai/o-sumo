import json
import urllib.request
from pathlib import Path

OUTPUT_PATH = Path('app/lib/sumo-data.ts')
EXPECTED_MAKUUCHI = 42
EXPECTED_JURYO = 28


def fetch_rikishi_data():
    """
    日本相撲協会公式サイトの番付ページから取得するための入口。

    NOTE:
    実装が不完全な状態で書き込みするとデータ欠落が起こるため、
    取得に失敗・不完全な場合は None を返し、既存ファイルを更新しない。
    """
    url = 'https://www.sumo.or.jp/ResultData/banzuke/'
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'ja,en;q=0.8',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            _ = res.read().decode('utf-8', errors='ignore')
    except Exception:
        return None

    # TODO: HTML 解析ロジックをここに追加し、makuuchi/juryo の完全データを返す。
    return None


def validate_dataset(makuuchi, juryo):
    makuuchi_count = sum(1 for group in makuuchi for _ in group.get('east', []) + group.get('west', []))
    juryo_count = sum(1 for group in juryo for _ in group.get('east', []) + group.get('west', []))
    if makuuchi_count != EXPECTED_MAKUUCHI or juryo_count != EXPECTED_JURYO:
        raise ValueError(
            f'不完全データ: 幕内{makuuchi_count}人/期待{EXPECTED_MAKUUCHI}人, '
            f'十両{juryo_count}人/期待{EXPECTED_JURYO}人'
        )


def update_ts_file(makuuchi, juryo):
    content = f"""export interface Rikishi {{
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw')[];
}}

export interface RankGroup {{
  title: string;
  east: Rikishi[];
  west: Rikishi[];
}}

export const makuuchiData: RankGroup[] = {json.dumps(makuuchi, indent=2, ensure_ascii=False)};

export const juryo: RankGroup[] = {json.dumps(juryo, indent=2, ensure_ascii=False)};
"""
    OUTPUT_PATH.write_text(content, encoding='utf-8')


if __name__ == '__main__':
    data = fetch_rikishi_data()
    if not data:
        raise SystemExit('番付データ取得に失敗したため、既存データを保持して終了します。')

    makuuchi = data.get('makuuchi', [])
    juryo = data.get('juryo', [])
    validate_dataset(makuuchi, juryo)
    update_ts_file(makuuchi, juryo)
    print(f'Successfully updated {OUTPUT_PATH}')
