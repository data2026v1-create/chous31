import { Link } from "react-router-dom";
import { Boxes, Database, Plus, Tags, TrendingUp } from "lucide-react";
import { useStore } from "../../lib/store";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../utils/cn";
import { formatPrice } from "../../lib/utils";

export default function Dashboard() {
  const { products, categories, cartTotal, toast, saveProduct } = useStore();
  const { locale, t } = useI18n();

  const inStock = products.filter((p) => p.stock > 0).length;
  const avgPrice = products.length
    ? products.reduce((s, p) => s + p.price, 0) / products.length
    : 0;
  const popularCount = products.filter((p) => p.popular).length;

  const stats = [
    { label: t("d.statArticles"), value: String(products.length), icon: Boxes, to: "/admin/articles" },
    { label: t("d.statCategories"), value: String(categories.length), icon: Tags, to: "/admin/categories" },
    { label: t("d.statStock"), value: `${inStock} / ${products.length}`, icon: TrendingUp, to: "/admin/articles" },
    { label: t("d.statAvg"), value: formatPrice(avgPrice, locale), icon: Database, to: "/admin/articles" },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("d.title")}
          </h1>
          <p className="mt-1 text-sm text-black/50">{t("d.sub")}</p>
        </div>
        <Link to="/admin/articles?nouveau=1" className="btn btn-primary btn-md">
          <Plus size={16} aria-hidden="true" />
          {t("d.new")}
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
          >
            <span className="bg-surface grid h-10 w-10 place-items-center rounded-xl transition-colors group-hover:bg-[var(--c-primary)] group-hover:text-white">
              <s.icon size={19} className="text-primary group-hover:text-white" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium text-black/45">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contenu du catalogue */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{t("d.content")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex justify-between rounded-lg bg-black/[0.035] px-3.5 py-2.5">
              <span className="text-black/60">{t("d.popular")}</span>
              <strong>{popularCount}</strong>
            </li>
            <li className="flex justify-between rounded-lg bg-black/[0.035] px-3.5 py-2.5">
              <span className="text-black/60">{t("d.brands")}</span>
              <strong>{new Set(products.map((p) => p.brand)).size}</strong>
            </li>
            <li className="flex justify-between rounded-lg bg-black/[0.035] px-3.5 py-2.5">
              <span className="text-black/60">{t("d.cartAmount")}</span>
              <strong>{formatPrice(cartTotal, locale)}</strong>
            </li>
          </ul>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                saveProduct({
                  id: `article-${Date.now()}`,
                  name: "Nouvel article",
                  brand: "StepStore",
                  category: categories[0]?.id ?? "",
                  price: 9990,
                  description: "Description de l'article (à personnaliser).",
                  images: [
                    "https://images.pexels.com/photos/26852035/pexels-photo-26852035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
                  ],
                  colors: [{ name: "Noir", hex: "#111111" }],
                  sizes: ["40", "41", "42", "43", "44"],
                  popular: false,
                  stock: 10,
                  rating: 4.5,
                });
                toast(t("d.draftOk"));
              }}
              className="btn btn-ghost btn-md"
            >
              <Plus size={15} aria-hidden="true" />
              {t("d.draft")}
            </button>
          </div>
        </section>

        {/* Aide rapide */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{t("a.dash")}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-black/60">
            <li className="flex gap-2.5">
              <span className="text-primary" aria-hidden="true">▸</span>
              {t("d.dashTip1")}
            </li>
            <li className="flex gap-2.5">
              <span className="text-primary" aria-hidden="true">▸</span>
              {t("d.dashTip2")}
            </li>
            <li className="flex gap-2.5">
              <span className="text-primary" aria-hidden="true">▸</span>
              {t("d.dashTip3")}
            </li>
          </ul>
        </section>
      </div>

      {/* Produits récents */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("d.recent")}</h2>
          <Link
            to="/admin/articles"
            className="text-sm font-bold text-[var(--c-primary)] hover:underline"
          >
            {t("d.manage")} →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-black/5">
          {products.slice(-5).reverse().map((p) => (
            <div key={p.id} className="flex items-center gap-3.5 py-3">
              <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold">{p.name}</p>
                <p className="text-xs text-black/45">
                  {p.brand} · {categories.find((c) => c.id === p.category)?.name ?? "—"}
                </p>
              </div>
              <span className="text-sm font-bold">{formatPrice(p.price, locale)}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  p.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                )}
              >
                {p.stock > 0 ? t("d.stockN", { n: p.stock }) : t("d.out")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
