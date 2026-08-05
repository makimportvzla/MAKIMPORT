const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// ── 1. Add X, ChevronLeft, ChevronRight to lucide imports (idempotent) ──
if (!content.includes(', X, ChevronLeft, ChevronRight }')) {
  const oldImport = `import { Gavel, CheckCircle2, Plus, Edit, Trash2, PauseCircle, PlayCircle, Users, LayoutDashboard, ShieldCheck, Phone, Mail, Clock, Search, MapPin, DollarSign, Calendar, AlertCircle, FileText, Send, ShoppingBag, RefreshCw, ExternalLink, Wrench, Building2, Instagram, MessageCircle, Copy } from 'lucide-react';`;
  const newImport = `import { Gavel, CheckCircle2, Plus, Edit, Trash2, PauseCircle, PlayCircle, Users, LayoutDashboard, ShieldCheck, Phone, Mail, Clock, Search, MapPin, DollarSign, Calendar, AlertCircle, FileText, Send, ShoppingBag, RefreshCw, ExternalLink, Wrench, Building2, Instagram, MessageCircle, Copy, X, ChevronLeft, ChevronRight } from 'lucide-react';`;
  if (!content.includes(oldImport)) {
    console.error('ERROR: lucide import line not found — check file manually');
    process.exit(1);
  }
  content = content.replace(oldImport, newImport);
  console.log('✓ Added X, ChevronLeft, ChevronRight to lucide imports');
} else {
  console.log('✓ Icons already imported — skipping');
}

// ── 2. Insert lightbox modal before the final closing </div> (CRLF) ──
const closingTag = '    </div>\r\n  );\r\n};\r\n';
if (!content.includes(closingTag)) {
  console.error('ERROR: Could not find closing tag — check line endings');
  process.exit(1);
}

const lightboxJSX = `      {/* ── Lightbox Modal for Owner Photos ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
              <img src={lightbox.photos[lightbox.idx]} alt={\`Foto \${lightbox.idx + 1} de \${lightbox.photos.length}\`} className="w-full max-h-[70vh] object-contain" />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 text-white text-xs font-bold rounded-full">
                {lightbox.idx + 1} / {lightbox.photos.length}
              </div>
              {lightbox.idx > 0 && (
                <button onClick={() => setLightbox({ ...lightbox, idx: lightbox.idx - 1 })} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {lightbox.idx < lightbox.photos.length - 1 && (
                <button onClick={() => setLightbox({ ...lightbox, idx: lightbox.idx + 1 })} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              <a href={lightbox.photos[lightbox.idx]} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Abrir original
              </a>
              <a href={\`https://wa.me/?text=\${encodeURIComponent(lightbox.photos[lightbox.idx])}\`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                <Phone className="w-3.5 h-3.5" /> Compartir por WhatsApp
              </a>
            </div>
            {lightbox.photos.length > 1 && (
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                {lightbox.photos.map((url, i) => (
                  <button key={i} onClick={() => setLightbox({ ...lightbox, idx: i })} className={\`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all \${i === lightbox.idx ? 'border-orange-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}\`}>
                    <img src={url} alt={\`Miniatura \${i + 1}\`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
`;

// Replace last occurrence only
const lastIdx = content.lastIndexOf(closingTag);
content = content.slice(0, lastIdx) + lightboxJSX;
console.log('✓ Lightbox modal inserted');

fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log('✓ File written — no BOM, UTF-8');
