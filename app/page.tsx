"use client";

import { useState } from "react";

export default function Home() {
  const [projectId, setProjectId] = useState("");
  const [msg, setMsg] = useState("");

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Subiendo...");

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!projectId) {
      setMsg("Poné el Project ID");
      return;
    }

    if (!file) {
      setMsg("Elegí una foto");
      return;
    }

    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("file", file);

    const res = await fetch("/api/photos/upload", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();

    if (res.ok) {
      setMsg("Foto subida correctamente ✅");
    } else {
      setMsg("Error: " + json.error);
    }
  }

  return (
    <main style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>GrowOps</h1>

      <form onSubmit={onUpload}>
        <div>
          <label>Project ID</label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <input
            name="file"
            type="file"
            accept="image/*"
            capture="environment"
          />
        </div>

        <button style={{ marginTop: 20, padding: 10 }}>
          Subir foto
        </button>
      </form>

      <p>{msg}</p>
    </main>
  );
}
