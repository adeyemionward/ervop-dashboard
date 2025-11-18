"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface NoteItem {
  id: number;
  content: string;
  author: string;
  date: string;
  created_at?: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string; // <-- renamed from appointmentId (can be project or appointment)
  noteToEdit: NoteItem | null;
  onNoteSaved: (note: NoteItem, isUpdate?: boolean) => void;
  type: "appointment" | "project"; // <-- new prop
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  entityId,
  noteToEdit,
  onNoteSaved,
  type,
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNote(noteToEdit?.content || "");
  }, [noteToEdit]);

  const handleSubmit = async () => {
    if (!note.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth";
        return;
      }

      const body = { content: note };
      const base = `${BASE_URL}/professionals/${type}s/notes`;
      const url = noteToEdit
        ? `${base}/update/${noteToEdit.id}`
        : `${base}/create/${entityId}`;
      const method = noteToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
        return;
      }

      if (!res.ok) throw new Error("Failed to save note");

      const responseNote = await res.json();

      const savedNote: NoteItem = {
        id: responseNote.id,
        content: responseNote.content,
        author: responseNote.author ?? "You",
        date: new Date(
          responseNote.updated_at || responseNote.created_at
        ).toLocaleDateString("en-US"),
        created_at: responseNote.created_at,
      };

      onNoteSaved(savedNote, !!noteToEdit);
      toast.success(
        noteToEdit
          ? "Note updated successfully 🎉"
          : "Note added successfully 🎉"
      );
      onClose();
    } catch (err) {
      console.error("Error saving note", err);
      toast.error("Failed to save note ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md md:max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">
          {noteToEdit ? "Edit Note" : "Add Note"}
        </h2>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          rows={4}
          placeholder="Write your note..."
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !note.trim()}
            className={`px-4 py-2 rounded-lg text-white transition ${
              loading || !note.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7E51FF] hover:bg-purple-700"
            }`}
          >
            {loading ? "Submitting..." : noteToEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
