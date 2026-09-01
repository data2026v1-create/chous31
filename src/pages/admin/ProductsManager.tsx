import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { useI18n } from "../../lib/i18n";
import type { Product, ProductColor } from "../../lib/types";
import { cn } from "../../utils/cn";
import {
  formatPrice,
  parseList,
  readFileAsDataUrl,
  uid,
} from "../../lib/utils";

interface ProductDraft {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  description: string;
  images: string[];
  colors: ProductColor[];
  sizesText: string;
  popular: boolean;
  stock: string;
  rating: string;
}

const emptyDraft = (categoryId: string): ProductDraft => ({
  id: "",
  name: "",
  brand: "",
  category: categoryId,
  price: "",
  oldPrice: "",
  description: "",
  images: [],
  colors: [{ name: "Noir", hex: "#111111" }],
  sizesText: "40, 41, 42, 43, 44",
  popular: false,
  stock: "10",
  rating: "4.5",
});

function toDraft(p: Product): ProductDraft {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: String(p.price),
    oldPrice: p.oldPrice ? String(p.oldPrice) : "",
    description: p.description,
    images: [...p.images],
    colors: p.colors.map((c) => ({ ...c })),
    sizesText: p.sizes.join(", "),
    popular: p.popular,
    stock: String(p.stock),
    rating: String(p.rating),
  };
}

