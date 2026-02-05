// Client-side API wrappers

export async function saveResume(content, token) {
  const res = await fetch("/api/resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save resume");
  }

  return await res.json();
}

export async function getResume(token) {
  const res = await fetch("/api/resume", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    // 404 is acceptable, means no resume yet
    if (res.status === 404) return null;
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch resume");
  }

  return await res.json();
}

export async function improveWithAI({ current, type }, token) {
    const res = await fetch("/api/resume/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ current, type }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to improve content");
    }
  
    const data = await res.json();
    return data.improvedContent;
}
