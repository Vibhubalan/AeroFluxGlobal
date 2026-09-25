"use client";

export function ItemPurchase({ packs }: { packs: string[] }) {
  return (
    <label className="mt-8 block max-w-xs">
      <span className="mb-2 block text-sm text-ink">Pack Size</span>
      <select
        name="pack"
        defaultValue={packs[0]}
        className="h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-ink outline-none focus:border-red"
      >
        {packs.map((pack) => (
          <option key={pack} value={pack} className="bg-[#141414]">
            {pack}
          </option>
        ))}
      </select>
    </label>
  );
}
