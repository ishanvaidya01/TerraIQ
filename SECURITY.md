# Security Policy

## Supported Versions

TerraIQ is maintained on the latest `main` branch. Security fixes are not backported to older commits or forks.

| Version | Supported |
| :--- | :---: |
| Latest `main` | Yes |
| Older commits / forks | No |

## Reporting a Vulnerability

Please do **not** report security issues in a public issue.

Use one of these private channels:

- **Email:** [ishan.vaidya01@gmail.com](mailto:ishan.vaidya01@gmail.com)
- **GitHub Security Advisories:** use **Security → Report a vulnerability** on the repository, if enabled.

Include the affected endpoint or file, impact, reproduction steps or a minimal proof of concept, the commit tested, and any suggested fix. Remove API keys, uploaded data, and personal information from reports.

## Response Expectations

This is a best-effort project maintained by one person. Expect an acknowledgement within about 3 business days and a status update within 7 business days. Remediation time depends on severity and availability. Please allow reasonable time before public disclosure.

## Scope

In scope:

- the Express server, `/api/predict` routes, and static file serving;
- file-upload handling and CSV/JSON parsing;
- the forecasting and comparison logic;
- protection of `GEMINI_API_KEY` and other environment variables;
- the browser client's handling of model output and user input;
- dependency vulnerabilities that affect the application.

Out of scope:

- Google Gemini, Google Fonts, jsDelivr, and other third-party services;
- inaccurate forecasts or business decisions based on them;
- issues requiring a compromised host, browser extension, or Google account;
- the intentionally public demo login (`admin` / `admin123`), which is documented as a demo gate rather than authentication;
- missing rate limiting or permissive CORS in a local-only demo, unless you can demonstrate concrete production impact.

## Known Security Considerations

- **No API authentication or authorization.** All prediction endpoints are public; the login page is client-side only.
- **Models are in memory.** There is no tenant isolation because there is no account model or persistence.
- **Uploads are parsed in memory.** Multer limits files to 10 MB, but malformed or hostile CSV/JSON remains untrusted input.
- **Gemini is optional but receives prompts.** If enabled, dataset content and derived statistics are sent to Google's API. Do not submit confidential data without reviewing the applicable terms.
- **CORS is open.** `cors()` allows every origin.
- **Secrets must never be committed.** If a Gemini key has ever been exposed in a commit, log, screenshot, or `.env.example`, revoke it in Google AI Studio and create a new key. Removing the line in a later commit does not remove it from Git history.
- **Third-party CDN assets.** Chart.js and fonts load from external origins without Subresource Integrity attributes.

## Safe Harbor

Good-faith research that respects privacy, avoids destructive or high-volume testing, and follows this policy will not be pursued or reported. Do not access, alter, or exfiltrate data that does not belong to you.
