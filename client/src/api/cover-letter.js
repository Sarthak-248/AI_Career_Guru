export async function generateCoverLetter(data, token) {
  const res = await fetch("/api/cover-letter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate cover letter");
  }

  return await res.json();
}

export async function getCoverLetters(token) {
  const res = await fetch("/api/cover-letter", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch cover letters");
  }

  return await res.json();
}

export async function getCoverLetter(id, token) {
  const res = await fetch(`/api/cover-letter/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.error || "Failed to fetch cover letter");
  }
  
  return await res.json();
}

export async function deleteCoverLetter(id, token) {
  const res = await fetch(`/api/cover-letter/${id}`, {
    method: "DELETE",
    headers: {
       Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete cover letter");
  }
  
  return await res.json();
}
