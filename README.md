# Opencode Automation

Batch-test models with [opencode](https://opencode.ai): one prompt, many models,
each model builds in its own folder. Prompt in, results out, one command.

## Use it

1. **Fill `prompt.txt`** with any instructions (plain text; replace the example).
2. **Fill `models.txt`**, one model per line — both formats work, `#` comments are skipped:

   ```
# simple: folder name is derived from the model slug
opencode/glm-5.3-flash-free
# custom folder name:
Dashain Deepseek|opencode/deepseek-v4.1-flash-free
   ```

3. **Run:**

   ```bash
   ./run-test.sh                                  # prompt.txt + models.txt
   ./run-test.sh --dry                            # preview everything, zero quota
   ./run-test.sh --prompt prompt-dashain.txt --models models-dashain.txt
   ```

Each model builds inside its own folder under `Projects/<folder name>/`.
Nothing is committed or pushed automatically — you review first.

## Output

- One folder per model in `Projects/` (with whatever files the model created).
- `Projects/last-batch-report.txt` — one status line per model, overwritten per batch.
- A terminal summary and (Linux) a desktop notification when the batch finishes.
- A failed model never stops the batch — every model gets its turn.

## Notes

- Requires `opencode` CLI (`opencode models` lists available ids as `provider/model`).
- Linux/macOS/WSL (bash). `notify-send` optional.
- For other test themes, keep `prompt` and model list pairs side by
  side as plain files: `prompt-<theme>.txt` + `models-<theme>.txt`,
  then run with:
  `./run-test.sh --prompt prompt-<theme>.txt --models models-<theme>.txt`.
