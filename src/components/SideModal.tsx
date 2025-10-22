"use client";

import { X } from "lucide-react";

type SideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
};

export default function SideModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "sm:w-[420px]",
}: SideModalProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full ${widthClass} bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100vh-100px)]">
          {children}
        </div>

        {footer && (
          <div className="p-5 border-t bg-gray-50 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
