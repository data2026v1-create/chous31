import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "../lib/types";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import { discountPercent, formatPrice } from "../lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toast } = useStore();
  const { locale, t } = useI18n();
  const discount = discountPercent(product);

  /* Effet tilt 3D : rotation qui suit la souris */
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50, hover: false });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: px * 9,
      y: -py * 9,
      gx: (px + 0.5) * 100,
      gy: (py + 0.5) * 100,
      hover: true,
    });
  };

  const onLeave = () => setTilt({ x: 0, y: 0, gx: 50, gy: 50, hover: false });

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast(t("card.noStock"), "error");
      return;
    }
    addToCart(
      product,
      product.sizes[0] ?? "M",
      product.colors[0]?.name ?? "Standard"
    );
    toast(t("p.added", { name: product.name }));
  };

  return (
    <Link
      to={`/produit/${product.id}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group card relative flex flex-col overflow-hidden"
      style={{
        transform: `perspective(950px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${
          tilt.hover ? "translateY(-8px) scale(1.02)" : ""
        }`,
        transition: tilt.hover ? "transform 0.06s linear" : "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: tilt.hover
          ? "0 30px 60px -15px rgba(0,0,0,0.35), 0 12px 24px -12px color-mix(in oklab, var(--c-primary) 40%, transparent)"
          : "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      {/* Reflet lumineux qui suit le curseur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: tilt.hover ? 1 : 0,
          background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 30%, transparent 60%)`,
        }}
      />

      <div className="relative aspect-square overflow-hidden bg-[#f1efec]">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="img-zoom h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 rtl:left-auto rtl:right-3">
          {discount && (
            <span className="bg-primary rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow">
              -{discount}%
            </span>
          )}
          {product.popular && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white shadow">
              ★ {t("card.popular")}
            </span>
          )}
        </div>
        {/* Badge 3D */}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white shadow backdrop-blur-sm rtl:left-auto rtl:right-3">
          🧊 {t("card.3d")}
        </span>
        <button
          type="button"
          onClick={quickAdd}
          aria-label={t("card.addAria", { name: product.name })}
          className="btn btn-primary btn-md absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 rtl:right-auto rtl:left-3"
        >
          <ShoppingBag size={15} aria-hidden="true" />
          {t("card.add")}
        </button>
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">
            {product.brand}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-black/60">
            <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="font-display text-[15px] font-bold leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-primary font-display text-lg font-bold">
            {formatPrice(product.price, locale)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-black/40 line-through">
              {formatPrice(product.oldPrice, locale)}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5" aria-hidden="true">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c.name}
              className="h-3.5 w-3.5 rounded-full border border-black/15"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[11px] font-semibold text-black/40">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
