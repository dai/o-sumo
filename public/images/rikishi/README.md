# 力士プロフィール画像 / Rikishi Profile Images

このディレクトリには、幕内・十両全力士の恒久的なプロフィール画像が格納されています。現在は日本相撲協会プロフィール写真をもとに MiniMax I2I Generation で加工した PNG を使用します。

This directory contains permanent profile images for all Makuuchi and Juryo rikishi. The current workflow uses PNG illustrations processed with MiniMax I2I Generation from Japan Sumo Association profile photos.

## 画像形式 / Image Format

- **PNG**: MiniMax I2I Generation で加工したプロフィールイラスト（主に使用）
- **JPG**: 加工前の元写真。必要な場合のみ一時的に保持

- **PNG**: Processed profile illustrations generated with MiniMax I2I Generation (primary use)
- **JPG**: Source photos before processing, kept only when needed

## 生成方法 / Generation Method

画像は以下のスクリプトで更新します：

Images are updated using the following scripts:

```bash
# 元写真を取得
# Download source photos
python3 scripts/download_rikishi_images.py

# MiniMax I2I Generation で加工して PNG を出力
# Process the source photos with MiniMax I2I Generation and write PNGs
python3 scripts/style_transfer_rikishi.py
```

## 画像の特徴 / Image Features

各画像はプロフィール写真をベースに、統一したプロフィールイラストとして加工されています。

Each image is based on a source profile photo and processed into a consistent illustrated portrait style.

## 使用方法 / Usage

原本は `/images/rikishi/{id}.png` です。ページ配信は同じ ID の 96 / 192 / 384px WebP と AVIF（`{id}-{width}.webp` / `{id}-{width}.avif`）を `srcset` で選びます。
力士のJSON データ (`/api/v1/rikishi/{id}.json`) の `photoUrl` フィールドは原本 PNG を指します。
`/rikishi/{id}` と `/{YYYYMM}-banzuke/` はローカル画像を優先表示します。

The original file is `/images/rikishi/{id}.png`. Pages deliver 96 / 192 / 384px WebP and AVIF variants (`{id}-{width}.webp` / `{id}-{width}.avif`) through `srcset`.
The `photoUrl` field in each rikishi's JSON data (`/api/v1/rikishi/{id}.json`) still points at the PNG original.
Both `/rikishi/{id}` and `/{YYYYMM}-banzuke/` prefer this local image.

PNG を追加・差し替えたあとは配信サイズを作り直します。

Regenerate the delivery sizes after adding or replacing a PNG:

```bash
npm run images:rikishi
```

## ライセンス / License

これらの生成イラストは o-sumo プロジェクトの一部として MIT ライセンスの下で提供されています。

These generated illustrations are provided as part of the o-sumo project under the MIT license.

## 更新 / Updates

- 新しい力士が追加された場合、元写真を取得したうえで `style_transfer_rikishi.py` を実行して PNG を生成します。
- `update_sumo_data.py` は自動的にローカル画像を優先して使用します。

- When new rikishi are added, download source photos and run `style_transfer_rikishi.py` to generate PNGs.
- `update_sumo_data.py` automatically prioritizes local images.
