import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./lib/store";
import { I18nProvider, useI18n } from "./lib/i18n";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Toasts from "./components/Toasts";
import Home from "./pages/Home";
import Popular from "./pages/Popular";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Admin from "./pages/admin/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function ThemeRoot() {
  const { settings } = useStore();
  const { t } = useI18n();

  useEffect(() => {
    document.body.style.backgroundColor = settings.bgColor;
    document.body.style.color = settings.textColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", settings.primaryColor);
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, [settings.bgColor, settings.textColor, settings.primaryColor]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--c-primary": settings.primaryColor,
          "--c-bg": settings.bgColor,
          "--c-text": settings.textColor,
          "--c-surface": settings.surfaceColor,
        } as React.CSSProperties
      }
    >
      <a href="#contenu" className="skip-link">
        {t("a11y.skip")}
      </a>
      <Header />
      <div id="contenu" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/populaire" element={<Popular />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Footer />
      <CartDrawer />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <I18nProvider>
        <HashRouter>
          <ScrollToTop />
          <ThemeRoot />
        </HashRouter>
      </I18nProvider>
    </StoreProvider>
  );
}
