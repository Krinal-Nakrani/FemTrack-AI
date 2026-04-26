import { useState } from 'react';
import { X, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LicenseViewerProps {
  url: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseViewer({ url, title = 'Document', isOpen, onClose }: LicenseViewerProps) {
  const [zoom, setZoom] = useState(1);
  const isPDF = url.toLowerCase().includes('.pdf');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden glass-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-lavender/10">
              <h3 className="text-sm font-display font-bold text-white">{title}</h3>
              <div className="flex items-center gap-2">
                {!isPDF && (
                  <>
                    <button
                      onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                      className="p-1.5 rounded-lg bg-plum-700/50 text-lavender/60 hover:text-white transition-colors"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-[10px] text-lavender/50 font-body w-10 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                      className="p-1.5 rounded-lg bg-plum-700/50 text-lavender/60 hover:text-white transition-colors"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-plum-700/50 text-lavender/60 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-plum-700/50 text-lavender/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto max-h-[calc(85vh-56px)] flex items-center justify-center p-4">
              {isPDF ? (
                <iframe
                  src={url}
                  className="w-full h-[70vh] rounded-xl border border-lavender/10"
                  title={title}
                />
              ) : (
                <img
                  src={url}
                  alt={title}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                  className="max-w-full rounded-xl"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LicenseViewer;
