import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CartItem,
  Category,
  DataMode,
  Product,
  Settings,
  ToastMsg,
} from "./types";
import { demoCategories, demoProducts, defaultSettings } from "./demoData";
import {
  sanitizeSheetsData,
  sheetsGetAll,
  sheetsPing,
  sheetsPushAll,
} from "./sheetsApi";

const LS_DATA = "stepstore_data_v2";
const LS_CART = "stepstore_cart_v1";
const LS_CONN = "stepstore_conn_v1";

interface StoreValue {
  // Données
  products: Product[];
  categories: Category[];
  settings: Settings;
  cart: CartItem[];
  cartOpen: boolean;
  toasts: ToastMsg[];
  scriptUrl: string;
  dataMode: DataMode;
  isAdmin: boolean;
  syncing: boolean;
  lastSync: string | null;
  // Panier
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // Notifications
  toast: (message: string, type?: ToastMsg["type"]) => void;
  // Admin — produits / catégories / réglages
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  saveSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
  // Admin — connexion & synchro
  setScriptUrl: (url: string) => void;
  setDataMode: (mode: DataMode) => void;
  testConnection: () => Promise<{ message: string; version?: string }>;
  pullFromSheets: () => Promise<boolean>;
  pushToSheets: () => Promise<boolean>;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [scriptUrl, setScriptUrlState] = useState("");
  const [dataMode, setDataModeState] = useState<DataMode>("demo");
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem("stepstore_admin") === "1"
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const loadedRef = useRef(false);

