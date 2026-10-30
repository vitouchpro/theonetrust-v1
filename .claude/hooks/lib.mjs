/** Pure helpers shared by the Claude Code hooks (unit tested in lib.test.mjs). */

const SECRET_PATTERNS = [
  [/rzp_(live|test)_[A-Za-z0-9]{8,}/, 'Razorpay key'],
  [/postgres(ql)?:\/\/[^\s'"]+:[^\s'"]+@/, 'database URL with password'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b[A-Z]{5}[0-9]{4}[A-Z]\b/, 'possible PAN number'],
];

/** Returns human-readable reasons if the content looks like it contains a secret or PAN. */
export function findSecrets(content) {
  return SECRET_PATTERNS.filter(([re]) => re.test(content)).map(([, label]) => label);
}

/** Paths a hook should treat as production source that needs tests. */
export function isProductionSource(path) {
  return (
    /(^|\/)(apps|packages)\/[^/]+\/src\/.+\.(ts|tsx|css)$/.test(path) &&
    !/\.(test|spec)\.(ts|tsx)$/.test(path) &&
    !/\/src\/test\//.test(path) &&
    !/\.d\.ts$/.test(path)
  );
}

/** Files where secrets/PAN detection must not run (fixtures that intentionally contain samples). */
export function isSecretScanExempt(path) {
  return /(\.test\.(m?js|ts|tsx)$|\.env\.example$|(^|\/)docs\/)/.test(path);
}

/** Stop gate: skip when Claude is already continuing because of this hook (prevents loops). */
export function shouldRunStopGate(hookInput, hasChanges) {
  if (hookInput?.stop_hook_active) return false;
  return hasChanges;
}

/** Keeps the end of long command output, which is where test failures are reported. */
export function tail(text, lines = 80) {
  const all = text.split('\n');
  return all.length <= lines ? text : ['…(truncated)…', ...all.slice(-lines)].join('\n');
}
