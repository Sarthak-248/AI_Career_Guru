// client/src/api/interview.js

export async function generateQuiz(token) {
  const res = await fetch("/api/interview/generate", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate quiz");
  }

  return await res.json();
}

export async function saveAssessment(data, token) {
  const res = await fetch("/api/interview/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save assessment");
  }

  return await res.json();
}

export async function getAssessments(token) {
  const res = await fetch("/api/interview/history", {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
  
  if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch assessments");
  }
  
  return await res.json();
}
