# A2A Agent Card (o-sumo)

This site publishes an **A2A Agent Card** at
[`/.well-known/agent-card.json`](https://osada.us/.well-known/agent-card.json)
so that agent-to-agent discovery clients can identify o-sumo as a static
public archive of 大相撲 (Grand Sumo) data.

## Discovery posture

o-sumo is a static Cloudflare Pages site with no task state of its own.
It therefore advertises a single `supportedInterfaces` entry pointing at
the Cloudflare Pages Function at <https://osada.us/a2a> that speaks
JSON-RPC 2.0 but does not implement any A2A method:

- `message/send`, `tasks/get`, `tasks/cancel`, etc. all respond with
  `-32601 Method not found`
- malformed JSON bodies return `-32700 Parse error`
- non-`application/json` POSTs return `415 Unsupported Media Type`
- every optional capability (`streaming`, `pushNotifications`,
  `extendedAgentCard`) is `false`

The advertised endpoint exists so that the discovery surface
(`supportedInterfaces`) is well-formed per the A2A Protocol
Specification v1.0.0 §4.4.1 and the `isitagentready.com` validator, while
still being honest about the site's inability to participate in task
exchange.

## What agents should do instead

1. Fetch the public JSON API at <https://osada.us/api/v1/*.json>.
2. Use the skills listed in the card:
   - `osumo-content` — fetch banzuke, torikumi, rikishi, gyoji, and yobidashi JSON
   - `osumo-discovery` — resolve URLs for basho / day / rikishi / gyoji / yobidashi pages and discovery surfaces
3. Read the matching `SKILL.md` files under
   `/.well-known/agent-skills/<skill-name>/SKILL.md` for usage rules.
4. Follow the metadata links in the API catalog at
   `/.well-known/api-catalog`.

## Schema

The card conforms to the [A2A Protocol Specification v1.0.0 §4.4.1
AgentCard](https://a2a-protocol.org/latest/specification/#441-agentcard)
and the JSON-RPC 2.0 transport in
[§6.1](https://a2a-protocol.org/latest/specification/#6-json-rpc-20-transport).
The repository keeps a hand-maintained template at
`public/.well-known/agent-card.json`; `vite.config.ts`
(`a2aAgentCardPlugin`) rewrites it on every build so that `version` is
always synchronized with `package.json`. The Function at
`functions/a2a/[[path]].ts` is detected automatically by Cloudflare Pages
— no `wrangler.toml` is required.

## Maintenance

- Static fields (name, description, skills, provider, supportedInterfaces)
  live in `public/.well-known/agent-card.json`. Edit the template, then
  run `npm run build`.
- `version` is sourced from `package.json` — bump the package version when
  shipping new skills or metadata.
- The `/a2a` JSON-RPC stub lives in `functions/a2a/[[path]].ts`. Keep it
  aligned with A2A v1.0.0 §6.1 (parse error, invalid request, method not
  found). If a real A2A server is added later, route the
  `supportedInterfaces[0].url` at it and replace the stub.
- Cache headers for `/a2a` live in `public/_headers` under the
  `# A2A JSON-RPC endpoint` block.
