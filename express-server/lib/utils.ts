export const sanitizeSkills = (value?: string | string[] | null) => {
  if (!value) return [];

  const raw = Array.isArray(value) ? value.join(",") : value;

  return raw
    .split(/[,|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};
