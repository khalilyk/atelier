"use client";
import { useEffect, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Greeting() {
  const [name, setName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    fetch("/api/admin/auth")
      .then(r => r.json())
      .then(d => { if (d.admin) setName(d.admin.name.split(" ")[0]); });
  }, []);

  return (
    <>
      <p className="text-stone-400 text-sm mb-1">Atelier Supply Group</p>
      <h1 className="text-2xl font-light text-stone-900">
        {greeting}{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="text-stone-900 text-sm mt-1">Here&apos;s what&apos;s happening on your site.</p>
    </>
  );
}
