import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import ProductCard from "../components/ProductCard";
import { cn } from "../utils/cn";
import { usePageTitle } from "../lib/utils";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

export default function Popular() {
  const { products, categories } = useStore();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>("popular");
  const [brand, setBrand] = useState("all");
  const [scope, setScope] = useState<"popular" | "all">("popular");
  usePageTitle(t("pop.title"));

  const catParam = searchParams.get("cat") ?? "all";
  const setCatParam = (cat: string) => {
    if (cat === "all") searchParams.delete("cat");
    else searchParams.set("cat", cat);
    setSearchParams(searchParams, { replace: true });
  };

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = scope === "popular" ? products.filter((p) => p.popular) : [...products];
    if (catParam !== "all") list = list.filter((p) => p.category === catParam);
    if (brand !== "all") list = list.filter((p) => p.brand === brand);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);
    }
    return list;
  }, [products, scope, catParam, brand, sort]);

  const activeFilters =
    (catParam !== "all" ? 1 : 0) + (brand !== "all" ? 1 : 0) + (scope === "all" ? 1 : 0);

  return (
    <main>
      {/* En-tête */}
      <section className="border-b border-black/8 bg-surface">
        <div className="container-x py-12 text-center sm:py-16">
          <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
            {t("pop.eyebrow")}
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("pop.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-black/55 sm:text-base">
            {t("pop.sub")}
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="sticky top-[104px] z-30 border-b border-black/8 bg-white/90 backdrop-blur-lg">
        <div className="container-x flex flex-wrap items-center gap-2.5 py-3.5">
          <SlidersHorizontal size={16} className="text-black/40" aria-hidden="true" />

          <div
            className="flex rounded-full border border-black/10 p-1"
            role="group"
            aria-label={t("pop.scopeAria")}
          >
            {(
              [
                { id: "popular", label: t("pop.scopePop") },
                { id: "all", label: t("pop.scopeAll") },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  scope === s.id ? "bg-black text-white" : "text-black/55 hover:text-black"
                )}
                aria-pressed={scope === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>

          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="input w-auto rounded-full! py-1.5! text-xs font-semibold"
            aria-label={t("pop.brandAria")}
          >
            <option value="all">{t("pop.brands")}</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input w-auto rounded-full! py-1.5! text-xs font-semibold"
            aria-label={t("pop.sortAria")}
          >
            <option value="popular">{t("pop.sortPop")}</option>
            <option value="rating">{t("pop.sortRating")}</option>
            <option value="price-asc">{t("pop.sortAsc")}</option>
            <option value="price-desc">{t("pop.sortDesc")}</option>
          </select>

          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCatParam("all")}
              className={cn("chip shrink-0", catParam === "all" && "chip-active")}
            >
              {t("pop.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatParam(c.id)}
                className={cn("chip shrink-0", catParam === c.id && "chip-active")}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setCatParam("all");
                setBrand("all");
                setScope("popular");
              }}
              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
            >
              <X size={13} aria-hidden="true" />
              {t("pop.reset", { n: activeFilters })}
            </button>
          )}
        </div>
      </section>

      {/* Grille produits */}
      <section className="container-x py-10">
        <p className="mb-6 text-sm text-black/50" aria-live="polite">
          {filtered.length === 1
            ? t("pop.found1", { count: filtered.length })
            : t("pop.foundN", { count: filtered.length })}
        </p>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-black/15 py-24 text-center">
            <span className="text-5xl" aria-hidden="true">🔍</span>
            <h2 className="mt-4 font-display text-xl font-bold">{t("pop.empty")}</h2>
            <p className="mt-1 max-w-sm text-sm text-black/50">{t("pop.emptySub")}</p>
            <button
              type="button"
              onClick={() => {
                setCatParam("all");
                setBrand("all");
                setScope("popular");
              }}
              className="btn btn-primary btn-md mt-5"
            >
              {t("pop.resetFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
