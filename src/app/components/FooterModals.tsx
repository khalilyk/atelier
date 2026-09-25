"use client";
import { useState, useEffect } from "react";
import { useT } from "./ContentProvider";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: `Atelier Supply Group Pty Ltd (ABN 99 696 292 001) ("Atelier", "we", "us") is committed to handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.

We collect personal information you provide when you contact us, request a quote, place an order or use our website. This may include your name, business name, email address, phone number, delivery and site addresses and project details such as plans and specifications. We may also collect technical information through cookies and analytics tools.

We may disclose personal information where reasonably necessary to provide our products or services including to manufacturers, suppliers, consultants, contractors, installers, freight and logistics providers, payment or accounting providers, IT and website service providers and other parties involved in delivering your project. Some suppliers, manufacturers or service providers used by Atelier may be located outside Australia. Where personal information is disclosed to an overseas recipient, we will take reasonable steps as required by applicable privacy laws to ensure the information is handled appropriately.

We do not sell personal information. We may also disclose information where required by law.

We take reasonable steps to protect personal information from misuse, interference, loss and unauthorised access, and retain it only as long as needed for the purposes above or as required by law. Our website uses cookies and analytics to improve your browsing experience; you can disable cookies in your browser.

We may update this Privacy Policy from time to time to reflect changes to our business practices, services or legal obligations.

For questions about this Privacy Policy or the way we handle personal information, please contact info@ateliersupplygroup.com.au`,
  },
  terms: {
    title: "Terms & Conditions",
    body: `This website is operated by Atelier Supply Group Pty Ltd (ABN 99 696 292 001) ("Atelier"). By accessing or using this website you agree to these terms.

All content on this website including text, images, drawings, logos and design, is owned by or licensed to Atelier and may not be reproduced, distributed or used for commercial purposes without our written permission.

Information on this website including product descriptions, specifications, finishes, images, indicative pricing, lead times and compliance statements, is provided as a general guide only. Products are supplied to project-specific specifications and final details, pricing, availability and compliance are confirmed in a written quotation and are subject to Atelier's Terms of Supply, which prevail over anything on this website. Nothing on this website is an offer to supply and no order is binding until accepted by Atelier in writing.

While we take care to keep this website accurate and current, we do not warrant that it is complete, error-free or uninterrupted, and we may change its content at any time without notice. This website may contain links to third-party websites which we do not control and for which we accept no responsibility.

To the extent permitted by law, Atelier excludes liability for any loss arising from your use of, or reliance on, this website. Nothing in these terms excludes, restricts or modifies any guarantee, right or remedy that cannot lawfully be excluded, including under the Australian Consumer Law.

For questions relating to these Website Terms of Use, please contact info@ateliersupplygroup.com.au`,
  },
};

type ModalKey = keyof typeof CONTENT;

export default function FooterModals({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState<ModalKey | null>(null);
  const [visible, setVisible] = useState(false);
  const t = useT();

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
    // Lets any page open a legal modal, e.g. a form's "privacy policy" link:
    //   window.dispatchEvent(new CustomEvent("open-legal", { detail: "privacy" }))
    const onOpen = (e: Event) => {
      const key = (e as CustomEvent).detail;
      if (key === "privacy" || key === "terms") openModal(key);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-legal", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-legal", onOpen); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={() => openModal("privacy")} className={`type-nav transition-colors py-2 ${light ? "text-stone-500 hover:text-stone-900" : "text-stone-600 hover:text-white"}`} style={{ fontSize: "10px" }}>Privacy Policy</button>
        <span className={light ? "text-stone-400" : "text-stone-700"} style={{ fontSize: "10px" }}>|</span>
        <button onClick={() => openModal("terms")} className={`type-nav transition-colors py-2 ${light ? "text-stone-500 hover:text-stone-900" : "text-stone-600 hover:text-white"}`} style={{ fontSize: "10px" }}>Terms &amp; Conditions</button>
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
            className="relative bg-[#f5f0e8] border border-stone-200 max-w-xl w-full max-h-[80vh] overflow-y-auto p-10"
            style={{ transition: "opacity 0.4s ease, transform 0.4s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 type-nav text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2"
            >
              <span className="text-lg leading-none">×</span>
            </button>

            <p className="type-label text-[#b8934a] mb-6">{CONTENT[open].title}</p>
            <div className="space-y-4">
              {t(open === "privacy" ? "legal.privacy" : "legal.terms").split("\n\n").map((para, i) => (
                <p key={i} className="type-body text-stone-700">
                  {para.split("info@ateliersupplygroup.com.au").flatMap((seg, j, arr) =>
                    j < arr.length - 1
                      ? [seg, <a key={j} href="mailto:info@ateliersupplygroup.com.au" className="text-[#b8934a] hover:underline">info@ateliersupplygroup.com.au</a>]
                      : [seg]
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
