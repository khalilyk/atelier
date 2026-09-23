"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type BasketItem = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  tagline: string;
  size: string;
  qty: number;
  unit: string;
  heroImg: string;
  sku?: string;
  custom?: boolean;
};

type Toast = { id: number; item: BasketItem };

type BasketContextType = {
  items: BasketItem[];
  add: (item: BasketItem) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const BasketContext = createContext<BasketContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
  count: 0,
});

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atelier_basket");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const add = useCallback((item: BasketItem) => {
    setItems(prev => {
      const key = item.id + "|" + item.size;
      const existing = prev.find(i => i.id + "|" + i.size === key);
      const next = existing
        ? prev.map(i => i.id + "|" + i.size === key ? { ...i, qty: i.qty + item.qty } : i)
        : [...prev, item];
      localStorage.setItem("atelier_basket", JSON.stringify(next));
      return next;
    });

    // Fire toast
    const toastId = Date.now();
    setToasts(t => [...t, { id: toastId, item }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== toastId)), 3500);
  }, []);

  const setQty = useCallback((id: string, size: string, qty: number) => {
    setItems(prev => {
      const next = qty <= 0
        ? prev.filter(i => !(i.id === id && i.size === size))
        : prev.map(i => (i.id === id && i.size === size) ? { ...i, qty } : i);
      localStorage.setItem("atelier_basket", JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string, size: string) => {
    setItems(prev => {
      const next = prev.filter(i => !(i.id === id && i.size === size));
      localStorage.setItem("atelier_basket", JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem("atelier_basket");
  }, []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <BasketContext.Provider value={{ items, add, remove, setQty, clear, count }}>
      {children}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-4 bg-[#0a0908] text-white rounded-2xl px-5 py-4 shadow-2xl"
            style={{
              minWidth: 280,
              maxWidth: 360,
              animation: "slideInToast 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Thumb */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-800 flex items-center justify-center">
              {toast.item.heroImg
                ? <img src={toast.item.heroImg} alt="" className="w-full h-full object-cover" />
                : <span className="text-[#b8934a] text-lg">◫</span>}
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#b8934a] uppercase tracking-widest mb-0.5">Added to source list</p>
              <p className="text-sm font-medium text-white truncate">{toast.item.name}</p>
              <p className="text-xs text-stone-400 truncate">{toast.item.size} · {toast.item.qty} {toast.item.qty === 1 ? toast.item.unit : toast.item.unit + "s"}</p>
            </div>
            {/* Check */}
            <div className="w-7 h-7 rounded-full bg-[#b8934a]/20 text-[#b8934a] flex items-center justify-center text-sm shrink-0">
              ✓
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(32px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </BasketContext.Provider>
  );
}

export function useBasket() {
  return useContext(BasketContext);
}