  /* ---------- Chargement initial (localStorage) ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DATA);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.products) && d.products.length)
          setProducts(d.products);
        if (Array.isArray(d.categories) && d.categories.length)
          setCategories(d.categories);
        if (d.settings && typeof d.settings === "object")
          setSettings({ ...defaultSettings, ...d.settings });
      }
    } catch {
      /* données corrompues : on garde la démo */
    }
    try {
      const raw = localStorage.getItem(LS_CART);
      if (raw) setCart(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    try {
      const raw = localStorage.getItem(LS_CONN);
      if (raw) {
        const c = JSON.parse(raw);
        if (typeof c.scriptUrl === "string") setScriptUrlState(c.scriptUrl);
        if (c.dataMode === "sheets") setDataModeState("sheets");
        if (typeof c.lastSync === "string") setLastSync(c.lastSync);
      }
    } catch {
      /* ignore */
    }
    loadedRef.current = true;
  }, []);

  /* ---------- Persistance ---------- */
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(
        LS_DATA,
        JSON.stringify({ products, categories, settings })
      );
    } catch {
      /* quota dépassé (images en data-URL) */
    }
  }, [products, categories, settings]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(LS_CART, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(
        LS_CONN,
        JSON.stringify({ scriptUrl, dataMode, lastSync })
      );
    } catch {
      /* ignore */
    }
  }, [scriptUrl, dataMode, lastSync]);

  /* ---------- Toasts ---------- */
  const toast = useCallback(
    (message: string, type: ToastMsg["type"] = "success") => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3800);
    },
    []
  );

  /* ---------- Panier ---------- */
  const addToCart = useCallback(
    (product: Product, size: string, color: string, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === product.id && i.size === size && i.color === color
        );
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
          );
        }
        return [
          ...prev,
          {
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            productId: product.id,
            size,
            color,
            qty,
          },
        ];
      });
      setCartOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.qty, 0),
    [cart]
  );

  const cartTotal = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return cart.reduce((s, i) => {
      const p = byId.get(i.productId);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }, [cart, products]);

  /* ---------- Synchronisation Google Sheets ---------- */
  const testConnection = useCallback(async () => {
    if (!scriptUrl) throw new Error("Aucune URL de script configurée");
    const res = await sheetsPing(scriptUrl);
    return res.data ?? { message: "Connexion OK" };
  }, [scriptUrl]);

  const pullFromSheets = useCallback(async () => {
    if (!scriptUrl) {
      toast("Configurez d'abord l'URL du script", "error");
      return false;
    }
    setSyncing(true);
    try {
      const res = await sheetsGetAll(scriptUrl);
      const clean = sanitizeSheetsData(res.data ?? {});
      setProducts(clean.products.length ? clean.products : products);
      setCategories(clean.categories.length ? clean.categories : categories);
      setSettings({ ...defaultSettings, ...clean.settings });
      setLastSync(new Date().toLocaleString("fr-FR"));
      toast("Données récupérées depuis Google Sheets");
      return true;
    } catch (e) {
      toast(
        `Échec de la synchronisation : ${e instanceof Error ? e.message : "erreur"}`,
        "error"
      );
      return false;
    } finally {
      setSyncing(false);
    }
  }, [scriptUrl, products, categories, toast]);

  const pushToSheets = useCallback(async () => {
    if (!scriptUrl) {
      toast("Configurez d'abord l'URL du script", "error");
      return false;
    }
    setSyncing(true);
    try {
      await sheetsPushAll(scriptUrl, { products, categories, settings });
      setLastSync(new Date().toLocaleString("fr-FR"));
      toast("Données envoyées vers Google Sheets");
      return true;
    } catch (e) {
      toast(
        `Échec de l'envoi : ${e instanceof Error ? e.message : "erreur"}`,
        "error"
      );
      return false;
    } finally {
      setSyncing(false);
    }
  }, [scriptUrl, products, categories, settings, toast]);

  /* Pull automatique au démarrage en mode Sheets */
  useEffect(() => {
    if (loadedRef.current && dataMode === "sheets" && scriptUrl) {
      void pullFromSheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Admin : produits ---------- */
  const persistAndSync = useCallback(
    (
      nextProducts: Product[],
      nextCategories: Category[],
      nextSettings: Settings
    ) => {
      setProducts(nextProducts);
      setCategories(nextCategories);
      setSettings(nextSettings);
      if (dataMode === "sheets" && scriptUrl) {
        void sheetsPushAll(scriptUrl, {
          products: nextProducts,
          categories: nextCategories,
          settings: nextSettings,
        })
          .then(() => setLastSync(new Date().toLocaleString("fr-FR")))
          .catch(() => {
            toast("Modification locale OK — synchro Sheets impossible", "error");
          });
      }
    },
    [dataMode, scriptUrl, toast]
  );

  const saveProduct = useCallback(
    (product: Product) => {
      const next = products.some((p) => p.id === product.id)
        ? products.map((p) => (p.id === product.id ? product : p))
        : [...products, product];
      persistAndSync(next, categories, settings);
      toast("Article enregistré");
    },
    [products, categories, settings, persistAndSync, toast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const next = products.filter((p) => p.id !== id);
      persistAndSync(next, categories, settings);
      toast("Article supprimé", "info");
    },
    [products, categories, settings, persistAndSync, toast]
  );

  const saveCategory = useCallback(
    (category: Category) => {
      const next = categories.some((c) => c.id === category.id)
        ? categories.map((c) => (c.id === category.id ? category : c))
        : [...categories, category];
      persistAndSync(products, next, settings);
      toast("Catégorie enregistrée");
    },
    [products, categories, settings, persistAndSync, toast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      const next = categories.filter((c) => c.id !== id);
      persistAndSync(products, next, settings);
      toast("Catégorie supprimée", "info");
    },
    [products, categories, settings, persistAndSync, toast]
  );

  const saveSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      persistAndSync(products, categories, next);
    },
    [products, categories, settings, persistAndSync]
  );

  const resetDemo = useCallback(() => {
    persistAndSync(demoProducts, demoCategories, defaultSettings);
    toast("Contenu de démonstration restauré");
  }, [persistAndSync, toast]);

  /* ---------- Admin : connexion ---------- */
  const setScriptUrl = useCallback((url: string) => {
    setScriptUrlState(url.trim());
  }, []);

  const setDataMode = useCallback((mode: DataMode) => {
    setDataModeState(mode);
  }, []);

  const loginAdmin = useCallback(
    (password: string) => {
      if (password === settings.adminPassword) {
        setIsAdmin(true);
        sessionStorage.setItem("stepstore_admin", "1");
        return true;
      }
      return false;
    },
    [settings.adminPassword]
  );

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem("stepstore_admin");
  }, []);

  const value: StoreValue = {
    products,
    categories,
    settings,
    cart,
    cartOpen,
    toasts,
    scriptUrl,
    dataMode,
    isAdmin,
    syncing,
    lastSync,
    setCartOpen,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartCount,
    cartTotal,
    toast,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveSettings,
    resetDemo,
    setScriptUrl,
    setDataMode,
    testConnection,
    pullFromSheets,
    pushToSheets,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans <StoreProvider>");
  return ctx;
}
