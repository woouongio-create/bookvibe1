import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sun, 
  Moon, 
  Coffee, 
  Type, 
  LayoutGrid, 
  RotateCcw,
  Sliders,
  Eye,
  CheckCircle2,
  Headphones
} from 'lucide-react';
import { AppearanceSettings, AccentColorOption, AppTheme } from '../types';
import { 
  PRESET_ACCENT_COLORS, 
  getContrastTextColor, 
  hexToRgba, 
  adjustHexBrightness 
} from '../utils/themeUtils';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppearanceSettings;
  onUpdateSettings: (newSettings: Partial<AppearanceSettings>) => void;
  onResetSettings: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [newColorHex, setNewColorHex] = useState('#EC4899');
  const [newColorName, setNewColorName] = useState('');
  const [colorInputError, setColorInputError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'colors' | 'typography' | 'layout'>('colors');

  if (!isOpen) return null;

  const currentTheme = settings.theme;
  const currentAccent = settings.accentColor || '#E11D48';
  const contrastText = getContrastTextColor(currentAccent);

  // Validate HEX
  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    setColorInputError('');

    let clean = newColorHex.trim();
    if (!clean.startsWith('#')) {
      clean = '#' + clean;
    }

    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(clean);
    if (!isValidHex) {
      setColorInputError('Введите корректный HEX-код, например #E11D48');
      return;
    }

    const newOption: AccentColorOption = {
      id: `custom-${Date.now()}`,
      name: newColorName.trim() || `Цвет ${clean.toUpperCase()}`,
      hex: clean.toUpperCase(),
      isCustom: true,
    };

    const updatedCustoms = [...settings.customAccents, newOption];
    onUpdateSettings({
      customAccents: updatedCustoms,
      accentColor: newOption.hex,
    });

    setNewColorName('');
  };

  const handleDeleteCustomColor = (e: React.MouseEvent, id: string, hex: string) => {
    e.stopPropagation();
    const updatedCustoms = settings.customAccents.filter((c) => c.id !== id);
    const newAccent = settings.accentColor === hex 
      ? PRESET_ACCENT_COLORS[0].hex 
      : settings.accentColor;

    onUpdateSettings({
      customAccents: updatedCustoms,
      accentColor: newAccent,
    });
  };

  const modalThemeClasses = {
    beige: {
      overlay: 'bg-black/40 backdrop-blur-sm',
      modal: 'bg-[#FBF9F4] text-[#2B2621] border-[#E2DAC6]',
      sectionBg: 'bg-[#EFEAD9]/60 border-[#DFD8C4]',
      subtext: 'text-[#736859]',
      tabActive: 'bg-[#E8E1CE] text-[#2B2621] font-bold shadow-sm',
      tabInactive: 'text-[#736859] hover:bg-[#EFEAD9]',
      border: 'border-[#E2DAC6]',
      input: 'bg-white border-[#DFD8C4] text-[#2B2621]',
    },
    light: {
      overlay: 'bg-black/30 backdrop-blur-sm',
      modal: 'bg-white text-slate-900 border-slate-200',
      sectionBg: 'bg-slate-50 border-slate-200',
      subtext: 'text-slate-500',
      tabActive: 'bg-slate-100 text-slate-900 font-bold shadow-sm',
      tabInactive: 'text-slate-500 hover:bg-slate-50',
      border: 'border-slate-200',
      input: 'bg-white border-slate-200 text-slate-900',
    },
    dark: {
      overlay: 'bg-black/60 backdrop-blur-sm',
      modal: 'bg-[#181A22] text-slate-100 border-[#2A2D3A]',
      sectionBg: 'bg-[#1F222E] border-[#2A2D3A]',
      subtext: 'text-slate-400',
      tabActive: 'bg-[#292D3D] text-slate-100 font-bold shadow-sm',
      tabInactive: 'text-slate-400 hover:bg-[#232634]',
      border: 'border-[#2A2D3A]',
      input: 'bg-[#14151B] border-[#2A2D3A] text-slate-100',
    },
  }[currentTheme];

  const allColors = [...PRESET_ACCENT_COLORS, ...settings.customAccents];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 ${modalThemeClasses.overlay}`}>
      <div 
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${modalThemeClasses.modal}`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${modalThemeClasses.border}`}>
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-colors"
              style={{ backgroundColor: currentAccent, color: contrastText }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight font-serif flex items-center gap-2">
                <span>Кастомизация оформления</span>
                <span 
                  className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: hexToRgba(currentAccent, 0.18), color: currentAccent }}
                >
                  Акценты и стиль
                </span>
              </h2>
              <p className={`text-xs ${modalThemeClasses.subtext}`}>
                Настройте цветовую палитру, шрифт и атмосферу приложения под свой вкус
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Preview Bar */}
        <div className={`px-6 py-3 border-b ${modalThemeClasses.border} ${modalThemeClasses.sectionBg}`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Живое превью элементов:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sample Button */}
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-transform shadow-sm active:scale-95 flex items-center gap-1.5"
                style={{ backgroundColor: currentAccent, color: contrastText }}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Слушать аудио</span>
              </button>

              {/* Sample Badge */}
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
                style={{ 
                  backgroundColor: hexToRgba(currentAccent, 0.18), 
                  color: currentAccent,
                  borderColor: hexToRgba(currentAccent, 0.3),
                  borderWidth: '1px'
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>Хит BookTok</span>
              </span>

              {/* Sample Accent Dot */}
              <span className="flex items-center gap-1 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: currentAccent }} />
                <span>{currentAccent.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tabs selector */}
        <div className={`px-6 pt-3 flex gap-2 border-b ${modalThemeClasses.border}`}>
          <button
            onClick={() => setActiveSubTab('colors')}
            className={`px-3.5 py-2 text-xs rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'colors' ? modalThemeClasses.tabActive : modalThemeClasses.tabInactive
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Акцентные цвета ({allColors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('typography')}
            className={`px-3.5 py-2 text-xs rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'typography' ? modalThemeClasses.tabActive : modalThemeClasses.tabInactive
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Шрифт и темы</span>
          </button>

          <button
            onClick={() => setActiveSubTab('layout')}
            className={`px-3.5 py-2 text-xs rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'layout' ? modalThemeClasses.tabActive : modalThemeClasses.tabInactive
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Сетка и эффекты</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: COLORS */}
          {activeSubTab === 'colors' && (
            <div className="space-y-6">
              
              {/* Preset colors grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Готовые палитры Яндекс Книг
                  </h3>
                  <span className={`text-[11px] ${modalThemeClasses.subtext}`}>
                    Кликните для применения
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PRESET_ACCENT_COLORS.map((color) => {
                    const isSelected = settings.accentColor.toLowerCase() === color.hex.toLowerCase();
                    const textCol = getContrastTextColor(color.hex);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => onUpdateSettings({ accentColor: color.hex })}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group hover:scale-[1.02] ${
                          isSelected
                            ? 'ring-2 shadow-md'
                            : 'hover:border-black/20 dark:hover:border-white/20'
                        } ${modalThemeClasses.border}`}
                        style={{
                          borderColor: isSelected ? color.hex : undefined,
                          ringColor: isSelected ? color.hex : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: color.hex, color: textCol }}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </span>
                          <span className="text-[10px] opacity-40 font-mono">
                            {color.hex}
                          </span>
                        </div>
                        <span className="text-xs font-semibold truncate leading-tight">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Custom Colors section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                      Мои добавленные цвета
                    </h3>
                    <span 
                      className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                      style={{ backgroundColor: hexToRgba(currentAccent, 0.2), color: currentAccent }}
                    >
                      {settings.customAccents.length}
                    </span>
                  </div>
                </div>

                {settings.customAccents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {settings.customAccents.map((custom) => {
                      const isSelected = settings.accentColor.toLowerCase() === custom.hex.toLowerCase();
                      const textCol = getContrastTextColor(custom.hex);
                      return (
                        <div
                          key={custom.id}
                          onClick={() => onUpdateSettings({ accentColor: custom.hex })}
                          className={`p-2.5 rounded-2xl border cursor-pointer relative group transition-all flex flex-col justify-between ${
                            isSelected ? 'ring-2 shadow-md' : 'hover:border-black/20 dark:hover:border-white/20'
                          } ${modalThemeClasses.border}`}
                          style={{
                            borderColor: isSelected ? custom.hex : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center"
                              style={{ backgroundColor: custom.hex, color: textCol }}
                            >
                              {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                            </span>
                            
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomColor(e, custom.id, custom.hex)}
                              className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-500 transition-opacity"
                              title="Удалить цвет"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-semibold truncate leading-tight">
                            {custom.name}
                          </span>
                          <span className="text-[10px] opacity-50 font-mono mt-0.5">
                            {custom.hex}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-xs italic ${modalThemeClasses.subtext}`}>
                    Вы ещё не создали свои оттенки. Выберите любой цвет ниже и нажмите «Сохранить свой цвет».
                  </p>
                )}
              </div>

              {/* Add Custom Color Tool */}
              <div className={`p-4 rounded-2xl border space-y-3 ${modalThemeClasses.sectionBg} ${modalThemeClasses.border}`}>
                <h4 className="text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>Создать и добавить собственный акцентный цвет</span>
                </h4>

                <form onSubmit={handleAddCustomColor} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Color Swatch & Native Color Picker */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-inner border border-black/10 shrink-0">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
                          className="absolute -inset-4 w-20 h-20 cursor-pointer opacity-0"
                          title="Выбрать цвет палитрой"
                        />
                        <div 
                          className="w-full h-full rounded-xl flex items-center justify-center cursor-pointer pointer-events-none"
                          style={{ backgroundColor: newColorHex }}
                        >
                          <Palette className="w-4 h-4" style={{ color: getContrastTextColor(newColorHex) }} />
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="block font-medium">Палитра</span>
                        <span className="text-[10px] opacity-60">Кликните квадрат</span>
                      </div>
                    </div>

                    {/* Hex Code Input */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold opacity-70 mb-1">
                        HEX-код цвета
                      </label>
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#FF2E93"
                        maxLength={7}
                        className={`w-full px-3 py-1.5 text-xs font-mono rounded-xl border outline-none ${modalThemeClasses.input}`}
                      />
                    </div>

                    {/* Name Input */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold opacity-70 mb-1">
                        Название цвета (опционально)
                      </label>
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Например: Неоновый закат"
                        className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${modalThemeClasses.input}`}
                      />
                    </div>
                  </div>

                  {colorInputError && (
                    <p className="text-xs text-rose-500 font-medium">{colorInputError}</p>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      style={{ 
                        backgroundColor: newColorHex, 
                        color: getContrastTextColor(newColorHex) 
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Сохранить цвет в коллекцию</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & THEMES */}
          {activeSubTab === 'typography' && (
            <div className="space-y-6">
              {/* Base Themes */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Основная подложка (Холст)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Beige */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'beige' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      settings.theme === 'beige'
                        ? 'ring-2 shadow-md bg-[#FBF9F4] text-[#2B2621]'
                        : 'bg-[#F7F4EB] text-[#2B2621]/80 hover:border-black/20'
                    } border-[#E2DAC6]`}
                    style={{ ringColor: settings.theme === 'beige' ? currentAccent : undefined }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-[#8A7A65]" />
                        <span className="text-xs font-bold">Бежевая (Сепия)</span>
                      </div>
                      {settings.theme === 'beige' && <CheckCircle2 className="w-4 h-4" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-[11px] text-[#736859] leading-snug">
                      Атмосферный тёплый пергамент в классическом стиле Яндекс Книг.
                    </p>
                  </button>

                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      settings.theme === 'light'
                        ? 'ring-2 shadow-md bg-white text-slate-900'
                        : 'bg-slate-50 text-slate-700 hover:border-slate-300'
                    } border-slate-200`}
                    style={{ ringColor: settings.theme === 'light' ? currentAccent : undefined }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold">Светлая</span>
                      </div>
                      {settings.theme === 'light' && <CheckCircle2 className="w-4 h-4" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Кристально чистый светлый фон для дневного чтения.
                    </p>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      settings.theme === 'dark'
                        ? 'ring-2 shadow-md bg-[#1C1E26] text-slate-100'
                        : 'bg-[#14151B] text-slate-300 hover:border-slate-700'
                    } border-[#2A2D3A]`}
                    style={{ ringColor: settings.theme === 'dark' ? currentAccent : undefined }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold">Ночная тёмная</span>
                      </div>
                      {settings.theme === 'dark' && <CheckCircle2 className="w-4 h-4" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Глубокий графитовый тон для комфортного чтения в полумраке.
                    </p>
                  </button>
                </div>
              </div>

              {/* Font selection */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Типографика (Шрифт интерфейса и чтения)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Literata Serif */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontFamily: 'literata' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.fontFamily === 'literata' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{ 
                      borderColor: settings.fontFamily === 'literata' ? currentAccent : undefined,
                      ringColor: settings.fontFamily === 'literata' ? currentAccent : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-serif">Literata (Книжный с засечками)</span>
                      {settings.fontFamily === 'literata' && <Check className="w-3.5 h-3.5" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-xs font-serif opacity-75">
                      «Слова сплетаются в мелодию тишины под шорох страниц».
                    </p>
                  </button>

                  {/* Plus Jakarta Sans */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontFamily: 'jakarta' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.fontFamily === 'jakarta' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{ 
                      borderColor: settings.fontFamily === 'jakarta' ? currentAccent : undefined,
                      ringColor: settings.fontFamily === 'jakarta' ? currentAccent : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-sans">Plus Jakarta Sans (Современный)</span>
                      {settings.fontFamily === 'jakarta' && <Check className="w-3.5 h-3.5" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-xs font-sans opacity-75">
                      «Идеальная геометрия и максимальная четкость каждого знака».
                    </p>
                  </button>

                  {/* Georgia */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontFamily: 'georgia' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.fontFamily === 'georgia' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{ 
                      borderColor: settings.fontFamily === 'georgia' ? currentAccent : undefined,
                      ringColor: settings.fontFamily === 'georgia' ? currentAccent : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-serif">Georgia (Элегантный роман)</span>
                      {settings.fontFamily === 'georgia' && <Check className="w-3.5 h-3.5" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-xs opacity-75" style={{ fontFamily: 'Georgia, serif' }}>
                      «Академическая строгость и благородство классических романов».
                    </p>
                  </button>

                  {/* Monospace */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontFamily: 'monospace' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.fontFamily === 'monospace' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{ 
                      borderColor: settings.fontFamily === 'monospace' ? currentAccent : undefined,
                      ringColor: settings.fontFamily === 'monospace' ? currentAccent : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Monospace (Киберпанк/Код)</span>
                      {settings.fontFamily === 'monospace' && <Check className="w-3.5 h-3.5" style={{ color: currentAccent }} />}
                    </div>
                    <p className="text-xs font-mono opacity-75">
                      «Ритмичный пульс символов sci-fi литературы».
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT & EFFECTS */}
          {activeSubTab === 'layout' && (
            <div className="space-y-6">
              
              {/* Density */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Плотность карточек каталога
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ cardDensity: 'comfortable' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.cardDensity === 'comfortable' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{
                      borderColor: settings.cardDensity === 'comfortable' ? currentAccent : undefined,
                      ringColor: settings.cardDensity === 'comfortable' ? currentAccent : undefined,
                    }}
                  >
                    <span className="text-xs font-bold block mb-1">Просторная (По умолчанию)</span>
                    <span className={`text-[11px] block leading-snug ${modalThemeClasses.subtext}`}>
                      Крупные обложки, избранные цитаты, детальные бейджи темпа.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ cardDensity: 'compact' })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      settings.cardDensity === 'compact' ? 'ring-2 shadow-sm' : ''
                    } ${modalThemeClasses.border}`}
                    style={{
                      borderColor: settings.cardDensity === 'compact' ? currentAccent : undefined,
                      ringColor: settings.cardDensity === 'compact' ? currentAccent : undefined,
                    }}
                  >
                    <span className="text-xs font-bold block mb-1">Компактная сетка</span>
                    <span className={`text-[11px] block leading-snug ${modalThemeClasses.subtext}`}>
                      Больше книг на одном экране без лишних отступов.
                    </span>
                  </button>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Скругление углов кнопок и карточек
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sharp', label: 'Строгие (6px)', radius: 'rounded-md' },
                    { id: 'rounded', label: 'Мягкие (16px)', radius: 'rounded-2xl' },
                    { id: 'pill', label: 'Капсулы (28px)', radius: 'rounded-full' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateSettings({ cornerRadius: item.id as any })}
                      className={`p-3 border text-center transition-all ${item.radius} ${
                        settings.cornerRadius === item.id ? 'ring-2 shadow-sm font-bold' : ''
                      } ${modalThemeClasses.border}`}
                      style={{
                        borderColor: settings.cornerRadius === item.id ? currentAccent : undefined,
                        ringColor: settings.cornerRadius === item.id ? currentAccent : undefined,
                      }}
                    >
                      <span className="text-xs block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className={`p-4 rounded-2xl border space-y-3 ${modalThemeClasses.sectionBg} ${modalThemeClasses.border}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Атмосферные эффекты
                </h3>

                {/* Paper texture toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold block">Эффект текстуры книги</span>
                    <span className={`text-[11px] ${modalThemeClasses.subtext}`}>
                      Приятный тактильный микро-паттерн пергамента в режиме чтения
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enablePaperTexture}
                    onChange={(e) => onUpdateSettings({ enablePaperTexture: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                {/* Glow effects toggle */}
                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-black/5 dark:border-white/5">
                  <div>
                    <span className="text-xs font-bold block">Мягкое неоновое свечение плеера</span>
                    <span className={`text-[11px] ${modalThemeClasses.subtext}`}>
                      Свечение активной звуковой волны в цвет выбранного акцента
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableGlowEffects}
                    onChange={(e) => onUpdateSettings({ enableGlowEffects: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>

            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between gap-3 ${modalThemeClasses.border}`}>
          <button
            type="button"
            onClick={onResetSettings}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить настройки</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            style={{ backgroundColor: currentAccent, color: contrastText }}
          >
            Применить и закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
