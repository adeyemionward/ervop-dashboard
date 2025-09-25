'use client';

import { useState } from "react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({ tags, setTags, placeholder = "Type and press Enter...", label }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      {label && (
        <label className="block text-xl font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-purple-500 hover:text-purple-700"
            >
              ✕
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-none focus:ring-0 outline-none px-2 py-1 text-sm"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">Press Enter or comma to add a tag.</p>
    </div>
  );
}
// Usage Example in a Form Component
// import TagInput from './TagInput';