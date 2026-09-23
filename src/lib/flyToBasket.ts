// Animates a small image "flying" from the clicked add button to the header basket icon.
export function flyToBasket(startEl: HTMLElement | null, imgSrc?: string) {
  if (typeof window === "undefined" || !startEl) return;
  const cart = document.querySelector<HTMLElement>('a[aria-label="Quote"]');
  if (!cart) return;

  const s = startEl.getBoundingClientRect();
  const c = cart.getBoundingClientRect();
  const size = 64;

  const fly = document.createElement("div");
  fly.style.cssText = [
    "position:fixed",
    `left:${s.left + s.width / 2 - size / 2}px`,
    `top:${s.top + s.height / 2 - size / 2}px`,
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:10px",
    "overflow:hidden",
    "z-index:99999",
    "pointer-events:none",
    "background:#ede8df",
    "box-shadow:0 10px 30px rgba(26,23,20,0.35)",
    "transition:transform 0.85s cubic-bezier(0.25,0.7,0.25,1), opacity 0.85s ease",
    "will-change:transform,opacity",
  ].join(";");

  if (imgSrc) {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    fly.appendChild(img);
  }
  document.body.appendChild(fly);

  const dx = c.left + c.width / 2 - (s.left + s.width / 2);
  const dy = c.top + c.height / 2 - (s.top + s.height / 2);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(0.12)`;
      fly.style.opacity = "0.35";
    });
  });

  fly.addEventListener("transitionend", () => fly.remove(), { once: true });
  setTimeout(() => fly.remove(), 1100); // safety cleanup

  // Little pulse on the cart when the item lands.
  if (cart.animate) {
    setTimeout(() => {
      cart.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
        { duration: 420, easing: "ease-out" }
      );
    }, 720);
  }
}
