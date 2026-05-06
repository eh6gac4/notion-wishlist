const TRUTHY = new Set(["1", "true"]);
const FALSY = new Set(["0", "false"]);

export function isMockMode(): boolean {
  const flag = process.env.USE_MOCK_DATA;
  if (flag && TRUTHY.has(flag)) return true;
  if (flag && FALSY.has(flag)) return false;
  return !process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID;
}
