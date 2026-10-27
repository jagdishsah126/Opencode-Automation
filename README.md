# Opencode Automation

Simple Collection of Scripts Where You can Paste a Prompt and then Choose
Models — the runner prepares everything for you.

Batch-test models with [opencode](https://opencode.ai): one prompt, many
models, each model builds in its own folder. Prompt in, results out, one
command.

```
prompt.txt ─┐                         ┌─ Projects/<model folder>/   ← built page
models.txt ─┼─ run-test.sh ── runs each model → report + summary + popup
```

## Quickstart

```bash
# 1. Write your instructions in prompt.txt (sent verbatim to every model).
#    Name the files you want (e.g. index.html, style.css, script.js).
# 2. Fill models.txt, one model per line — both forms work:
#
#    opencode/glm-5.3-flash-free            # folder: glm-5.3-flash-free
#    Tihar GLM 5.3|opencode/glm-5.3-flash-free   # folder: Tihar GLM 5.3
#
# 3. Preview everything at zero cost:
./run-test.sh --dry

# 4. Run the batch (sequential, one session per model):
./run-test.sh
```

Then open `Projects/<model folder>/index.html` in a browser — every build is
self-contained and works offline. Failed runs never stop the batch; when it
finishes you get a terminal summary, `Projects/last-batch-report.txt`, and a
desktop notification where `notify-send` exists.

## Example — what a run produces

The `Projects/` folder in this repo holds real outputs built from the Tihar
prompt (`prompt.txt`):

| Model | Output | Page |
|---|---|---|
| `opencode/glm-5.3-flash-free` | [`Projects/glm-5.3-flash-free/`](./Projects/glm-5.3-flash-free/index.html) | "Happy Tihar 🪔 — The Festival of Lights" |
| `opencode/deepseek-v4.1-flash-free` | [`Projects/deepseek-v4.1-flash-free/`](./Projects/deepseek-v4.1-flash-free/index.html) | "Happy Tihar 🪔 — A Story of Light" |

Same prompt, two models — open each `index.html` and compare.

## Notes

- Requires the `opencode` CLI (`opencode models` lists ids as `provider/model`),
  bash (Linux/macOS/WSL), and nothing else — stdlib only.
- For other test themes keep a prompt/model pair: `prompt-<theme>.txt` +
  `models-<theme>.txt`, then
  `./run-test.sh --prompt prompt-<theme>.txt --models models-<theme>.txt`.
- The runner never commits or pushes model output itself — you review the
  folders first, then commit.
