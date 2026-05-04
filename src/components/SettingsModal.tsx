
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Palette, User, Save } from 'lucide-react';
import { SettingsService, THEMES, AVATARS, ThemeColor } from '../services/settingsService';
import { cn } from '../lib/utils'; // Assuming this utility exists based on common shadcn patterns or I can implement dynamic class merging

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [currentSettings, setCurrentSettings] = useState(SettingsService.getSettings());

  const handleSave = () => {
    SettingsService.saveSettings(currentSettings);
    onClose();
    window.location.reload(); // Simple way to ensure all components react to theme
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-white"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-math-primary/5">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-math-primary" />
            <h2 className="font-display text-2xl text-gray-800">Cá Nhân Hóa</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Avatar Selection */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-display text-lg text-gray-700">
              <User className="w-5 h-5 text-math-secondary" />
              Chọn Bạn Đồng Hành
            </label>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setCurrentSettings(prev => ({ ...prev, avatar }))}
                  className={cn(
                    "w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border-2",
                    currentSettings.avatar === avatar 
                      ? "bg-math-secondary border-math-secondary shadow-lg scale-110" 
                      : "bg-gray-50 border-gray-100 hover:border-math-secondary/30"
                  )}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-display text-lg text-gray-700">
              <Palette className="w-5 h-5 text-math-primary" />
              Chọn Màu Yêu Thích
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(THEMES) as ThemeColor[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setCurrentSettings(prev => ({ ...prev, theme: themeKey }))}
                  className={cn(
                    "p-4 rounded-3xl border-4 transition-all flex items-center gap-3",
                    currentSettings.theme === themeKey 
                      ? "border-math-primary bg-math-primary/5 shadow-md" 
                      : "border-gray-100 bg-white hover:border-math-primary/20"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: THEMES[themeKey].primary }}
                  >
                    {currentSettings.theme === themeKey && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className="font-bold text-gray-700 capitalize">{themeKey}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-4 bg-math-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <Save className="w-5 h-5" />
            Lưu Thay Đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
}
