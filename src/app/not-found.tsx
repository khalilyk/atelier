import Image from "next/image";
import RippleNumerals from "./components/RippleNumerals";
import GoBack from "./components/GoBack";
import SiteFooter from "./components/SiteFooter";

export const metadata = { title: "Page not found", robots: { index: false, follow: true } };

const serif = { fontFamily: "var(--font-serif), Georgia, serif" };

export default function NotFound() {
  return (
    <>
    <main className="[--n:min(64vw,60svh)] md:[--n:min(58vw,105svh)] relative min-h-[100svh] justify-center w-full overflow-hidden bg-[#1f1b17] text-[#f5f0e8] flex flex-col">
      {/* Brand mark, same size and position as the site header logo */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-center pt-6">
        <a href="/" aria-label="Atelier Supply Group home">
          <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        </a>
      </div>

      <div className="relative md:flex-1 flex flex-col items-center justify-center px-4">
        {/* Oversized numerals */}
        <RippleNumerals
          text="404"
          className="select-none leading-none whitespace-nowrap"
          style={{ ...serif, fontWeight: 400, fontSize: "var(--n)", letterSpacing: "-0.06em", lineHeight: 1, marginLeft: "-0.06em", fontVariantNumeric: "lining-nums", fontFeatureSettings: '"lnum" 1' }}
        />

        {/* Message sits inside the 0 on larger screens */}
        <div className="hidden md:flex absolute inset-x-0 top-0 bottom-[40px] items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto [--h:clamp(18px,calc(var(--n)*0.042),36px)] [--b:clamp(12px,calc(var(--n)*0.021),18px)]" style={{ width: "calc(var(--n) * 0.19)" }}>
            <Message />
          </div>
        </div>

        {/* Desktop: Go Back sits under the 0, clear of the footer */}
        <div className="hidden md:block relative z-10 mt-[2px] pb-[30px]">
          <BackButton />
        </div>
      </div>

      {/* Mobile: message under the numerals */}
      <div className="md:hidden px-6 mt-6 mb-16 text-center">
        <Message />
        <BackButton />
      </div>
    </main>
    <SiteFooter />
    </>
  );
}

function Message() {
  return (
    <>
      <h1 className="sr-only" style={{ ...serif, fontWeight: 400, fontSize: "var(--h, clamp(26px, 2.3vw, 34px))", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
        Page Not Available
      </h1>
      <p className="mb-7 md:mb-0 text-[#f5f0e8]/75" style={{ ...serif, fontSize: "var(--b, clamp(16px, 1.25vw, 18px))", lineHeight: 1.45 }}>
        Sorry, this page isn&apos;t available anymore or an error occurred.
      </p>
    </>
  );
}

function BackButton() {
  return (
    <>
      <GoBack className="font-[family-name:var(--font-serif)] text-[17px] inline-flex items-center justify-center min-w-[150px] px-8 py-1.5 rounded-full border border-[#f5f0e8]/70 text-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#1f1b17] transition-colors" />
    </>
  );
}
