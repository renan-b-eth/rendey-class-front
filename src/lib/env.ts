export function mustGetEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

// Optional env helper (returns undefined when missing)
export function getEnv(key: string): string | undefined {
  const v = (process.env[key] || "").trim();
  return v || undefined;
}
