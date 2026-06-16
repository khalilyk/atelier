"use client";
import { useState, useEffect } from "react";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: `Atelier Supply Group Pty Ltd ("Atelier") is committed to protecting your personal information in accordance with the Australian Privacy Act 1988.

We collect personal information you provide when contacting us, requesting a quote, or using our website. This may include your name, email address, phone number, and project details.

Your information is used solely to respond to enquiries, process orders, and improve our services. We do not sell or share your data with third parties except where required to fulfil your request (e.g. delivery partners) or by law.

We take reasonable steps to protect your information from misuse, loss, and unauthorised access. Our website may use cookies to improve your browsing experience.

You may request access to, or correction of, your personal information at any time by contacting us at hello@ateliersupplygroup.com.au.`,
  },
  terms: {
    title: "Terms & Conditions",
    body: `By accessing or using the Atelier Supply Group website, you agree to the following terms.

All content on this website — including images, text, and design — is the property of Atelier Supply Group Pty Ltd and may not be reproduced without written permission.

Product pricing and availability are subject to change without notice. Orders are confirmed only upon written acceptance by Atelier. Lead times are estimates and may vary based on manufacturer and logistics.

Atelier accepts no liability for indirect or consequential loss arising from the use of our products or services. All goods remain the property of Atelier until payment is received in full.

These terms are governed by the laws of New South Wales, Australia.

For questions, contact us at hello@ateliersupplygroup.com.au.`,
  },
};

type ModalKey = keyof typeof CONTENT;

export default function FooterModals() {
  const [open, setOpen] = useState<ModalKey | null>(null);
  const [visible, setVisible] = useState(false);

  const openModal = (key: ModalKey) => {
    setOpen(key);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setOpen(null), 400);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={() => openModal("privacy")} className="type-nav text-stone-600 hover:text-white transition-colors">Privacy Policy</button>
        <span className="text-stone-700">|</span>
        <button onClick={() => openModal("terms")} className="type-nav text-stone-600 hover:text-white transition-colors">Terms &amp; Conditions</button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div
            className="relative bg-[#0f0e0d] border border-white/10 max-w-xl w-full max-h-[80vh] overflow-y-auto p-10"
            style={{ transition: "opacity 0.4s ease, transform 0.4s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 type-nav text-stone-500 hover:text-white transition-colors flex items-center gap-2"
            >
              Close <span className="text-lg leading-none">×</span>
            </button>

            <p className="type-label text-[#b8934a] mb-6">{CONTENT[open].title}</p>
            <div className="space-y-4">
              {CONTENT[open].body.split("\n\n").map((para, i) => (
                <p key={i} className="type-body text-stone-400">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
