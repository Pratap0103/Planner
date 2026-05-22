import React from 'react';
import { X } from 'lucide-react';
import { FormActionButtons } from './StandardButtons';

const ModalForm = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  maxWidth = 'max-w-2xl',
  zIndex = 'z-[200]',
  extraFooterAction = null
}) => {
  if (!isOpen) return null;

  return (
    /* Full-screen overlay — covers sidebar + content on all screen sizes */
    <div
      className={`fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center ${zIndex} p-3 sm:p-4 animate-in fade-in duration-150`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200`}
        style={{ maxHeight: 'min(90vh, 760px)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-widest">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white min-h-0 scrollbar-hide">
          <div className="px-4 py-3">
            <form id="modal-form" onSubmit={onSubmit} className="space-y-2 text-left">
              {children}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
          <FormActionButtons
            onCancel={onClose}
            cancelText={cancelText}
            submitText={submitText}
            className="w-full"
            formId="modal-form"
          />
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
