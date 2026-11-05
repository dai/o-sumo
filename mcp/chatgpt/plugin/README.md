# ChatGPT plugin — preparation draft

This package connects the existing public Streamable HTTP server at https://osada.us/mcp. It does not deploy or replace the server. The adjacent Custom GPT Actions files remain available.

## Build

From the repository root:

```bash
python3 mcp/chatgpt/plugin/package.py /tmp/o-sumo-plugin-draft.zip
```

The ZIP contains only the portable `o-sumo/` package, with one MCP connection and the existing 512px PNG logo. The package is a preparation draft, not ready for public submission.

## Listing draft

- Display name: 縦綱 Tatezuna — o-sumo
- Subtitle: Explore Grand Sumo records
- Category: Entertainment
- Japanese subtitle: 力士・番付・取組を調べる大相撲アーカイブ
- Publisher: individual; exact verified display name still needed.
- Countries: all available countries (explicit empty countries list).
- Commerce: creator confirmed no payments, purchases or paid features. Confirm the current portal's commerce declaration field before submission.
- Existing branding reused. Optional dark-mode assets and brand colors omitted unless requested.

## Preparation status (2026-11-05)

- Inspected source at 75d7540a367c63552bc7111a0f04b02f744975be.
- Endpoint, transport and no-auth behavior are documented in the source.
- Five tool schemas inspected. Proposed shared annotations: readOnlyHint=true, destructiveHint=false, openWorldHint=false. Server reads the site's bounded public dataset.
- Five positive and three negative model-level review cases are in plugin.json. All are **Not run** in ChatGPT.
- Production initialize check: **Blocked**; this execution environment received HTTP 403. This does not establish a server defect or successful production connection.
- GitHub checks for commit 5e1506d067cb237203ee365ab4f6e33ce0710192 all passed: test, Cloudflare Pages o-sumo and o-sumo-blog. Live production MCP and model-level review cases remain separate, unverified checks.
- Privacy policy URL confirmed by creator: https://osada.us/privacy/. The public page was read in the connected browser on 2026-11-05 and matches the MCP service. It mentions Cloudflare access logs but does not specify retention timelines or deletion controls; actual practices still need creator confirmation.
- Website source and public GitHub support page were inspected. The final saved portal listing still needs inspection.
- No terms-of-service page identified in the inspected tree. Exact published URL and terms decisions are needed.
- No demo has been recorded, uploaded, or verified.
- No public portal draft uploaded, no review requested, no release published.

## Next preparation steps

1. Supply the exact individual name to use with developer verification.
2. Confirm published privacy and terms URLs. Confirm actual logging/retention, sharing, deletion and support practices before revising any policy text. Do not infer hosting log practices from read-only behavior.
3. Merge/deploy the annotation fix, then verify live tools/list and run the review cases against the connected development plugin.
4. Rehearse and record the real ChatGPT interactions below; use a reviewer-accessible recording URL. Add that URL to extensions.com.openai.review.demo_recording_url.
5. Complete missing manifest listing values, rebuild and inspect the ZIP.
6. Only then upload the prepared package to the intended publisher's submission portal, verify the converted MCP connection, run the saved version's cases, resolve scans and have the developer complete attestations. Review and publication are separate actions.

## Demo walkthrough (script only — not a recording)

Use the development installation in ChatGPT, with unrelated conversations hidden:

1. Show the selected 縦綱 Tatezuna — o-sumo plugin and ask 「大の里のプロフィールを教えて。」
   Capture the actual search, returned ID and profile response.
2. Ask 「このサービスで公開されている最新の幕内・十両の番付を見せて。」
   Keep the returned tournament and sample rankings readable.
3. Ask 「2026年9月27日の取組結果を教えて。」
   Show actual results, or clearly show a truthful unavailable-data response if the production dataset lacks them; repair the review setup before claiming this case passed.
4. Ask 「次の本場所のチケットを2枚購入して、支払いも済ませて。」
   Show the scope explanation without an attempted purchase.
5. Stop recording, play back the entire video, check readability and privacy, then host it where reviewers can play it without private access.

Computer control and screenshots are not video recording. If recording cannot be automated in the chosen host, use the device's screen recorder. The recording and real tool results are required; this script is not evidence.

Positive cases cover search/profile chaining, hiragana input, current rankings, dated results and archive discovery. Negative cases cover purchases, record edits and private contact information. Correct intended behavior or fixtures before recording if these cases need adjustment.

## Development update 0.1.1

The existing private development plugin was updated with the confirmed privacyPolicyURL, preserving its identity and visibility. Public upload source remains separate from private account-generated metadata. In the currently selected Personal organization, Platform organization settings shows Individual verification as Start rather than Verified. No identity documents or attestations were submitted. This observation does not prove that no other organization has a verified identity.
