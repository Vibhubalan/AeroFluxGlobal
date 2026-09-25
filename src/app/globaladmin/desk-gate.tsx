"use client";

import { useMemo, useState } from "react";
import { categories, products } from "@/lib/content";

const DUMMY_USER = "admin";
const DUMMY_PASSWORD = "aeroflux";

type Item = {
  category: string;
  id: string;
  name: string;
  image: string;
  packs: string[];
  description: string;
  applications: string;
  specifications: string[];
  summary: string;
  featured: boolean;
};

type Catalog = Record<string, Array<Partial<Item> & { id: string; name: string }>>;
type Screen = "home" | "products" | "items" | "edit" | "responses";

function fromCatalog(source: Catalog): Item[] {
  return Object.entries(source).flatMap(([category, rows]) =>
    rows.map((row) => ({
      category,
      id: row.id,
      name: row.name,
      image: row.image ?? "",
      packs: row.packs ?? [],
      description: row.description ?? "",
      applications: row.applications ?? "",
      specifications: row.specifications ?? [],
      summary: row.summary ?? "",
      featured: Boolean(row.featured),
    })),
  );
}

const field = "w-full rounded-lg border border-white/15 bg-[#171c19] px-3 py-2 outline-none";
const label = "mb-1 mt-4 block text-xs uppercase tracking-wide text-[#a39b90]";