export default function ProductsManager() {
  const { products, categories, saveProduct, deleteProduct, toast } = useStore();
  const { locale, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const openNew = () => setDraft(emptyDraft(categories[0]?.id ?? ""));

  useEffect(() => {
    if (searchParams.get("nouveau")) {
      openNew();
      searchParams.delete("nouveau");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (categories.find((c) => c.id === p.category)?.name.toLowerCase() ?? "").includes(q)
    );
  }, [products, search, categories]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || !draft.brand.trim() || !draft.price) {
      toast(t("pm.required"), "error");
      return;
    }
    const product: Product = {
      id: draft.id || uid("article"),
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      category: draft.category,
      price: parseFloat(draft.price.replace(",", ".")) || 0,
      oldPrice: draft.oldPrice
        ? parseFloat(draft.oldPrice.replace(",", ".")) || undefined
        : undefined,
      description: draft.description.trim(),
      images: draft.images.length
        ? draft.images
        : ["https://images.pexels.com/photos/26852035/pexels-photo-26852035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
      colors: draft.colors.filter((c) => c.name.trim()),
      sizes: parseList(draft.sizesText),
      popular: draft.popular,
      stock: parseInt(draft.stock, 10) || 0,
      rating: Math.min(5, Math.max(0, parseFloat(draft.rating.replace(",", ".")) || 0)),
    };
    saveProduct(product);
    setDraft(null);
  };

  return (
    <div className="animate-fade-up space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("pm.title")}
          </h1>
          <p className="mt-1 text-sm text-black/50">
            {t(products.length > 1 ? "pm.subN" : "pm.sub1", { n: products.length })}
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn btn-primary btn-md">
          <Plus size={16} aria-hidden="true" />
          {t("pm.add")}
        </button>
      </header>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35 rtl:left-auto rtl:right-3.5"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10! rtl:pl-3! rtl:pr-10!"
          placeholder={t("pm.search")}
          aria-label={t("pm.search")}
        />
      </div>

      {/* Liste */}
      <div className="card overflow-hidden">
        <ul className="divide-y divide-black/5">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-black/[0.02] sm:flex-nowrap sm:px-5"
            >
              <img src={p.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-sm font-bold">{p.name}</p>
                  {p.popular && (
                    <Star
                      size={13}
                      className="shrink-0 fill-amber-400 text-amber-400"
                      aria-label={t("card.popular")}
                    />
                  )}
                </div>
                <p className="text-xs text-black/45">
                  {p.brand} · {categories.find((c) => c.id === p.category)?.name ?? "—"} ·{" "}
                  {t("pm.sizesN", { n: p.sizes.length })} ·{" "}
                  {t("pm.colorsN", { n: p.colors.length })}
                </p>
              </div>
              <span className="w-24 text-right font-display text-sm font-bold rtl:text-left">
                {formatPrice(p.price, locale)}
              </span>
              <span
                className={cn(
                  "w-24 rounded-full px-2 py-1 text-center text-[11px] font-bold",
                  p.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                )}
              >
                {p.stock > 0 ? t("d.stockN", { n: p.stock }) : t("d.out")}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(toDraft(p))}
                  className="btn btn-ghost btn-sm"
                  aria-label={t("pm.editAria", { name: p.name })}
                >
                  <Pencil size={14} aria-hidden="true" />
                  {t("pm.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(p)}
                  className="btn btn-sm bg-red-50 text-red-500 hover:bg-red-100"
                  aria-label={t("pm.deleteAria", { name: p.name })}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-14 text-center text-sm text-black/45">
              {t("pm.noFound")}{" "}
              <button
                type="button"
                onClick={openNew}
                className="font-bold text-[var(--c-primary)] hover:underline"
              >
                {t("pm.addOne")}
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* ====== Formulaire (modale) ====== */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="animate-pop max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/8 bg-white px-6 py-4">
              <h2 className="font-display text-lg font-bold">
                {draft.id ? t("pm.editTitle") : t("pm.new")}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
                aria-label={t("pm.closeForm")}
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={submit} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="f-name">{t("pm.name")}</label>
                  <input id="f-name" className="input" value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Runner Flux 2.0" required />
                </div>
                <div>
                  <label className="label" htmlFor="f-brand">{t("pm.brand")}</label>
                  <input id="f-brand" className="input" value={draft.brand}
                    onChange={(e) => setDraft({ ...draft, brand: e.target.value })} placeholder="Nike" required />
                </div>
                <div>
                  <label className="label" htmlFor="f-cat">{t("pm.category")}</label>
                  <select id="f-cat" className="input" value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="f-price">{t("pm.price")}</label>
                    <input id="f-price" className="input" inputMode="decimal" value={draft.price}
                      onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="12990" required />
                  </div>
                  <div>
                    <label className="label" htmlFor="f-old">{t("pm.oldPrice")}</label>
                    <input id="f-old" className="input" inputMode="decimal" value={draft.oldPrice}
                      onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value })} placeholder="15990" />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="f-stock">{t("pm.stock")}</label>
                  <input id="f-stock" className="input" inputMode="numeric" value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
                </div>
                <div>
                  <label className="label" htmlFor="f-rating">{t("pm.rating")}</label>
                  <input id="f-rating" className="input" inputMode="decimal" value={draft.rating}
                    onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="f-desc">{t("pm.desc")}</label>
                <textarea id="f-desc" className="input min-h-24 resize-y" value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder={t("pm.descPh")} />
              </div>

              {/* Images */}
              <div>
                <label className="label">{t("pm.images")}</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {draft.images.map((img, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-black/5">
                      <img src={img} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) })}
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-red-500 rtl:right-auto rtl:left-1.5"
                        aria-label={t("pm.removeImg", { n: i + 1 })}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-black/15 text-center transition-colors hover:border-[var(--c-primary)]">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          const dataUrl = await readFileAsDataUrl(f);
                          setDraft((d) => d && { ...d, images: [...d.images, dataUrl] });
                          toast(t("pm.imgAdded"));
                        } catch {
                          toast(t("pm.imgErr"), "error");
                        }
                      }}
                    />
                    <span className="flex flex-col items-center gap-1 text-black/40">
                      <ImagePlus size={20} aria-hidden="true" />
                      <span className="text-[11px] font-semibold">{t("pm.file")}</span>
                    </span>
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    className="input"
                    placeholder={t("pm.urlPh")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) setDraft((d) => d && { ...d, images: [...d.images, v] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-md"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const v = input.value.trim();
                      if (v) setDraft((d) => d && { ...d, images: [...d.images, v] });
                      input.value = "";
                    }}
                  >
                    {t("pm.addUrl")}
                  </button>
                </div>
              </div>

              {/* Couleurs */}
              <div>
                <label className="label">{t("pm.colors")}</label>
                <div className="space-y-2">
                  {draft.colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            colors: draft.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)),
                          })
                        }
                        className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-black/10"
                        aria-label={t("pm.colorAria", { n: i + 1 })}
                      />
                      <input
                        className="input"
                        value={c.name}
                        placeholder={t("pm.colorPh")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            colors: draft.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, colors: draft.colors.filter((_, j) => j !== i) })}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label={t("pm.deleteColorAria", { n: i + 1 })}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, colors: [...draft.colors, { name: "", hex: "#888888" }] })}
                  className="btn btn-ghost btn-sm mt-2"
                >
                  <Plus size={14} aria-hidden="true" /> {t("pm.addColor")}
                </button>
              </div>

              {/* Tailles */}
              <div>
                <label className="label" htmlFor="f-sizes">{t("pm.sizes")}</label>
                <input id="f-sizes" className="input" value={draft.sizesText}
                  onChange={(e) => setDraft({ ...draft, sizesText: e.target.value })} />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={draft.popular}
                  onChange={(e) => setDraft({ ...draft, popular: e.target.checked })}
                  className="h-4.5 w-4.5 accent-[var(--c-primary)]"
                />
                <span className="text-sm font-semibold">{t("pm.popularChk")}</span>
              </label>

              <footer className="flex justify-end gap-2.5 border-t border-black/8 pt-5">
                <button type="button" onClick={() => setDraft(null)} className="btn btn-ghost btn-md">
                  {t("pm.cancel")}
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  {t("pm.save")}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ====== Confirmation suppression ====== */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="animate-pop card w-full max-w-sm p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">{t("pm.confirmTitle")}</h3>
            <p className="mt-1.5 text-sm text-black/55">
              {t("pm.confirmText", { name: confirmDelete.name })}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-md flex-1">
                {t("pm.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="btn btn-md flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                {t("pm.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
