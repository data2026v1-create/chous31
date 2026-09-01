import { useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  Boxes,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Palette,
  Tags,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { tr, useI18n } from "../../lib/i18n";
import { cn } from "../../utils/cn";
import Dashboard from "./Dashboard";
import ProductsManager from "./ProductsManager";
import CategoriesManager from "./CategoriesManager";
import SettingsManager from "./SettingsManager";

function AdminLogin() {
  const { loginAdmin, settings } = useStore();
  const { locale, t } = useI18n();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginAdmin(password)) {
      setError(true);
      setPassword("");
    }
  };

  return (
    <main className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="card animate-fade-up w-full max-w-sm p-8 shadow-xl shadow-black/5">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold text-white">
            S
          </span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">
              {t("a.loginTitle")}
            </h1>
            <p className="text-xs text-black/45">
              {t("a.loginSub", { store: tr(locale, settings.storeName, settings.storeNameAr) })}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="admin-password" className="label">
              {t("a.pwd")}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="input pr-11!"
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black rtl:right-auto rtl:left-3"
                aria-label={show ? t("a.hidePwd") : t("a.showPwd")}
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600" role="alert">
              {t("a.pwdWrong")}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-lg w-full">
            {t("a.login")}
          </button>
        </form>

        <p className="mt-5 rounded-xl bg-black/[0.04] px-3.5 py-2.5 text-center text-xs leading-relaxed text-black/50">
          {t("a.demoHint", { pwd: settings.adminPassword })}
        </p>
      </div>
    </main>
  );
}

export default function Admin() {
  const { isAdmin, logoutAdmin, settings } = useStore();
  const { locale, t } = useI18n();

  if (!isAdmin) return <AdminLogin />;

  const modules = [
    { to: "/admin", end: true, label: t("a.dash"), icon: LayoutDashboard },
    { to: "/admin/articles", label: t("a.articles"), icon: Boxes },
    { to: "/admin/categories", label: t("a.categories"), icon: Tags },
    { to: "/admin/apparence", label: t("a.appearance"), icon: Palette },
  ];

  return (
    <main className="container-x py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-60 lg:shrink-0">
          <div className="card p-4 lg:sticky lg:top-32">
            <div className="mb-4 flex items-center gap-2.5 border-b border-black/5 px-2 pb-4">
              <span className="bg-primary grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-bold text-white">
                S
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight">
                  {t("a.adminOf", { store: tr(locale, settings.storeName, settings.storeNameAr) })}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  ● {t("a.connected")}
                </p>
              </div>
            </div>

            <nav
              className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col"
              aria-label={t("a.modules")}
            >
              {modules.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.end}
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-orange-500/25"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    )
                  }
                >
                  <m.icon size={17} aria-hidden="true" />
                  {m.label}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-black/5 pt-2">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-black/60 hover:bg-black/5 hover:text-black"
                >
                  <ExternalLink size={17} aria-hidden="true" />
                  {t("a.viewShop")}
                </Link>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <LogOut size={17} aria-hidden="true" />
                  {t("a.logout")}
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<ProductsManager />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="apparence" element={<SettingsManager />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}
