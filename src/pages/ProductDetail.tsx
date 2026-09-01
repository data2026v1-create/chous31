import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import ProductCard from "../components/ProductCard";
import Product3D from "../components/Product3D";
import { cn } from "../utils/cn";
import { discountPercent, formatPrice, usePageTitle } from "../lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, categories, addToCart, toast } = useStore();
  const { locale, t } = useI18n();

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  usePageTitle(product?.name);

  const [imageIndex, setImageIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  /* Présentation 3D / photos */
  const [view, setView] = useState<"3d" | "photo">("3d");
  const [loading3d, setLoading3d] = useState(true);

  useEffect(() => {
    setView("3d");
    setLoading3d(true);
    setImageIndex(0);
  }, [id]);

  const handle3dFail = () => {
    setView("photo");
    setLoading3d(false);
    toast(t("p3d.error"), "info");
  };

  const handle3dLoaded = () => setLoading3d(false);

  if (!product) {
    return (
      <main className="container-x grid place-items-center py-28 text-center">
        <span className="text-6xl" aria-hidden="true">👟</span>
        <h1 className="mt-5 font-display text-3xl font-bold">{t("p.notFound")}</h1>
        <p className="mt-2 text-sm text-black/55">{t("p.notFoundSub")}</p>
        <Link to="/populaire" className="btn btn-primary btn-md mt-6">
          {t("p.back")}
        </Link>
      </main>
    );
  }

  const category = categories.find((c) => c.id === product.category);
  const discount = discountPercent(product);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      toast(t("p.chooseSize"), "error");
      return;
    }
    addToCart(product, size, product.colors[colorIndex]?.name ?? "Standard", qty);
    toast(t("p.added", { name: product.name }));
  };

  return (
    <main>
      {/* Fil d'Ariane */}
      <nav className="container-x py-4 text-xs font-medium text-black/45" aria-label={t("p.breadcrumb")}>
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-[var(--c-primary)]">{t("p.crumbHome")}</Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={12} className="rtl:-scale-x-100" /></li>
          <li>
            <Link to="/populaire" className="hover:text-[var(--c-primary)]">{t("p.crumbShop")}</Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={12} className="rtl:-scale-x-100" /></li>
          <li>
            <Link to={`/populaire?cat=${product.category}`} className="hover:text-[var(--c-primary)]">
              {category?.name ?? t("p.crumbCat")}
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={12} className="rtl:-scale-x-100" /></li>
          <li className="font-semibold text-black">{product.name}</li>
        </ol>
      </nav>

      <section className="container-x grid gap-10 pb-16 lg:grid-cols-2 lg:gap-14">
        {/* ============ Galerie 3D / Photos ============ */}
        <div>
          {/* Sélecteur de présentation */}
          <div
            className="mb-4 inline-flex rounded-full border border-black/10 bg-white p-1 shadow-sm"
            role="group"
            aria-label={t("p3d.viewAria")}
          >
            <button
              type="button"
              onClick={() => setView("3d")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                view === "3d" ? "bg-primary text-white shadow" : "text-black/55 hover:text-black"
              )}
              aria-pressed={view === "3d"}
            >
              🧊 {t("p3d.view3d")}
            </button>
            <button
              type="button"
              onClick={() => setView("photo")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                view === "photo" ? "bg-black text-white" : "text-black/55 hover:text-black"
              )}
              aria-pressed={view === "photo"}
            >
              📷 {t("p3d.photos")}
            </button>
          </div>

          {view === "3d" ? (
            /* ---------- Scène 3D interactive ---------- */
            <div className="relative aspect-square overflow-hidden rounded-[1.75rem]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 120% at 50% 18%, color-mix(in oklab, var(--c-primary) 20%, #ffffff) 0%, #ffffff 52%, #f1efec 100%)",
                }}
                aria-hidden="true"
              />
              <Product3D onFail={handle3dFail} onLoaded={handle3dLoaded} />

              {/* Badges */}
              {discount && (
                <span className="bg-primary pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg rtl:left-auto rtl:right-4">
                  -{discount}%
                </span>
              )}
              {product.popular && (
                <span className="pointer-events-none absolute left-4 top-4 translate-y-10 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg rtl:left-auto rtl:right-4">
                  ★ {t("card.popular")}
                </span>
              )}

              {/* Chargement */}
              {loading3d && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/85 px-6 py-4 shadow-lg backdrop-blur">
                    <span className="bg-primary h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                    <span className="text-xs font-bold text-black/60">
                      {t("p3d.loading")}
                    </span>
                  </div>
                </div>
              )}

              {/* Aide */}
              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold text-black/40">
                🖱️ {t("p3d.hint")}
              </p>
            </div>
          ) : (
            /* ---------- Galerie photos ---------- */
            <>
              <div className="relative overflow-hidden rounded-[1.75rem] bg-[#f1efec]">
                <img
                  src={product.images[imageIndex]}
                  alt={`${product.name} — ${t("p.view", { n: imageIndex + 1 })}`}
                  className="aspect-square w-full object-cover"
                />
                {discount && (
                  <span className="bg-primary absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg rtl:left-auto rtl:right-4">
                    -{discount}%
                  </span>
                )}
                {product.popular && (
                  <span className="absolute left-4 top-4 translate-y-10 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg rtl:left-auto rtl:right-4">
                    ★ {t("card.popular")}
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={cn(
                      "h-20 w-20 overflow-hidden rounded-xl border-2 transition-all",
                      i === imageIndex
                        ? "border-[var(--c-primary)] shadow-lg"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    aria-label={t("p.view", { n: i + 1 })}
                    aria-pressed={i === imageIndex}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ============ Infos ============ */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">
            {product.brand}
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold">
              <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              {t("p.rating", { rating: product.rating.toFixed(1) })}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                product.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  product.stock > 0 ? "animate-pulse-dot bg-emerald-500" : "bg-red-500"
                )}
                aria-hidden="true"
              />
              {product.stock > 0
                ? t("p.inStock", { count: product.stock })
                : t("p.out")}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-primary font-display text-4xl font-bold">
              {formatPrice(product.price, locale)}
            </span>
            {product.oldPrice && (
              <span className="pb-1 text-lg text-black/40 line-through">
                {formatPrice(product.oldPrice, locale)}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-black/60">
            {product.description}
          </p>

          {/* Couleurs */}
          <fieldset className="mt-7">
            <legend className="label">
              {t("p.color")}{" "}
              <span className="font-bold normal-case tracking-normal text-[var(--c-primary)]">
                {product.colors[colorIndex]?.name}
              </span>
            </legend>
            <div className="flex gap-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColorIndex(i)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border-2 transition-all",
                    i === colorIndex
                      ? "scale-110 border-[var(--c-primary)]"
                      : "border-black/15 hover:scale-105"
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={t("p.colorAria", { name: c.name })}
                  aria-pressed={i === colorIndex}
                  title={c.name}
                >
                  {i === colorIndex && (
                    <span
                      className="text-base font-bold"
                      style={{
                        color:
                          c.hex === "#FFFFFF" || c.hex === "#F5F5F5" || c.hex === "#F4F4F4" || c.hex === "#F7F7F7"
                            ? "#111"
                            : "#fff",
                      }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Tailles */}
          <fieldset className="mt-6">
            <legend className="label">{t("p.size")}</legend>
            <div
              className={cn(
                "flex flex-wrap gap-2",
                sizeError && !size && "rounded-xl ring-2 ring-red-400/60"
              )}
            >
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={cn(
                    "h-11 min-w-11 rounded-xl border-2 px-2 text-sm font-bold transition-all",
                    size === s
                      ? "border-[var(--c-primary)] bg-[var(--c-primary)] text-white shadow-lg shadow-orange-500/25"
                      : "border-black/12 hover:border-[var(--c-primary)]"
                  )}
                  aria-pressed={size === s}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && !size && (
              <p className="mt-2 text-xs font-semibold text-red-500" role="alert">
                {t("p.sizeErr")}
              </p>
            )}
          </fieldset>

          {/* Quantité + Ajout */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border-2 border-black/10 p-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
                aria-label={t("p.dec")}
              >
                <Minus size={15} />
              </button>
              <span className="w-7 text-center font-display text-base font-bold" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
                aria-label={t("p.inc")}
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn btn-primary btn-lg flex-1 sm:flex-none sm:px-10"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              {t("p.add")}
            </button>
          </div>

          {/* Garanties */}
          <ul className="mt-8 grid gap-3 border-t border-black/8 pt-6 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5">
              <Truck size={18} className="text-primary shrink-0" aria-hidden="true" />
              {t("p.ship")}
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw size={18} className="text-primary shrink-0" aria-hidden="true" />
              {t("p.ret")}
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-primary shrink-0" aria-hidden="true" />
              {t("p.auth")}
            </li>
          </ul>
        </div>
      </section>

      {/* ============ Produits liés ============ */}
      {related.length > 0 && (
        <section className="bg-surface py-14">
          <div className="container-x">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {t("p.related")}
            </h2>
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
