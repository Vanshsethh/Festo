import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

/**
 * A searchable select/combobox component.
 * Renders a popover-style dropdown with type-ahead filtering.
 *
 * Props:
 * - items: string[] — list of selectable values
 * - value: string — currently selected value
 * - onChange: (value: string) => void
 * - placeholder: string
 * - searchPlaceholder: string
 * - icon: ReactNode (optional leading icon)
 * - className: string (optional wrapper class)
 */
export const SearchableSelect = ({
  items = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  icon,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query
    ? items.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : items;

  const handleSelect = useCallback(
    (item) => {
      onChange(item === value ? '' : item);
      setOpen(false);
      setQuery('');
    },
    [onChange, value]
  );

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter' && open && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(filtered[activeIndex]);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex items-center gap-2 w-full px-3 py-2.5 rounded-xl
          border transition-all duration-200 text-sm
          ${open
            ? 'border-purple-500/60 ring-2 ring-purple-500/20 bg-slate-900/90'
            : 'border-violet-500/30 bg-slate-900/60 hover:border-violet-500/50 hover:bg-slate-900/80'
          }
        `}
      >
        {icon && <span className="shrink-0 text-purple-400">{icon}</span>}
        <span className={`flex-1 text-left truncate ${value ? 'text-white' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        {value ? (
          <X
            className="w-3.5 h-3.5 text-slate-400 hover:text-white shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-purple-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[240px] max-h-[300px] rounded-xl border border-violet-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search input */}
          <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl p-2 border-b border-violet-500/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900/80 border border-violet-500/20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/40"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-[230px] p-1" role="listbox">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No results found</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseMove={() => setActiveIndex(filtered.indexOf(item))}
                  role="option"
                  aria-selected={item === value}
                  className={`
                    flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                    ${item === value || filtered.indexOf(item) === activeIndex
                      ? 'bg-purple-500/20 text-purple-200 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }
                  `}
                >
                  <span className="flex-1 truncate">{item}</span>
                  {item === value && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
