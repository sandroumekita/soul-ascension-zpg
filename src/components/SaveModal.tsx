import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Save, Copy, Check, Upload, Trash2, X, ShieldCheck } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose }) => {
  const exportSaveData = useGameStore((state) => state.exportSaveData);
  const importSaveData = useGameStore((state) => state.importSaveData);
  const resetProgressSave = useGameStore((state) => state.resetProgressSave);

  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    const code = exportSaveData();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleImport = () => {
    setImportError(null);
    if (!importCode.trim()) {
      setImportError('Por favor, cole um código de save válido.');
      return;
    }

    const success = importSaveData(importCode);
    if (!success) {
      setImportError('Código de save inválido ou corrompido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 text-white relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/80 border border-amber-500/50 rounded-xl text-amber-400">
            <Save size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-300">Save & Backup Local</h3>
            <p className="text-xs text-gray-400">Armazenamento permanente no navegador.</p>
          </div>
        </div>

        {/* Status Box */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
          <div className="text-xs text-slate-300">
            <strong className="text-emerald-400 font-bold block">Auto-Save Ativo (localStorage)</strong>
            Seu progresso é gravado automaticamente a cada segundo no dispositivo.
          </div>
        </div>

        {/* Export Save */}
        <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300">Exportar Save (Backup)</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Copie o código para transferir seu progresso para outro celular ou computador:
          </p>
          <button
            onClick={handleCopy}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Código Copiado com Sucesso!' : 'Copiar Código de Save'}
          </button>
        </div>

        {/* Import Save */}
        <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300">Importar Save</span>
          <input
            type="text"
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Cole o código do save aqui..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          {importError && (
            <p className="text-[10px] text-red-400 font-semibold">{importError}</p>
          )}
          <button
            onClick={handleImport}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.01]"
          >
            <Upload size={14} /> Restaurar Progresso
          </button>
        </div>

        {/* Reset Save */}
        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <span className="text-[10px] text-gray-500">Deseja reiniciar?</span>
          <button
            onClick={resetProgressSave}
            className="text-xs text-red-400/80 hover:text-red-400 transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-red-950/40 cursor-pointer"
          >
            <Trash2 size={13} /> Reiniciar Progresso
          </button>
        </div>
      </div>
    </div>
  );
};
