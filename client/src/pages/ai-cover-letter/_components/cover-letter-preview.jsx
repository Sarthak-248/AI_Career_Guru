// client/src/pages/ai-cover-letter/_components/cover-letter-preview.jsx
"use client";

import React from "react";
import MDEditor from "@uiw/react-md-editor";

export const CoverLetterPreview = ({ content }) => {
  return (
    <div className="py-4">
      <MDEditor
        value={content}
        preview="preview"
        height={700}
        hideToolbar={true}
      />
    </div>
  );
};
