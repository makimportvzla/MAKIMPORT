/**
 * patch-owner-card.cjs
 * Surgically replaces the entire "propietarios" sub-tab rendering
 * in AdminDashboard.tsx with a clean, correct version.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// ─── Anchor markers that bracket the section we want to replace ───────────────
const START_MARKER = '/* \u2550\u2550 SUB-TAB 2: PROPIETARIOS / EQUIPOS REGISTRADOS \u2550\u2550 */';
const END_MARKER   = '/* \u2550\u2550 SUB-TAB 3:';

const startIdx = content.indexOf(START_MARKER);
const endIdx   = content.indexOf(END_MARKER);

if (startIdx === -1) { console.error('ERROR: START_MARKER not found'); process.exit(1); }
if (endIdx   === -1) { console.error('ERROR: END_MARKER not found');   process.exit(1); }

// Walk back to the opening { before START_MARKER
const before = content.slice(0, startIdx);
const after  = content.slice(endIdx);

// ─── Clean replacement block ──────────────────────────────────────────────────
const newBlock = `/* \u2550\u2550 SUB-TAB 2: PROPIETARIOS / EQUIPOS REGISTRADOS \u2550\u2550 */}
                {alquileresSubTab === 'propietarios' && (
                  <div>
                    {loadingOwners ? (
                      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /><span>Cargando propietarios...</span>
                      </div>
                    ) : filteredOwners.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Wrench className="w-10 h-10 mx-auto text-slate-700" />
                        <p className="text-slate-500 text-sm font-medium">{alquileresSearch ? 'Sin resultados para esa busqueda.' : 'No hay equipos registrados en la red de propietarios aun.'}</p>
                        <a href="/postular-equipo" target="_blank" className="inline-block mt-2 text-xs text-orange-400 hover:underline font-bold">Ir al formulario de postulacion</a>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {filteredOwners.map((owner) => {
                          const isEditingO = editingOwnerStatus?.id === owner.id;
                          const statusColors: Record<string, string> = {
                            disponible:    'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                            ocupado:       'bg-amber-500/20  border-amber-500/40  text-amber-300',
                            mantenimiento: 'bg-red-500/20    border-red-500/40    text-red-300',
                          };
                          return (
                            <div key={owner.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors group">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                <div className="flex-1 min-w-0 space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-extrabold text-white">{owner.nombre_propietario}</span>
                                      <span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border \${statusColors[owner.estado] || 'bg-slate-700 border-slate-600 text-slate-300'}\`}>
                                        {owner.estado}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <button
                                        onClick={() => setEditingOwnerStatus(isEditingO ? null : { id: owner.id, estado: owner.estado })}
                                        title="Editar estado"
                                        className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 border border-sky-600/30 text-sky-400 transition-all"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ open: true, table: 'owner_machinery', id: owner.id, label: \`\${owner.nombre_propietario} - \${owner.categoria_equipo}\` })}
                                        title="Eliminar registro"
                                        className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline status editor */}
                                  {isEditingO && (
                                    <div className="p-3 bg-slate-950 border border-sky-700/40 rounded-xl flex items-center gap-3 flex-wrap">
                                      <label className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Cambiar estado:</label>
                                      {(['disponible', 'ocupado', 'mantenimiento'] as const).map(s => (
                                        <button key={s}
                                          onClick={() => handleUpdateOwnerStatus(owner.id, s)}
                                          className={\`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border capitalize \${owner.estado === s ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}\`}
                                        >
                                          {s === 'disponible' ? '🟢' : s === 'ocupado' ? '🟡' : '🔴'} {s}
                                        </button>
                                      ))}
                                      <button onClick={() => setEditingOwnerStatus(null)} className="text-[10px] text-slate-500 hover:text-slate-300 ml-auto">✕ Cerrar</button>
                                    </div>
                                  )}

                                  {/* Info grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Datos de Contacto</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Dueno:</span> <strong className="text-white">{owner.nombre_propietario}</strong></div>
                                        <div><span className="text-slate-500">Telefono:</span> <a href={\`tel:\${owner.telefono}\`} className="text-emerald-400 hover:underline">{owner.telefono}</a></div>
                                        <div><span className="text-slate-500">Correo:</span> <strong className="text-slate-200">{owner.email || 'No especificado'}</strong></div>
                                        {owner.instagram && <div><span className="text-slate-500">Instagram:</span> <span className="text-pink-400 font-mono">{owner.instagram}</span></div>}
                                      </div>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Ficha del Equipo</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Categoria:</span> <strong className="text-white">{owner.categoria_equipo}</strong></div>
                                        <div><span className="text-slate-500">Marca/Modelo:</span> <strong className="text-white">{owner.marca} {owner.modelo || ''}</strong></div>
                                        <div><span className="text-slate-500">Ano:</span> <strong className="text-slate-200">{owner.ano || 'No especificado'}</strong></div>
                                        <div><span className="text-slate-500">Horas de Uso:</span> <strong className="text-slate-200">{owner.horas_uso ? \`\${owner.horas_uso.toLocaleString()} Hrs\` : 'No especificadas'}</strong></div>
                                      </div>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Tarifas y Ubicacion</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Ubicacion Base:</span> <strong className="text-white">{owner.ciudad_base}, {owner.estado_base}</strong></div>
                                        <div>
                                          <span className="text-slate-500">Tarifas:</span>{' '}
                                          <strong className="text-amber-300 font-mono">
                                            {owner.tarifa_hora ? \`\$\${owner.tarifa_hora}/hr\` : ''}
                                            {owner.tarifa_hora && owner.tarifa_dia ? ' | ' : ''}
                                            {owner.tarifa_dia ? \`\$\${owner.tarifa_dia}/dia\` : ''}
                                            {!owner.tarifa_hora && !owner.tarifa_dia ? 'A consultar' : ''}
                                          </strong>
                                        </div>
                                        <div><span className="text-slate-500">Operador:</span> <strong className="text-slate-200">{owner.incluye_operador ? 'Si, incluido' : 'Solo maquina'}</strong></div>
                                        <div><span className="text-slate-500">Disponibilidad:</span> <strong className="text-sky-400 capitalize">{owner.modalidad_disponible?.replace('_', ' ')}</strong></div>
                                      </div>
                                    </div>
                                  </div>

                                  {owner.notas && (
                                    <div className="text-[11px] text-slate-400 italic p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                                      {owner.notas}
                                    </div>
                                  )}

                                  {/* Photo gallery */}
                                  {owner.photos && owner.photos.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Fotos del Equipo ({owner.photos.length})
                                      </p>
                                      <div className="flex gap-2 flex-wrap">
                                        {owner.photos.slice(0, 8).map((url, pi) => (
                                          <button
                                            key={pi}
                                            type="button"
                                            onClick={() => setLightbox({ photos: owner.photos!, idx: pi })}
                                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all hover:scale-105 shrink-0"
                                          >
                                            <img src={url} alt={\`Foto \${pi + 1}\`} className="w-full h-full object-cover" />
                                            {pi === 7 && owner.photos!.length > 8 && (
                                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                                +{owner.photos!.length - 8}
                                              </div>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action column */}
                                <div className="flex flex-col gap-2 shrink-0 w-full lg:w-40 justify-end self-end">
                                  <a
                                    href={\`https://wa.me/\${owner.telefono.replace(/[^0-9]/g,'')}?text=\${encodeURIComponent(\`Hola \${owner.nombre_propietario}, soy del equipo de MAKIMPORT. Tenemos un cliente interesado en alquilar tu equipo (\${owner.categoria_equipo} \${owner.marca}). Esta disponible?\`)}\`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all text-center"
                                  >
                                    <Phone className="w-3.5 h-3.5" /><span>Contactar Propietario</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {`;

content = before + newBlock + after;
fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log('Done — owner card block replaced cleanly');
