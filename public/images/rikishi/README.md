# 力士プロフィール画像 / Rikishi Profile Images

このディレクトリには、幕内・十両全力士の恒久的なプロフィール画像が格納されています。

This directory contains permanent profile images for all Makuuchi and Juryo rikishi.

## 画像形式 / Image Format

- **SVG**: ベクター形式の生成イラスト（主に使用）
- **JPG/PNG**: 実写真をダウンロードした場合（将来的な拡張用）

- **SVG**: Generated vector illustrations (primary use)
- **JPG/PNG**: Downloaded photographs (for future expansion)

## 生成方法 / Generation Method

画像は以下のスクリプトで生成されます：

Images are generated using the following scripts:

```bash
# すべての欠落している力士画像を生成
# Generate all missing rikishi images
python3 scripts/generate_all_svgs.py

# ダウンロードスクリプト（実写真取得用、将来的な使用）
# Download script (for photographs, future use)
python3 scripts/download_rikishi_images.py
```

## 画像の特徴 / Image Features

各SVGイラストは力士の特性に基づいてカスタマイズされています：

Each SVG illustration is customized based on the rikishi's characteristics:

- **横綱**: 金色のリング、赤い廻し
- **大関**: 銀色のリング、紺色の廻し
- **関脇・小結**: 銅色のリング、青い廻し
- **十両**: 青いリング、茶色の廻し
- **前頭**: 茶色のリング、紺色の廻し

- **Yokozuna**: Gold ring, red mawashi
- **Ozeki**: Silver ring, navy mawashi
- **Sekiwake/Komusubi**: Bronze ring, blue mawashi
- **Juryo**: Blue ring, brown mawashi
- **Maegashira**: Brown ring, navy mawashi

## 使用方法 / Usage

画像は `/images/rikishi/{id}.svg` の形式で参照されます。
力士のJSON データ (`/api/v1/rikishi/{id}.json`) の `photoUrl` フィールドがこのパスを指します。

Images are referenced as `/images/rikishi/{id}.svg`.
The `photoUrl` field in each rikishi's JSON data (`/api/v1/rikishi/{id}.json`) points to this path.

## ライセンス / License

これらの生成イラストは o-sumo プロジェクトの一部として ISC ライセンスの下で提供されています。

These generated illustrations are provided as part of the o-sumo project under the ISC license.

## 更新 / Updates

- 新しい力士が追加された場合、`generate_all_svgs.py` を実行して画像を生成します。
- `update_sumo_data.py` は自動的にローカル画像を優先して使用します。

- When new rikishi are added, run `generate_all_svgs.py` to generate images.
- `update_sumo_data.py` automatically prioritizes local images.
