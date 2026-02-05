"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeSkills = void 0;
const sanitizeSkills = (value) => {
    if (!value)
        return [];
    const raw = Array.isArray(value) ? value.join(",") : value;
    return raw
        .split(/[,|]/)
        .map((skill) => skill.trim())
        .filter(Boolean);
};
exports.sanitizeSkills = sanitizeSkills;
