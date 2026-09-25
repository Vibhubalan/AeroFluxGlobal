"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuote } from "@/context/quote";
import { dialCodes, enquiryProducts } from "@/data/dial-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, UploadCloud, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

export function RfqForm() {
  const { items } = useQuote();
  const [fileName, setFileName] = useState("");
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const sendingLock = useRef(false);
  const [phoneCode, setPhoneCode] = useState("AE +971");
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeQuery, setCodeQuery] = useState("");
  const codeRef = useRef<HTMLDivElement>(null);

  const filteredCodes = dialCodes.filter((item) => {
    const query = codeQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.iso.toLowerCase().includes(query) ||
      item.dial.includes(query.replace(/\s/g, ""))
    );
  });

  useEffect(() => {
    if (!codeOpen) return;
    const close = (event: MouseEvent) => {
      if (!codeRef.current?.contains(event.target as Node)) setCodeOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [codeOpen]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingLock.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    sendingLock.current = true;
    setFailed(false);
    setSent(true);
    const body = new FormData(form);
    void fetch("/api/rfq", { method: "POST", body })
      .then((response) => {
        if (!response.ok || response.url.includes("rfq-error")) {
          sendingLock.current = false;
          setFailed(true);
        }
      })
      .catch(() => {
        sendingLock.current = false;
        setFailed(true);
      });
  }

  return (
    <>
    {sent && !failed ? (
      <div className="rounded-2xl border border-ink/12 glass-panel p-5">
        <CheckCircle2 className="mb-3 h-6 w-6 text-ink" />
        <h2 className="font-display text-2xl text-ink">Your RFQ has reached the desk.</h2>
        <p className="mt-2 text-sm text-steel">We have your details. The desk will reply with availability and the next step.</p>
      </div>
    ) : null}
    <form
      className={`rounded-2xl border border-ink/12 glass-panel p-5 shadow-none grid gap-4 ${sent && !failed ? "hidden" : ""}`}
      action="/api/rfq"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
    >
      <div>
        <h2 className="font-display text-2xl text-ink">Send us your enquiry</h2>
        <p className="mt-2 text-sm text-steel">
          Tell us what you need. The desk will reply with availability and the next step.
        </p>
      </div>

      {/* Honeypot anti-spam */}
      <div className="sr-only" aria-hidden="true">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input
        type="hidden"
        name="quote_items"
        value={items.map((item) => item.title).join(", ")}
      />

      {items.length > 0 && (
        <div className="rounded-xl border border-red/20 bg-red/5 p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-ink font-medium">
            <CheckCircle2 className="w-4 h-4 text-red shrink-0" />
            <span>{items.length} item{items.length > 1 ? "s" : ""} attached from catalog</span>
          </div>
          <span className="font-mono text-[10px] uppercase text-red font-semibold tracking-wider">
            Auto-attached
          </span>
        </div>
      )}

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
            Full Name <span className="text-red">*</span>
          </label>
          <Input
            name="name"
            placeholder="Enter your full name"
            required
            className="glass-panel"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
            Company <span className="text-red">*</span>
          </label>
          <Input
            name="company"
            placeholder="Enter your company name"
            required
            className="glass-panel"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
            Email <span className="text-red">*</span>
          </label>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            className="glass-panel"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
            Phone <span className="text-red">*</span>
          </label>
          <div className="flex gap-2">
            <div ref={codeRef} className="relative w-[8.75rem] shrink-0">
              <input type="hidden" name="phone_code" value={phoneCode} />
              <button
                type="button"
                aria-label="Country code"
                aria-expanded={codeOpen}
                onClick={() => {
                  setCodeOpen((open) => !open);
                  setCodeQuery("");
                }}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-ink/15 glass-panel px-2.5 text-sm text-ink outline-none focus:border-red"
              >
                <span>{phoneCode}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-ink" />
              </button>
              {codeOpen && (
                <div className="absolute z-20 mt-1 w-64 overflow-hidden rounded-lg border border-black/10 bg-[#141414] shadow-none">
                  <input
                    autoFocus
                    value={codeQuery}
                    onChange={(event) => setCodeQuery(event.target.value)}
                    placeholder="Search country"
                    className="w-full border-b border-ink/12 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-steel"
                  />
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filteredCodes.map((item) => (
                      <li key={item.iso}>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneCode(`${item.iso} ${item.dial}`);
                            setCodeOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-ink hover:bg-black/5"
                        >
                          <span>{item.name}</span>
                          <span className="text-steel">{item.dial}</span>
                        </button>
                      </li>
                    ))}
                    {filteredCodes.length === 0 && (
                      <li className="px-3 py-2 text-sm text-steel">No match</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Input
              name="phone"
              type="tel"
              placeholder="Phone number"
              required
              className="glass-panel"
            />
          </div>
        </div>

      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
          Product / Enquiry
        </label>
        <div className="relative">
          <select
            name="product"
            defaultValue=""
            className="flex h-11 w-full appearance-none rounded-lg border border-ink/15 glass-panel px-3.5 pr-10 text-sm text-ink outline-none focus:border-red"
          >
            <option value="" className="bg-[#141414]">Select product or enquiry</option>
            {enquiryProducts.map((item) => (
              <option key={item} value={item} className="bg-[#141414]">
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
          Message <span className="text-red">*</span>
        </label>
        <Textarea
          name="message"
          required
          rows={3}
          placeholder="Please provide details about your requirements, specifications, quantity, delivery requirements, or any other relevant information."
          className="glass-panel"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-wider uppercase text-steel font-mono">
          RFQ Document / File Upload
        </p>
        <label className={`relative block cursor-pointer border-2 border-dashed rounded-xl px-4 py-6 glass-panel text-center transition-colors ${fileName ? "border-ink/40" : "border-ink/15 hover:border-red/60"}`}>
          {fileName ? (
            <>
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-ink" />
              <span className="block text-sm font-semibold text-ink">Attached</span>
              <span className="mt-1 block text-xs text-steel">{fileName}</span>
            </>
          ) : (
            <>
              <UploadCloud className="mx-auto mb-2 h-6 w-6 text-red" />
              <span className="block text-sm font-semibold text-ink">
                Drag & drop your file here or <span className="text-red">browse</span>
              </span>
              <span className="mt-1 block text-xs text-steel">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG — Maximum 10MB
              </span>
            </>
          )}
          <input
            name="document"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <div className="pt-2">
        {failed ? <p className="text-sm text-red">The quote could not be sent. Try again.</p> : null}
        <Button
          type="submit"
          size="lg"
          className="w-full gap-2 font-semibold tracking-wide"
        >
          <Send className="w-4 h-4" />
          Request an RFQ
        </Button>
        <p className="text-[11px] text-steel font-mono flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber shrink-0" />
          Strict NDA & OEM provenance guaranteed
        </p>
      </div>
    </form>
    </>
  );
}
