import React, { useState, useEffect } from 'react';
import { publicApi, adminApi } from '../../services/api';
import { PageBlock, PageData } from '../../types/schema';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Edit3,
  Check,
  Layers,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export const VisualPageBuilder: React.FC = () => {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);

  const fetchPage = async () => {
    try {
      const res = await publicApi.getPage('home');
      setPage(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to retrieve page blocks from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!page) return;
    const newBlocks = [...page.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Recalculate orderIndex
    newBlocks.forEach((b, idx) => {
      b.orderIndex = idx;
    });

    setPage({ ...page, blocks: newBlocks });
  };

  const toggleVisibility = (index: number) => {
    if (!page) return;
    const newBlocks = [...page.blocks];
    newBlocks[index].isVisible = !newBlocks[index].isVisible;
    setPage({ ...page, blocks: newBlocks });
  };

  const handleSaveBlocks = async () => {
    if (!page) return;
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.savePageBlocks('home', {
        title: page.title,
        blocks: page.blocks,
        isPublished: page.isPublished,
        metaDescription: page.metaDescription,
      });
      setMessage({
        text: 'Page structure successfully published! Public site is updated in real-time.',
        type: 'success',
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save page modifications.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const saveEditedBlock = (updated: PageBlock) => {
    if (!page) return;
    const newBlocks = page.blocks.map((b) => (b.id === updated.id ? updated : b));
    setPage({ ...page, blocks: newBlocks });
    setEditingBlock(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy border-t-green rounded-full animate-spin mb-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-green" /> Dynamic CMS Page Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Visual Page Builder
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Reorder sections, adjust color schemes, toggle section visibility, or customize headings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2.5 bg-cream hover:bg-cream-light text-navy rounded-xl text-xs font-bold border border-navy/15 transition-all flex items-center gap-1.5"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSaveBlocks}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish to Live'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs ${
            message.type === 'success'
              ? 'bg-green/10 border border-green/30 text-green-dark'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Block Sequence List */}
      <div className="space-y-3.5">
        {page?.blocks.map((block, index) => (
          <div
            key={block.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              block.isVisible
                ? 'bg-white border-gray-200 shadow-xs'
                : 'bg-gray-50 border-dashed border-gray-300 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-navy text-sm">
                    {block.title || 'Untitled Dynamic Block'}
                  </h3>
                  <span className="text-[10px] bg-green/10 text-green font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                    {block.type}
                  </span>
                  {!block.isVisible && (
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {block.subtitle || 'No subtitle configured'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: block.styles?.backgroundColor || '#FFF' }}
                    />
                    <span>Bg: {block.styles?.backgroundColor || '#FFFFFF'}</span>
                  </span>
                  <span>•</span>
                  <span>Text: {block.styles?.textColor || '#173B78'}</span>
                </div>
              </div>
            </div>

            {/* Block Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
                className="p-2 hover:bg-gray-100 rounded-xl text-navy disabled:opacity-20 cursor-pointer"
                title="Move Section Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => moveBlock(index, 'down')}
                disabled={index === (page.blocks.length - 1)}
                className="p-2 hover:bg-gray-100 rounded-xl text-navy disabled:opacity-20 cursor-pointer"
                title="Move Section Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleVisibility(index)}
                className="p-2 hover:bg-gray-100 rounded-xl text-navy cursor-pointer"
                title={block.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {block.isVisible ? (
                  <Eye className="w-4 h-4 text-green" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <button
                onClick={() => setEditingBlock({ ...block })}
                className="px-3.5 py-1.5 bg-cream hover:bg-cream-light text-navy rounded-xl font-bold text-xs flex items-center gap-1.5 border border-navy/15 cursor-pointer ml-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-navy" /> Edit Block
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Block Editor Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-green uppercase tracking-wider">
                  Configuring Component
                </span>
                <h3 className="text-lg font-serif font-black text-navy">{editingBlock.type}</h3>
              </div>
              <button
                onClick={() => setEditingBlock(null)}
                className="p-1.5 text-gray-400 hover:text-navy rounded-lg text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                  Section Main Title
                </label>
                <input
                  type="text"
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                  Section Subtitle / Hindi Tagline
                </label>
                <input
                  type="text"
                  value={editingBlock.subtitle}
                  onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>

              {/* Special content fields if HeroBlock */}
              {editingBlock.type === 'HeroBlock' && (
                <div className="space-y-3 p-3 bg-cream/40 rounded-xl border border-navy/10">
                  <span className="font-bold text-navy uppercase text-[10px]">
                    Hero Content Parameters
                  </span>
                  <div>
                    <label className="block font-medium text-navy mb-1">Subheading Paragraph</label>
                    <textarea
                      rows={2}
                      value={editingBlock.content?.subheading || ''}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          content: { ...editingBlock.content, subheading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-navy mb-1">Primary CTA Button</label>
                      <input
                        type="text"
                        value={editingBlock.content?.ctaPrimaryText || ''}
                        onChange={(e) =>
                          setEditingBlock({
                            ...editingBlock,
                            content: { ...editingBlock.content, ctaPrimaryText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-navy mb-1">Secondary Call Button</label>
                      <input
                        type="text"
                        value={editingBlock.content?.ctaSecondaryText || ''}
                        onChange={(e) =>
                          setEditingBlock({
                            ...editingBlock,
                            content: { ...editingBlock.content, ctaSecondaryText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingBlock.styles?.backgroundColor || '#FFFFFF'}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          styles: { ...editingBlock.styles, backgroundColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingBlock.styles?.backgroundColor || '#FFFFFF'}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          styles: { ...editingBlock.styles, backgroundColor: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingBlock.styles?.textColor || '#173B78'}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          styles: { ...editingBlock.styles, textColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingBlock.styles?.textColor || '#173B78'}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          styles: { ...editingBlock.styles, textColor: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveEditedBlock(editingBlock)}
                className="px-5 py-2 bg-navy text-white font-bold rounded-xl text-xs hover:bg-navy-dark cursor-pointer shadow-sm"
              >
                Apply In-Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