export function DeskGate() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [items, setItems] = useState<Item[]>(() => fromCatalog(products as Catalog));
  const [screen, setScreen] = useState<Screen>("home");
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [editing, setEditing] = useState<Item | null>(null);
  const [draftKey, setDraftKey] = useState("");

  const titles = useMemo(
    () => Object.fromEntries(categories.map((entry) => [entry.slug, entry.title])),
    [],
  );
  const visible = items.filter((item) => item.category === category);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (user.trim() === DUMMY_USER && password === DUMMY_PASSWORD) {
      setSignedIn(true);
      setError("");
      return;
    }
    setError("Those details were not accepted.");
  }

  function addItem() {
    setDraftKey("");
    setEditing({
      category,
      id: "",
      name: "",
      image: "",
      packs: [""],
      description: "",
      applications: "",
      specifications: [""],
      summary: "",
      featured: false,
    });
    setScreen("edit");
  }

  function openItem(item: Item) {
    setDraftKey(`${item.category}/${item.id}`);
    setEditing({
      ...item,
      packs: item.packs.length ? item.packs : [""],
      specifications: item.specifications.length ? item.specifications : [""],
    });
    setScreen("edit");
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !editing.name.trim()) return;
    const id = editing.id.trim() || editing.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const next = {
      ...editing,
      id,
      packs: editing.packs.map((pack) => pack.trim()).filter(Boolean),
      specifications: editing.specifications.map((line) => line.trim()).filter(Boolean),
    };
    setItems((current) => {
      const key = `${next.category}/${next.id}`;
      const without = current.filter((item) => `${item.category}/${item.id}` !== draftKey && `${item.category}/${item.id}` !== key);
      return [...without, next];
    });
    setCategory(next.category);
    setScreen("items");
  }

  function setList(key: "packs" | "specifications", index: number, value: string) {
    if (!editing) return;
    const list = [...editing[key]];
    list[index] = value;
    setEditing({ ...editing, [key]: list });
  }

  if (!signedIn) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-[#101412] text-[#f3eee6]">
        <div className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-3xl font-semibold">Desk</h1>
          <p className="mt-3 text-[#a39b90]">Temporary sign-in: {DUMMY_USER} / {DUMMY_PASSWORD}</p>
          <form className="mt-8" onSubmit={submit}>
            {error ? <p className="mb-4 text-[#e07a4a]">{error}</p> : null}
            <label className={label} htmlFor="desk-user">Name</label>
            <input id="desk-user" required value={user} onChange={(event) => setUser(event.target.value)} className={field} />
            <label className={label} htmlFor="desk-password">Password</label>
            <input id="desk-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className={field} />
            <button type="submit" className="mt-6 rounded-lg bg-[#e07a4a] px-4 py-2 font-semibold text-[#1a100c]">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#101412] text-[#f3eee6]">
      <header className="flex items-center gap-6 border-b border-white/10 px-6 py-4">
        <button type="button" onClick={() => setScreen("home")}>Desk</button>
        <button type="button" className="ml-auto text-[#e07a4a]" onClick={() => { setSignedIn(false); setScreen("home"); }}>Sign out</button>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        {screen === "home" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" className="rounded-2xl border border-white/10 px-6 py-10 text-left text-xl" onClick={() => setScreen("products")}>Add products</button>
            <button type="button" className="rounded-2xl border border-white/10 px-6 py-10 text-left text-xl" onClick={() => setScreen("responses")}>Check responses</button>
          </div>
        )}

        {screen === "products" && (
          <>
            <button type="button" className="text-[#e07a4a]" onClick={() => setScreen("home")}>Desk</button>
            <h1 className="mt-3 text-3xl font-semibold">Products</h1>
            <ul className="mt-6 divide-y divide-white/10">
              {categories.map((entry) => (
                <li key={entry.slug}>
                  <button
                    type="button"
                    className="w-full py-4 text-left"
                    onClick={() => { setCategory(entry.slug); setScreen("items"); }}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {screen === "items" && (
          <>
            <button type="button" className="text-[#e07a4a]" onClick={() => setScreen("products")}>Products</button>
            <div className="mt-3 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold">{titles[category]}</h1>
              <button type="button" aria-label="Add item" className="grid h-11 w-11 place-items-center rounded-full bg-[#e07a4a] text-2xl text-[#1a100c]" onClick={addItem}>+</button>
            </div>
            <ul className="mt-6 divide-y divide-white/10">
              {visible.map((item) => (
                <li key={item.id}>
                  <button type="button" className="w-full py-4 text-left" onClick={() => openItem(item)}>{item.name}</button>
                </li>
              ))}
            </ul>
          </>
        )}

        {screen === "edit" && editing && (
          <form onSubmit={save} className="max-w-xl">
            <button type="button" className="text-[#e07a4a]" onClick={() => setScreen("items")}>Items</button>
            <h1 className="mt-3 text-3xl font-semibold">{draftKey ? "Edit item" : "New item"}</h1>
            <label className={label}>Name</label>
            <input required className={field} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
            <label className={label}>Image</label>
            <input className={field} value={editing.image} placeholder="Uploaded to R2" onChange={(event) => setEditing({ ...editing, image: event.target.value })} />
            <label className={label}>Pack sizes</label>
            {editing.packs.map((pack, index) => (
              <input key={`pack-${index}`} className={`${field} mb-2`} placeholder="6x1 USQ" value={pack} onChange={(event) => setList("packs", index, event.target.value)} />
            ))}
            <button type="button" className="text-sm text-[#e07a4a]" onClick={() => setEditing({ ...editing, packs: [...editing.packs, ""] })}>Add pack size</button>
            <label className={label}>Description</label>
            <textarea rows={4} className={field} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} />
            <label className={label}>Applications</label>
            <textarea rows={3} className={field} value={editing.applications} onChange={(event) => setEditing({ ...editing, applications: event.target.value })} />
            <label className={label}>Specifications</label>
            {editing.specifications.map((line, index) => (
              <input key={`spec-${index}`} className={`${field} mb-2`} value={line} onChange={(event) => setList("specifications", index, event.target.value)} />
            ))}
            <button type="button" className="text-sm text-[#e07a4a]" onClick={() => setEditing({ ...editing, specifications: [...editing.specifications, ""] })}>Add bullet</button>
            <button type="submit" className="mt-6 rounded-lg bg-[#e07a4a] px-4 py-2 font-semibold text-[#1a100c]">Save item</button>
          </form>
        )}

        {screen === "responses" && (
          <>
            <button type="button" className="text-[#e07a4a]" onClick={() => setScreen("home")}>Desk</button>
            <h1 className="mt-3 text-3xl font-semibold">Responses</h1>
            <p className="mt-6 text-[#a39b90]">No responses yet. New quotes are mailed to you and saved here.</p>
          </>
        )}
      </div>
    </div>
  );
}
