"use client";

import { useEffect, useMemo, useState } from "react";
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
type Screen = "home" | "products" | "items" | "edit" | "responses" | "response";
type ResponseRow = { id: number; company: string; name: string; email: string; product: string };
type ResponseDetail = ResponseRow & {
  phone: string;
  quote_items: string | null;
  message: string;
  attachment_path: string | null;
  has_attachment: boolean;
  created_at: string;
};

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
const navBtn = "inline-flex items-center rounded-lg border border-white/20 bg-[#171c19] px-3 py-2 text-sm";
const rowBtn = "flex w-full items-center justify-between gap-4 rounded-lg border border-white/15 bg-[#171c19] px-4 py-3 text-left";

export function DeskGate() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [items, setItems] = useState<Item[]>(() => fromCatalog(products as Catalog));
  const [saveError, setSaveError] = useState("");
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [responseDetail, setResponseDetail] = useState<ResponseDetail | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [editing, setEditing] = useState<Item | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [extraGroups, setExtraGroups] = useState<{ slug: string; title: string }[]>([]);
  const [groupName, setGroupName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ category: string; id?: string; label: string } | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const groups = useMemo(() => {
    const known = new Set(categories.map((entry) => entry.slug));
    return [
      ...categories.map((entry) => ({ slug: entry.slug, title: entry.title })),
      ...extraGroups.filter((entry) => !known.has(entry.slug)),
    ];
  }, [extraGroups]);
  const titles = useMemo(
    () => Object.fromEntries(groups.map((entry) => [entry.slug, entry.title])),
    [groups],
  );
  const visible = items.filter((item) => item.category === category);
  const productQueryText = productQuery.trim().toLowerCase();
  const categoryMatches = visible.filter((item) => item.name.toLowerCase().includes(productQueryText));
  const catalogMatches = items.filter((item) => item.name.toLowerCase().includes(productQueryText));

  async function loadDesk() {
    const response = await fetch("/api/desk/items");
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setSaveError(data?.error || "Could not load products.");
      return;
    }
    if (Array.isArray(data?.items) && data.items.length > 0) {
      setItems(data.items);
    }
    const groupsResponse = await fetch("/api/categories");
    const groupsData = await groupsResponse.json().catch(() => null);
    if (Array.isArray(groupsData?.groups)) setExtraGroups(groupsData.groups);
  }

  async function addGroup() {
    const title = groupName.trim();
    if (!title) return;
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.slug) return;
    setExtraGroups((current) => [...current.filter((entry) => entry.slug !== data.slug), { slug: data.slug, title: data.title }]);
    setGroupName("");
    setCategory(data.slug);
    setScreen("items");
  }

  useEffect(() => {
    fetch("/api/desk/session")
      .then((response) => response.json())
      .then((data) => {
        if (!data?.ok) return;
        setSignedIn(true);
        return loadDesk();
      })
      .catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/desk/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    if (!response.ok) {
      setError("Those details were not accepted.");
      return;
    }
    setSignedIn(true);
    setError("");
    await loadDesk();
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

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !editing.name.trim()) return;
    const form = new FormData(event.currentTarget as HTMLFormElement);
    form.set("category", editing.category);
    form.set("name", editing.name.trim());
    form.set("item_id", editing.id || editing.name.trim());
    form.set("packs", editing.packs.map((pack) => pack.trim()).filter(Boolean).join("\n"));
    form.set("specifications", editing.specifications.map((line) => line.trim()).filter(Boolean).join("\n"));
    form.set("description", editing.description);
    form.set("applications", editing.applications);
    form.set("summary", editing.summary);
    form.set("image", editing.image);
    if (editing.featured) form.set("featured", "1");
    const response = await fetch("/api/desk/items", { method: "POST", body: form });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setSaveError(data?.error || "Could not save that item.");
      return;
    }
    setSaveError("");
    setCategory(editing.category);
    setScreen("items");
    await loadDesk();
  }

  function setList(key: "packs" | "specifications", index: number, value: string) {
    if (!editing) return;
    const list = [...editing[key]];
    list[index] = value;
    setEditing({ ...editing, [key]: list });
  }

  function askDelete(category: string, label: string, id?: string) {
    setConfirmText("");
    setPendingDelete({ category, label, id });
  }

  async function confirmDelete() {
    if (!pendingDelete || confirmText.trim() !== "delete") return;
    const response = await fetch("/api/desk/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: pendingDelete.category, id: pendingDelete.id }),
    });
    if (!response.ok) return;
    setPendingDelete(null);
    setConfirmText("");
    await loadDesk();
  }

  function removeList(key: "packs" | "specifications", index: number) {
    if (!editing) return;
    const list = editing[key].filter((_, itemIndex) => itemIndex !== index);
    setEditing({ ...editing, [key]: list.length ? list : [""] });
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
        <button type="button" className={navBtn} onClick={() => setScreen("home")}>Desk</button>
        <a className={navBtn} href="/">Go to site</a>
        <button type="button" className={`${navBtn} ml-auto`} onClick={() => { fetch("/api/desk/session", { method: "DELETE" }); setSignedIn(false); setScreen("home"); }}>Sign out</button>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        {screen === "home" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {saveError ? <p className="sm:col-span-2 text-[#e07a4a]">{saveError}</p> : null}
            <button type="button" className="rounded-2xl border border-white/10 px-6 py-10 text-left text-xl" onClick={() => setScreen("products")}>Add products</button>
            <button type="button" className="rounded-2xl border border-white/10 px-6 py-10 text-left text-xl" onClick={() => { setScreen("responses"); fetch("/api/desk/rfqs").then((response) => response.json()).then((data) => setResponses(Array.isArray(data?.items) ? data.items : [])).catch(() => undefined); }}>Check responses</button>
          </div>
        )}

        {screen === "products" && (
          <>
            <button type="button" className={navBtn} onClick={() => setScreen("home")}>Back</button>
            <h1 className="mt-3 text-3xl font-semibold">Products</h1>
            <input className={`${field} mt-6`} placeholder="Search products" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
            {productQueryText ? (
              <ul className="mt-4 grid gap-2">
                {catalogMatches.length === 0 ? <li className="text-[#a39b90]">No products match.</li> : catalogMatches.map((item) => (
                  <li key={`${item.category}/${item.id}`}>
                    <div className={rowBtn}>
                      <span>
                        <span className="block">{item.name}</span>
                        <span className="text-sm text-[#a39b90]">{titles[item.category]}</span>
                      </span>
                      <span className="flex shrink-0 gap-2">
                        <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" onClick={() => askDelete(item.category, item.name, item.id)}>Delete</button>
                        <button type="button" className="rounded-lg bg-[#e07a4a] px-3 py-1.5 text-sm font-semibold text-[#1a100c]" onClick={() => openItem(item)}>Open</button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <ul className={`mt-6 grid gap-2 ${productQueryText ? "hidden" : ""}`}>
              {groups.map((entry) => (
                <li key={entry.slug}>
                  <div className={rowBtn}>
                    <span>{entry.title}</span>
                    <span className="flex shrink-0 gap-2">
                      <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" onClick={() => askDelete(entry.slug, entry.title)}>Delete</button>
                      <button type="button" className="rounded-lg bg-[#e07a4a] px-3 py-1.5 text-sm font-semibold text-[#1a100c]" onClick={() => { setCategory(entry.slug); setProductQuery(""); setScreen("items"); }}>Open</button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <form className="mt-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); void addGroup(); }}>
              <input className={field} placeholder="New group name" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
              <button type="submit" className="shrink-0 rounded-lg bg-[#e07a4a] px-4 py-2 font-semibold text-[#1a100c]">Add group</button>
            </form>
          </>
        )}

        {screen === "items" && (
          <>
            <button type="button" className={navBtn} onClick={() => setScreen("products")}>Back</button>
            <div className="mt-3 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold">{titles[category]}</h1>
              <button type="button" className="rounded-lg bg-[#e07a4a] px-4 py-2 font-semibold text-[#1a100c]" onClick={addItem}>Add</button>
            </div>
            <input className={`${field} mt-6`} placeholder="Search products" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
            <ul className="mt-4 grid gap-2">
              {categoryMatches.length === 0 ? <li className="text-[#a39b90]">No products match.</li> : categoryMatches.map((item) => (
                <li key={item.id}>
                  <div className={rowBtn}>
                    <span>{item.name}</span>
                    <span className="flex shrink-0 gap-2">
                      <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" onClick={() => askDelete(item.category, item.name, item.id)}>Delete</button>
                      <button type="button" className="rounded-lg bg-[#e07a4a] px-3 py-1.5 text-sm font-semibold text-[#1a100c]" onClick={() => openItem(item)}>Open</button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {screen === "edit" && editing && (
          <form onSubmit={save} className="max-w-xl">
            <button type="button" className={navBtn} onClick={() => setScreen("items")}>Back</button>
            <h1 className="mt-3 text-3xl font-semibold">{draftKey ? "Edit item" : "New item"}</h1>
            {saveError ? <p className="mt-4 text-[#e07a4a]">{saveError}</p> : null}
            <label className={label}>Category</label>
            <select className={field} value={editing.category} onChange={(event) => { setCategory(event.target.value); setEditing({ ...editing, category: event.target.value }); }}>
              {groups.map((entry) => (
                <option key={entry.slug} value={entry.slug}>{entry.title}</option>
              ))}
            </select>
            <label className={label}>Name</label>
            <input required className={field} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
            <label className={label}>Image</label>
            <input className="block w-full text-sm text-[#a39b90] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e07a4a] file:px-3 file:py-2 file:font-semibold file:text-[#1a100c]" name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.avif" />
            <label className={label}>Pack sizes</label>
            <div className="grid gap-2">
              {editing.packs.map((pack, index) => (
                <div key={`pack-${index}`} className="flex gap-2">
                  <input className={`${field} min-w-0 flex-1`} placeholder="6x1 USQ" value={pack} onChange={(event) => setList("packs", index, event.target.value)} />
                  <button type="button" className="shrink-0 rounded-lg border border-white/15 px-3 text-sm text-[#a39b90]" onClick={() => removeList("packs", index)}>Remove</button>
                </div>
              ))}
            </div>
            <button type="button" className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm" onClick={() => setEditing({ ...editing, packs: [...editing.packs, ""] })}>Add pack size</button>
            <label className={label}>Description</label>
            <textarea rows={4} className={field} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} />
            <label className={label}>Applications</label>
            <textarea rows={3} className={field} value={editing.applications} onChange={(event) => setEditing({ ...editing, applications: event.target.value })} />
            <label className={label}>Specifications</label>
            <div className="grid gap-2">
              {editing.specifications.map((line, index) => (
                <div key={`spec-${index}`} className="flex gap-2">
                  <input className={`${field} min-w-0 flex-1`} placeholder="MIL-PRF-7870" value={line} onChange={(event) => setList("specifications", index, event.target.value)} />
                  <button type="button" className="shrink-0 rounded-lg border border-white/15 px-3 text-sm text-[#a39b90]" onClick={() => removeList("specifications", index)}>Remove</button>
                </div>
              ))}
            </div>
            <button type="button" className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm" onClick={() => setEditing({ ...editing, specifications: [...editing.specifications, ""] })}>Add bullet</button>
            <div className="mt-8 border-t border-white/10 pt-6">
              <button type="submit" className="rounded-lg bg-[#e07a4a] px-4 py-2.5 font-semibold text-[#1a100c]">Save item</button>
            </div>
          </form>
        )}

        {screen === "response" && responseDetail && (
          <article className="max-w-2xl">
            <button type="button" className={navBtn} onClick={() => setScreen("responses")}>Back</button>
            <p className="mt-8 text-xs uppercase tracking-wide text-[#a39b90]">Enquiry</p>
            <h1 className="mt-2 text-3xl font-semibold">{responseDetail.company || responseDetail.name}</h1>
            <dl className="mt-8 border-t border-white/10">
              {[
                ["Name", responseDetail.name],
                ["Email", responseDetail.email],
                ["Phone", responseDetail.phone],
                ["Product", responseDetail.product],
                ["Quote list", responseDetail.quote_items],
              ].filter(([, value]) => value).map(([title, value]) => (
                <div key={title} className="grid gap-1 border-b border-white/10 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <dt className="text-xs uppercase tracking-wide text-[#a39b90]">{title}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="border-b border-white/10 py-4">
                <dt className="text-xs uppercase tracking-wide text-[#a39b90]">Message</dt>
                <dd className="mt-2 whitespace-pre-wrap leading-relaxed">{responseDetail.message}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#a39b90]">Attachment</dt>
                  <dd className="mt-1">
                    {responseDetail.has_attachment
                      ? (responseDetail.attachment_path?.split("/").pop() || "Attached")
                      : "None"}
                  </dd>
                </div>
                {responseDetail.has_attachment ? (
                  <a className="shrink-0 rounded-lg bg-[#e07a4a] px-3 py-2 text-sm font-semibold text-[#1a100c]" href={`/api/desk/rfqs/${responseDetail.id}/file`} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : null}
              </div>
            </dl>
          </article>
        )}

        {screen === "responses" && (
          <>
            <button type="button" className={navBtn} onClick={() => setScreen("home")}>Back</button>
            <h1 className="mt-3 text-3xl font-semibold">Responses</h1>
            {responses.length === 0 ? (
              <p className="mt-6 text-[#a39b90]">No responses yet. New quotes are mailed through Resend and saved in Neon.</p>
            ) : (
              <ul className="mt-6 grid gap-2">
                {responses.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={rowBtn}
                      onClick={() => {
                        fetch(`/api/desk/rfqs/${row.id}`)
                          .then((response) => response.json())
                          .then((data) => {
                            setResponseDetail(data);
                            setScreen("response");
                          })
                          .catch(() => undefined);
                      }}
                    >
                      <span>
                        <p>{row.company || row.name}</p>
                        <p className="text-sm text-[#a39b90]">{row.email} · {row.product}</p>
                      </span>
                      <span className="shrink-0 rounded-lg bg-[#e07a4a] px-3 py-1.5 text-sm font-semibold text-[#1a100c]">Open</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      {pendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6">
          <form
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#171c19] p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void confirmDelete();
            }}
          >
            <h2 className="text-xl font-semibold">Delete {pendingDelete.label}</h2>
            <p className="mt-3 text-sm text-[#a39b90]">Type delete to confirm. This removes it from the catalog.</p>
            <input className={`${field} mt-4`} value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="delete" autoFocus />
            <div className="mt-4 flex gap-2">
              <button type="button" className={navBtn} onClick={() => setPendingDelete(null)}>Cancel</button>
              <button type="submit" className="rounded-lg bg-[#e07a4a] px-3 py-2 text-sm font-semibold text-[#1a100c] disabled:opacity-40" disabled={confirmText.trim() !== "delete"}>Delete</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
