// Zakat calculator - placeholder for future feature
export function calculateZakat(assets: number, liabilities: number, goldPrice: number): number {
  const nisab = goldPrice * 85; // 85g of gold
  const netAssets = assets - liabilities;
  if (netAssets < nisab) return 0;
  return netAssets * 0.025; // 2.5%
}
