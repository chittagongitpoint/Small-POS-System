import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-600 font-medium">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
