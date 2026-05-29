import { useState, useRef } from 'react';
import { Upload, Plus } from 'lucide-react';

interface ImportPanelProps {
  onImport: (input: string) => void;
  loading: boolean;
}

export function ImportPanel({ onImport, loading }: ImportPanelProps) {
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onImport(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      onImport(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      style={{
        background: '#16162a',
        border: '1px solid #252542',
        borderRadius: '16px',
      }}
      className="p-5"
    >
      <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <Plus size={16} style={{ color: '#8b5cf6' }} />
        Import Teams
      </h2>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#8b5cf6' : '#252542'}`,
          background: dragging ? 'rgba(139,92,246,0.05)' : 'transparent',
          borderRadius: '10px',
          transition: 'all 0.2s',
        }}
        className="mb-3 p-3 text-center cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={20} style={{ color: '#6b7280' }} className="mx-auto mb-1" />
        <p style={{ color: '#9ca3af' }} className="text-xs">
          Drop CSV or click to upload
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste team numbers&#10;254, 1114, 2056&#10;or one per line"
        rows={5}
        style={{
          background: '#0f0f23',
          border: '1px solid #252542',
          color: '#e2e8f0',
          borderRadius: '10px',
          resize: 'vertical',
          width: '100%',
          outline: 'none',
        }}
        className="px-3 py-2.5 text-sm font-mono mb-3 placeholder-gray-600 focus:border-purple-500"
      />

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        style={{
          background: text.trim() && !loading
            ? 'linear-gradient(135deg, #7c3aed, #3b82f6)'
            : '#252542',
          color: text.trim() && !loading ? '#fff' : '#6b7280',
          borderRadius: '10px',
          border: 'none',
          cursor: text.trim() && !loading ? 'pointer' : 'not-allowed',
          width: '100%',
          transition: 'all 0.2s',
        }}
        className="py-2.5 text-sm font-semibold"
      >
        {loading ? 'Loading…' : 'Fetch EPA & Add Teams'}
      </button>

      <p style={{ color: '#4b5563' }} className="text-xs mt-2 text-center">
        ⌘+Enter to submit
      </p>
    </div>
  );
}
