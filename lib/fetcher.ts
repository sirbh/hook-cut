// lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};


export const fetcher2 = async (url: string, body: Record<string, string>) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Request failed")
  }

  return res.json()
}

