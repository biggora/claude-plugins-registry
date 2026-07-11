# Security policy

## Reporting a vulnerability

Report security issues privately through [GitHub Security Advisories](https://github.com/biggora/claude-plugins-registry/security/advisories/new). Do not open a public issue for an unpatched vulnerability. Include the affected version, reproduction steps, impact, and any suggested mitigation.

## Plugin trust

Agent plugins and skills can contain instructions and scripts that influence local tools. Review a plugin's source, manifest, scripts, requested tools, and repository history before installation. Prefer tagged releases or pinned commits for controlled environments. Recheck changes before updating.

The custom catalog at `registry/registry.json` and the native marketplace files list third-party-capable content; listing does not make that content trusted.

## Secrets and logs

Never place tokens, passwords, private keys, cookies, or customer data in manifests, skills, examples, test fixtures, hook output, or logs. Read credentials from environment variables or the agent platform's credential store. Redact sensitive values from bug reports and command output.
