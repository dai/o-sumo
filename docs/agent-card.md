# A2A Agent Card (o-sumo)

This site publishes an **A2A Agent Card** at
[`/.well-known/agent-card.json`](https://osada.us/.well-known/agent-card.json)
so that agent-to-agent discovery clients can identify o-sumo as a static
public archive of 大相撲 (Grand Sumo) data.

## Discovery posture

o-sumo is a static Cloudflare Pages site. It does **not** operate:

- a JSON-RPC A2A server
- a gRPC A2A endpoint
- an HTTP+JSON task handler

The card therefore advertises an empty `supportedInterfaces` array and
declares every optional capability (`streaming`, `pushNotifications`,
`extendedAgentCard`) as `false`. This is an honest signal to other agents
that the card is published for **discovery only**, not as an invitation to
issue task requests.

## What agents should do instead

1. Fetch the public JSON API at <https://osada.us/api/v1/*.json>.
2. Use the skills listed in the card:
   - `osumo-content` — fetch banzuke, torikumi, rikishi JSON
   - `osumo-discovery` — resolve URLs for basho / day / rikishi pages
   - `osumo-kimarite` — aggregate kimarite statistics
3. Read the matching `SKILL.md` files under
   `/.well-known/agent-skills/<skill-name>/SKILL.md` for usage rules.
4. Follow the metadata links in the API catalog at
   `/.well-known/api-catalog`.

## Schema

The card conforms to the [A2A Protocol Specification v1.0.0 §4.4.1
AgentCard](https://a2a-protocol.org/latest/specification/#441-agentcard).
The repository keeps a hand-maintained template at
`public/.well-known/agent-card.json`; `vite.config.ts`
(`a2aAgentCardPlugin`) rewrites it on every build so that `version` is
always synchronized with `package.json`.

## Maintenance

- Static fields (name, description, skills, provider) live in
  `public/.well-known/agent-card.json`. Edit the template, then run
  `npm run build`.
- `version` is sourced from `package.json` — bump the package version when
  shipping new skills or metadata.
- Keep `supportedInterfaces` empty unless a real A2A transport is added.
