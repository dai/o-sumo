import importlib.util
import pathlib
import unittest


SPEC = importlib.util.spec_from_file_location(
    "update_sumo_data",
    pathlib.Path(__file__).with_name("update_sumo_data.py"),
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class ParseProfileHtmlTest(unittest.TestCase):
    def test_keeps_shusshin_from_exact_label_without_related_list_override(self) -> None:
        html = """
        <table>
          <tr><th>生年月日</th><td>昭和62年5月11日（38歳）</td></tr>
          <tr><th>出身地</th><td>熊本県熊本市東区</td></tr>
          <tr><th>身長</th><td>183.0cm</td></tr>
          <tr><th>体重</th><td>146.0kg</td></tr>
          <tr><th>初土俵</th><td>平成十五年三月場所</td></tr>
        </table>
        <section>
          <h2>熊本県出身の他の力士</h2>
          <a>東前頭二枚目</a>
        </section>
        """

        profile = MODULE.parse_profile_html(html)

        self.assertIsNotNone(profile)
        assert profile is not None
        self.assertEqual(profile["birthDate"], "昭和62年5月11日（38歳）")
        self.assertEqual(profile["shusshin"], "熊本県熊本市東区")
        self.assertEqual(profile["height"], 183)
        self.assertEqual(profile["weight"], 146)
        self.assertEqual(profile["debut"], "平成十五年三月場所")


if __name__ == "__main__":
    unittest.main()
