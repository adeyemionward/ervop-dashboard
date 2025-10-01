import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  noteToEdit: NoteItem | null;
  onNoteSaved: (note: NoteItem, isUpdate?: boolean) => void;
}

export interface NoteItem {
  id: number;
  content: string;
  author: string;
  date: string;
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  noteToEdit,
  onNoteSaved,
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setNote(noteToEdit.content);
    } else {
      setNote("");
    }
  }, [noteToEdit]);

  const handleSubmit = async () => {
    if (!note.trim()) return;

    setLoading(true);

    try {
      let savedNote: NoteItem;
      let url: string;
      let method: string;
      let body: any = { content: note };

      if (noteToEdit) {
        // 🔥 UPDATE
        url = `http://127.0.0.1:8000/api/v1/professionals/appointments/notes/update/${noteToEdit.id}`;
        method = "PUT";
      } else {
        // 🔥 CREATE
        url = `http://127.0.0.1:8000/api/v1/professionals/appointments/notes/create/${appointmentId}`;
        method = "POST";
      }

      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save note");

      const data = await res.json();

      const responseNote = data;
      savedNote = {
        id: responseNote.id,
        content: responseNote.content,
        author: responseNote.author ?? "You",
        date: new Date(
          responseNote.updated_at || responseNote.created_at
        ).toLocaleDateString("en-US"),
      };

      onNoteSaved(savedNote, !!noteToEdit);

      // ✅ success toast
      toast.success(noteToEdit ? "Note updated successfully 🎉" : "Note added successfully 🎉");

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
          className="w-full border rounded-lg p-2 mb-4"
          rows={4}
          placeholder="Write your note..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !note.trim()} // ✅ disabled if empty or loading
            className={`px-4 py-2 rounded-lg text-white ${
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
