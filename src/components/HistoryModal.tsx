import React from 'react';
import { X, Calendar, Award, Trash2, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { SavedTestSession } from '../types';
import { formatTime } from '../utils/analytics';

interface HistoryModalProps {
  sessions: SavedTestSession[];
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: SavedTestSession) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  sessions,
  isOpen,
  onClose,
  onLoadSession,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Previous Mock Tests</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {sessions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of past tests */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No saved tests yet. Complete your first mock test to track history!
            </div>
          ) : (
            sessions.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
                      {item.title}
                    </h4>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {item.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(item.report.timeTakenSeconds)}
                    </span>
                    <span>•</span>
                    <span>{item.topic}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-indigo-400">
                      {item.score} / {item.total}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
                      {item.percentage}% ({item.report.grade})
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onLoadSession(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        {sessions.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
