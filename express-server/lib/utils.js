export const sanitizeSkills = (value) => {
  if (!value) return [];

  const raw = Array.isArray(value) ? value.join(",") : value;

  return raw
    .split(/[,|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};
