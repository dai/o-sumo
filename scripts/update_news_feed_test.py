import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest import mock


SPEC = importlib.util.spec_from_file_location(
    "update_news_feed",
    pathlib.Path(__file__).with_name("update_news_feed.py"),
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


def make_payload(updated_at: str) -> dict:
    return {
        "updatedAt": updated_at,
        "sources": [
            {"id": "sumo-association", "label": "日本相撲協会", "ok": True, "count": 1},
            {"id": "dmenu-docomo", "label": "dmenuスポーツ", "ok": True, "count": 1},
        ],
        "items": [
            {
                "id": "sumo-association-1",
                "title": "七月場所のお知らせ",
                "url": "https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=1",
                "publishedAt": "2026-07-08",
                "publishedAtRaw": "令和8年7月8日",
                "sourceId": "sumo-association",
                "sourceLabel": "日本相撲協会",
            },
            {
                "id": "dmenu-docomo-1",
                "title": "大相撲ニュース",
                "url": "https://sumo.sports.smt.docomo.ne.jp/article/sports/1",
                "publishedAt": "2026-07-08",
                "publishedAtRaw": "スポーツ紙 7月8日 9時0分",
                "sourceId": "dmenu-docomo",
                "sourceLabel": "dmenuスポーツ",
            },
        ],
    }


class WritePayloadTest(unittest.TestCase):
    def test_skips_write_when_items_and_sources_are_unchanged(self) -> None:
        existing = make_payload("2026-07-08T00:00:00+00:00")
        candidate = make_payload("2026-07-08T02:00:00+00:00")

        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "news.json"
            original_text = json.dumps(existing, ensure_ascii=False, indent=2) + "\n"
            output.write_text(original_text, encoding="utf-8")

            changed = MODULE.write_payload(candidate, output)

            self.assertFalse(changed)
            self.assertEqual(output.read_text(encoding="utf-8"), original_text)

    def test_force_write_updates_even_when_only_timestamp_changed(self) -> None:
        existing = make_payload("2026-07-08T00:00:00+00:00")
        candidate = make_payload("2026-07-08T02:00:00+00:00")

        with tempfile.TemporaryDirectory() as temp_dir:
            output = pathlib.Path(temp_dir) / "news.json"
            output.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

            changed = MODULE.write_payload(candidate, output, force_write=True)

            self.assertTrue(changed)
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), candidate)


class BuildPayloadTest(unittest.TestCase):
    def test_source_failure_keeps_surviving_source_items(self) -> None:
        def failing_scraper(limit: int) -> list[dict]:
            raise RuntimeError("source unavailable")

        def working_scraper(limit: int) -> list[dict]:
            return [
                {
                    "id": "working-1",
                    "title": "生存ソースの記事",
                    "url": "https://example.com/news/1",
                    "publishedAt": "2026-07-08",
                    "publishedAtRaw": "2026-07-08",
                    "sourceId": "working",
                }
            ]

        sources = [
            {"id": "failing", "label": "失敗ソース", "limit": 1, "scraper": failing_scraper},
            {"id": "working", "label": "生存ソース", "limit": 1, "scraper": working_scraper},
        ]

        with mock.patch.object(MODULE, "SOURCE_DEFINITIONS", sources):
            payload = MODULE.build_payload(limit=8)

        self.assertEqual([source["ok"] for source in payload["sources"]], [False, True])
        self.assertEqual(payload["items"][0]["id"], "working-1")
        self.assertEqual(payload["items"][0]["sourceLabel"], "生存ソース")


class DocomoScraperTest(unittest.TestCase):
    def test_scrapes_current_topic_link_markup_when_legacy_items_are_absent(self) -> None:
        html = """
        <h2>ニュース</h2>
        <ul>
          <li><a href="https://topics.smt.docomo.ne.jp/article/nikkansports/sports/f-sp-tp3-260711-202607110000001">
            名古屋場所の懸賞申し込み3504本、地方場所最多を大幅更新 地元企業や中日ドラゴンズも提供 日刊スポーツ 7月11日 13時08分
          </a></li>
          <li><a href="https://topics.smt.docomo.ne.jp/article/hochi/sports/hochi-20260711-OHT1T51111?fm=sports">
            大相撲名古屋場所の懸賞申し込み、地方場所最多の３５０４本 スポーツ報知 7月11日 13時07分
          </a></li>
        </ul>
        """

        with mock.patch.object(MODULE, "fetch_text", return_value=html):
            items = MODULE.scrape_docomo_news(limit=2)

        self.assertEqual(len(items), 2)
        self.assertEqual(
            items[0]["id"],
            "dmenu-docomo-f-sp-tp3-260711-202607110000001",
        )
        self.assertEqual(
            items[0]["title"],
            "名古屋場所の懸賞申し込み3504本、地方場所最多を大幅更新 地元企業や中日ドラゴンズも提供",
        )
        self.assertEqual(items[0]["publishedAt"], "2026-07-11")
        self.assertEqual(items[0]["publishedAtRaw"], "日刊スポーツ　7月11日 13時08分")
        self.assertEqual(
            items[1]["url"],
            "https://topics.smt.docomo.ne.jp/article/hochi/sports/hochi-20260711-OHT1T51111",
        )


class SourceFailureGuardTest(unittest.TestCase):
    def test_all_sources_failed_returns_true(self) -> None:
        payload = {
            "sources": [
                {"id": "a", "ok": False},
                {"id": "b", "ok": False},
            ],
            "items": [],
        }
        self.assertTrue(MODULE.all_news_sources_failed(payload))

    def test_partial_source_success_returns_false(self) -> None:
        payload = {
            "sources": [
                {"id": "a", "ok": False},
                {"id": "b", "ok": True},
            ],
            "items": [{"id": "b-1"}],
        }
        self.assertFalse(MODULE.all_news_sources_failed(payload))


if __name__ == "__main__":
    unittest.main()
