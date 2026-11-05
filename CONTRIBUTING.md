# Contributing to TerraIQ

Thanks for helping improve TerraIQ. This guide covers local setup, conventions, and the checks expected before a pull request.

## Code of Conduct

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Report unacceptable behavior to ishan.vaidya01@gmail.com.

## Local Setup

TerraIQ is a single Node.js application: Express serves the API and the static frontend from `public/`.

```bash
git clone https://github.com/ishanvaidya01/terraiq-backend.git
cd terraiq-backend
npm install

# Optional: enable Gemini-backed analysis
cp .env.example .env          # Windows: Copy-Item .env.example .env
# Set GEMINI_API_KEY in .env

npm run dev
```

Open `http://localhost:5000` and sign in with the demo account (`admin` / `admin123`). Node.js 18 or newer is required. The demo login is client-side only; do not treat it as a security boundary.

Never commit `.env`, API keys, uploaded customer data, or generated models. Models are in memory and have no files to clean up, but test uploads should not be added to the repository.

## Branch Naming

Branch from `main` and use a descriptive prefix:

- `feature/<short-description>` — new behavior or UI
- `fix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation only
- `refactor/<short-description>` — internal restructuring without behavior change

Examples: `feature/quarterly-data`, `fix/empty-trailer-csv`, `docs/api-examples`.

Do not push directly to `main`; open a pull request.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <imperative description>
```

Use `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf`. Examples:

```text
feat(forecast): support quarterly input rows
fix(upload): reject files without a year column
docs(readme): document Gemini fallback behavior
```

Keep commits focused and explain non-obvious tradeoffs in the body.

## Pull Request Checklist

- [ ] The change is based on the latest `main` and addresses one problem.
- [ ] `npm install` succeeds from a clean checkout.
- [ ] `npm start` or `npm run dev` starts the server without errors.
- [ ] The affected flow was verified end to end: train → forecast → compare, or discrepancy analysis.
- [ ] A CSV/JSON failure path was checked when upload or parsing changed.
- [ ] Statistical mode still works without `GEMINI_API_KEY`.
- [ ] No `.env`, API keys, credentials, sample customer data, or `node_modules` are included.
- [ ] `README.md` is updated for API, CSV, environment, or behavior changes.
- [ ] If dependencies or source were not changed, do not stage unrelated local edits.
- [ ] UI changes include a screenshot or a clear before/after description.
- [ ] The PR description explains motivation, approach, and verification steps.

## Testing

There is currently no automated test runner, `npm test` script, or linter. Manual verification is required:

1. Start the server with `npm run dev`.
2. Train a model from `data/sample_tesla.csv` or a built-in sample.
3. Generate a 5-year forecast and confirm a chart and confidence bounds appear.
4. Compare the forecast with actual yearly values and inspect MAE/MAPE results.
5. Test discrepancy analysis with and without a Gemini key if your change touches that path.

If you add a test framework, add a matching npm script and document it here and in the README.

## Coding Guidelines

- Keep the ES module style used by the project (`import`/`export`, `"type": "module"`).
- Use two-space indentation, double quotes where the file already does, and descriptive variable names.
- Validate external input: uploaded files, JSON bodies, years, emissions, and model IDs.
- Keep Gemini calls optional and preserve the statistical fallback. Never make the app depend on an external API to start.
- Do not log API keys, request bodies containing secrets, or full third-party responses.
- Treat uploaded files as untrusted; Multer limits files to 10 MB and memory storage.
- Update the API table and CSV column table in the README when contracts change.
- Do not add company data or emissions figures you cannot license or verify.

## Reporting Issues

Include steps to reproduce, expected versus actual behavior, the Node.js version, whether Gemini is configured, and relevant logs with secrets removed. For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
