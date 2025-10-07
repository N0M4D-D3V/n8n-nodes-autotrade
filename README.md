# n8n-nodes-autotrade

Community node for [n8n](https://n8n.io/). Control [AutoTrade Pro](https://autotrade-pro.com) from your n8n workflows: trigger recorded robots and manage the desktop automation runtime.

1. [Installation](#installation)
2. [Operations](#operations)
3. [Credentials](#credentials)
4. [Usage](#usage)
5. [Examples](#examples)
6. [Compatibility](#compatibility)
7. [Support](#support)
8. [Security & Notes](#security--notes)
9. [Resources](#resources)

## Installation

Follow [n8n’s guide](https://docs.n8n.io/integrations/community-nodes/installation/) to install community nodes.

**AutoTrade Pro setup**

1. Windows only (for now). [Download](https://autotrade-pro.com/download) and install.
2. Activate a plan and sign in.
3. Run the `.exe` and stay signed in while using this node.

> Note: macOS/Linux builds are soon.

## Operations

### Run Robot

Runs a recorded automation.

**Parameters**
| Name | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| robot | string | yes | — | Robot name as shown in AutoTrade |

**Output**

```js
{ "status": "ok" }
```

### Kill

Gracefully shuts AutoTrade down.

**Output**

```js
{ "status": "ok" }
```

## Credentials

AutoTrade provides up to 10 tokens for authenticating external APIs. You create them directly in the app UI.

How to create a token:

1. Open AutoTrade → **Settings → HTTP Connections**.
2. Click **+** to generate a token.
3. Copy the token and paste it into the **AutoTrade** credential in n8n.

AutoTrade Pro will generate and activate a token. Copy it and paste it into your n8n credentials.

**Important:** Tokens are only activated after you sign in to AutoTrade Pro. If you’re not logged in, the tokens won’t activate and your HTTP requests will fail (typically `401` or timeouts).

## Usage

1. In n8n, add **Credentials → AutoTrade** and paste your token.
2. Create a workflow:
   - **Trigger** (Webhook, Cron, or TradingView alert via HTTP).
   - **AutoTrade → Run Robot** (select credential, set `robot`).
3. **Execute workflow**. Keep AutoTrade running and signed in.

## Examples

- [examples/run-robot.json](https://github.com/N0M4D-D3V/n8n-nodes-autotrade/examples/run-robot.json) — minimal webhook → run robot
- [examples/kill.json](https://github.com/N0M4D-D3V/n8n-nodes-autotrade/examples/kill.json) — turn autotrade off

> Import in n8n: **Menu → Import from File**.

## Compatibility

- n8n >= **1.97.1**
- AutoTrade Pro: Windows desktop (latest build)

## Support

- Issues & feature requests: **GitHub Issues** (this repo)
- Docs & articles: https://autotrade-pro.com/blog
- Support Team: support@autotrade-pro.com

## Security & Notes

- This node controls local desktop automation. Ensure n8n and AutoTrade run on a trusted machine.
- Trading involves risk. Test in paper/demo environments first.

## Resources

- [MIT License](https://github.com/N0M4D-D3V/n8n-nodes-autotrade/LICENSE)
- [For new n8n users](https://docs.n8n.io/try-it-out/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Autotrade articles and docs](https://autotrade-pro.com/blog)
