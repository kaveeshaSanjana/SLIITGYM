import React, { useState } from 'react';
import { Plus, Dumbbell, Trash2, Printer, X, Sparkles, Loader2, CheckCircle2, AlertCircle, Edit, AlertTriangle, CheckSquare, Eye } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { Equipment } from './types';
import { apiEquipment } from './api';

export const EquipmentManagement = ({ equipment, refreshData }: { equipment: Equipment[], refreshData: () => Promise<void> }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingEq, setViewingEq] = useState<Equipment | null>(null);
  
  // Selection state for batch printing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    type: 'Cardio',
    status: 'ACTIVE',
    location: ''
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', type: 'Cardio', status: 'ACTIVE', location: '' });
  };

  const handleEditClick = (eq: Equipment) => {
    setFormData({ name: eq.name, type: eq.type, status: eq.status, location: eq.location });
    setEditingId(eq.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await apiEquipment.update(editingId, formData as Equipment);
        showToast("Equipment updated successfully!", "success");
      } else {
        await apiEquipment.create(formData as Equipment);
        showToast("Equipment registered successfully!", "success");
      }
      await refreshData();
      resetForm();
    } catch (error: any) {
      showToast(error.message || "Failed to save equipment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiEquipment.delete(deleteConfirmId);
      await refreshData();
      showToast("Equipment deleted", "success");
      
      // Remove from selection if deleted
      if (selectedIds.has(deleteConfirmId)) {
        const newSet = new Set(selectedIds);
        newSet.delete(deleteConfirmId);
        setSelectedIds(newSet);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to delete", "error");
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmId(null);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handlePrint = (eq: Equipment) => {
    printTags([eq]);
  };

  const handleBatchPrint = () => {
    if (selectedIds.size === 0) return;
    const selectedEq = equipment.filter(eq => selectedIds.has(eq.id));
    printTags(selectedEq);
  };

  const printTags = (items: Equipment[]) => {
    const printWindow = window.open('', '', 'width=800,height=800');
    if (!printWindow) {
      showToast("Pop-ups are blocked. Please allow them to print.", "error");
      return;
    }
    
    // Generate HTML for each tag
    const tagsHtml = items.map(eq => {
      const qrSvg = document.getElementById(`qr-${eq.id}`)?.outerHTML || '';
      return `
        <div class="card">
          <div class="title">IRONPULSE GYM</div>
          <div class="subtitle">Smart Equipment Tag</div>
          <div class="qr-container">${qrSvg}</div>
          <div class="id">${eq.id}</div>
          <div class="type">${eq.name}</div>
          <div class="type-small">${eq.type}</div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Smart Tags</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              background: #fff; 
              margin: 0; 
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            .grid {
              display: grid;
              /* A4 is approx 210mm wide. 4 columns fits well with gap */
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }
            .card { 
              border: 2px dashed #ccc; 
              padding: 15px; 
              text-align: center; 
              border-radius: 12px;
              page-break-inside: avoid;
              background: #fafafa;
            }
            .title { font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #111; }
            .subtitle { font-size: 8px; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .qr-container svg { width: 100%; max-width: 120px; height: auto; }
            .id { font-size: 9px; font-family: monospace; margin-top: 12px; background: #eee; padding: 6px; border-radius: 4px; word-break: break-all; }
            .type { font-weight: bold; margin-top: 8px; font-size: 12px; color: #111;}
            .type-small { font-size: 10px; color: #666; margin-top: 2px; }
            
            /* Print Specific Styles */
            @media print {
              body { background: transparent; }
              .card { border: 1px dashed #999; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${tagsHtml}
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Clear selection after printing
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border
              ${toast.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
              <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Equipment?</h3>
              <p className="text-white/60 mb-8">This action cannot be undone. Are you sure you want to remove this machine from the system?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View QR Code Modal */}
      <AnimatePresence>
        {viewingEq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewingEq(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setViewingEq(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
              
              <h3 className="text-2xl font-bold text-white mb-2">{viewingEq.name}</h3>
              <p className="text-white/50 text-sm mb-8">{viewingEq.type} • {viewingEq.location}</p>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-2xl inline-block">
                <QRCode value={viewingEq.id} size={200} level="H" />
              </div>
              
              <p className="text-white/40 text-xs font-mono mb-6 bg-black/40 py-3 rounded-xl select-all border border-white/5">
                ID: {viewingEq.id}
              </p>
              
              <button 
                onClick={() => handlePrint(viewingEq)}
                className="w-full py-4 rounded-2xl font-bold btn-primary flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
              >
                <Printer className="w-5 h-5" />
                Print Tag
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Dumbbell className="text-primary-400 w-8 h-8" />
            Equipment Fleet
          </h2>
          <p className="text-white/60 text-sm max-w-lg">Manage your gym machines, print QR codes for member scanning, and track maintenance statuses.</p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {/* Batch Print Actions */}
          {isSelectMode ? (
            <>
               <button
                onClick={() => { setIsSelectMode(false); setSelectedIds(new Set()); }}
                className="px-5 py-3 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancel Selection
              </button>
              <button
                onClick={handleBatchPrint}
                disabled={selectedIds.size === 0}
                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-5 py-3 flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" />
                Print Selected ({selectedIds.size})
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectMode(true)}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-5 py-3 flex items-center gap-2 font-bold transition-all"
            >
              <CheckSquare className="w-5 h-5 text-primary-400" />
              Batch Print Tags
            </button>
          )}

          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="btn-primary rounded-xl px-5 py-3 flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Add New Machine
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative mb-8">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={resetForm} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-400" />
                {editingId ? 'Edit Equipment' : 'Register Equipment'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Machine Name</label>
                  <input required type="text" placeholder="e.g. Pro-Form Treadmill X" className="input-field w-full bg-black/20 focus:bg-black/40 border-white/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Category</label>
                  <select className="input-field w-full bg-black/20 focus:bg-black/40 border-white/10" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Weights">Free Weights</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Operational Status</label>
                  <select className="input-field w-full bg-black/20 focus:bg-black/40 border-white/10" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'MAINTENANCE'})}>
                    <option value="ACTIVE">Active & Online</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Floor Location</label>
                  <input required type="text" placeholder="e.g. Cardio Zone A" className="input-field w-full bg-black/20 focus:bg-black/40 border-white/10" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={resetForm} disabled={isSubmitting} className="px-6 py-3 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary rounded-xl px-8 py-3 font-bold flex items-center gap-2 disabled:opacity-70">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Saving...' : editingId ? 'Update Machine' : 'Register Machine'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {equipment.map((eq, i) => {
            const isSelected = selectedIds.has(eq.id);
            return (
              <motion.div 
                key={eq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => isSelectMode ? toggleSelection(eq.id) : null}
                className={`glass rounded-3xl relative group overflow-hidden transition-all flex flex-col h-full shadow-xl
                  ${isSelectMode ? 'cursor-pointer' : ''}
                  ${isSelected ? 'border-2 border-primary-500 scale-[1.02] bg-primary-500/5' : 'border border-white/5 hover:border-primary-500/30'}
                `}
              >
                
                {/* Selection Checkbox Overlay */}
                {isSelectMode && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-primary-500 text-white' : 'bg-black/50 border border-white/20 text-transparent'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-end items-start mb-2 absolute top-3 right-3">
                    <div className={`flex gap-1 transition-opacity ${isSelectMode ? 'opacity-0' : 'opacity-100'}`}>
                      <button onClick={(e) => { e.stopPropagation(); setViewingEq(eq); }} className="p-1.5 text-white/40 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors" title="View QR Code">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEditClick(eq); }} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(eq.id); }} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border transition-colors
                      ${isSelected ? 'bg-primary-500/40 border-primary-500/50 text-white' : 'bg-gradient-to-br from-primary-500/20 to-indigo-500/20 text-primary-400 border-white/5'}`}>
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{eq.name}</h3>
                      <p className="text-white/40 text-[10px] font-mono select-all truncate mt-0.5">ID: {eq.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-white/60 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5">{eq.type}</span>
                    <span className="text-white/60 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5">{eq.location}</span>
                  </div>
                  
                  <div className="mt-auto flex items-center">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 border
                      ${eq.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${eq.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {eq.status}
                    </div>
                  </div>
                </div>
                
                <div className={`bg-black/20 p-3 flex flex-col items-center border-t border-white/5 relative overflow-hidden transition-colors
                  ${isSelectMode ? '' : 'group-hover:bg-primary-500/5'}`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                  
                  {/* Visually hidden QR Code, kept in DOM for printing logic */}
                  <div className="hidden" id={`qr-${eq.id}`}>
                    <QRCode value={eq.id} size={90} level="H" />
                  </div>
                  
                  {!isSelectMode ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrint(eq); }}
                      className="w-full py-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Tag
                    </button>
                  ) : (
                    <div className="py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest text-center w-full">
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
