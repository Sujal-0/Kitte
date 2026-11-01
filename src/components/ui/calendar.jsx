import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Helper to normalize date input into a clean Date object at start of day.
 */
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      // Adjust if it's YYYY-MM-DD to avoid timezone shifting
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, day] = val.split('-').map(Number);
        return new Date(y, m - 1, day);
      }
      return d;
    }
  } catch (_) {}
  return null;
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateToISO(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Format a Date to Display format: e.g. "OCT 28, 2027"
 */
export function formatDateToDisplay(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}

/**
 * Neobrutalism Calendar Component
 * Based on neobrutalism.com shadcn registry specification, tailored to Kitte's project aesthetic:
 * - High contrast 2px solid #1A1A1A borders
 * - Sharp offset drop shadows: shadow-[3px_3px_0px_#1A1A1A]
 * - Signature #FFEB3B yellow accent for selected dates
 * - Quick year jump chips for easy long-term time capsule selection
 */
export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className = '',
  mode = 'single'
}) {
  const selectedDate = useMemo(() => parseDate(selected), [selected]);
  const minDateTime = useMemo(() => {
    const d = parseDate(minDate);
    return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : null;
  }, [minDate]);

  // Current viewing month and year
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate || new Date(Date.now() + 86400000);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e?.stopPropagation();
    soundFX.playPop();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e?.stopPropagation();
    soundFX.playPop();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleQuickYearJump = (yearsToAdd, e) => {
    e?.stopPropagation();
    soundFX.playPop();
    const now = new Date();
    const target = new Date(now.getFullYear() + yearsToAdd, now.getMonth(), now.getDate());
    setViewDate(target);
    if (onSelect) {
      onSelect(target, formatDateToISO(target), formatDateToDisplay(target));
    }
  };

  // Generate days in calendar grid: 6 weeks = 42 slots
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Leading padding days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    // Days in current month
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dTime = d.getTime();
      const isPast = minDateTime ? dTime < minDateTime : dTime < todayStart;
      const isSelected = selectedDate ? (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      ) : false;

      const isToday = d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isDisabled: isPast
      });
    }

    // Trailing padding days for next month to complete row/grid
    const remainingSlots = 42 - days.length;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    return days;
  }, [year, month, selectedDate, minDateTime]);

  const handleDayClick = (dayObj, e) => {
    e?.stopPropagation();
    if (dayObj.isDisabled) return;
    soundFX.playPop();
    if (onSelect) {
      onSelect(dayObj.date, formatDateToISO(dayObj.date), formatDateToDisplay(dayObj.date));
    }
  };

  return (
    <div 
      className={`bg-[#FAF7EE] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-3 font-mono text-[#1A1A1A] select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2 mb-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e?.stopPropagation();
              soundFX.playPop();
              setViewDate(new Date(year - 1, month, 1));
            }}
            title="Previous Year"
            className="w-7 h-7 flex items-center justify-center bg-white border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFEB3B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-xs"
          >
            «
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            title="Previous Month"
            className="w-7 h-7 flex items-center justify-center bg-white border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFEB3B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-xs"
          >
            ‹
          </button>
        </div>

        <div className="text-center">
          <div className="font-extrabold text-xs uppercase tracking-wider text-[#1A1A1A]">
            {MONTH_NAMES[month]} {year}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNextMonth}
            title="Next Month"
            className="w-7 h-7 flex items-center justify-center bg-white border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFEB3B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-xs"
          >
            ›
          </button>
          <button
            type="button"
            onClick={(e) => {
              e?.stopPropagation();
              soundFX.playPop();
              setViewDate(new Date(year + 1, month, 1));
            }}
            title="Next Year"
            className="w-7 h-7 flex items-center justify-center bg-white border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFEB3B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-xs"
          >
            »
          </button>
        </div>
      </div>

      {/* Quick Time Capsule Leap Chips */}
      <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-[#1A1A1A]/15 overflow-x-auto">
        <span className="text-[9px] font-bold uppercase text-[#1A1A1A]/60 shrink-0">
          QUICK JUMP:
        </span>
        <div className="flex gap-1">
          {[
            { label: '+1Y', years: 1 },
            { label: '+2Y', years: 2 },
            { label: '+3Y', years: 3 },
            { label: '+5Y', years: 5 },
            { label: '+10Y', years: 10 }
          ].map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={(e) => handleQuickYearJump(chip.years, e)}
              className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFEB3B] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name} className="font-bold text-[10px] text-[#1A1A1A]/70 uppercase py-0.5">
            {name}
          </div>
        ))}
      </div>

      {/* Day Cells (7 x 6 Grid) */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, idx) => {
          if (!dayObj.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-7 w-full flex items-center justify-center text-[10px] text-neutral-300 pointer-events-none"
              >
                {dayObj.dayNumber}
              </div>
            );
          }

          if (dayObj.isDisabled) {
            return (
              <div
                key={idx}
                className="h-7 w-full flex items-center justify-center text-[10px] text-neutral-300 bg-neutral-100/60 cursor-not-allowed"
                title="Date must be in the future"
              >
                {dayObj.dayNumber}
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleDayClick(dayObj, e)}
              className={`h-7 w-full flex items-center justify-center text-[11px] font-bold border transition-all cursor-pointer ${
                dayObj.isSelected
                  ? 'bg-[#FFEB3B] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] font-extrabold scale-105 z-10'
                  : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#FFF9C4] hover:border-[#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A]'
              }`}
            >
              {dayObj.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Footer Readout */}
      {selectedDate && (
        <div className="mt-2.5 pt-2 border-t border-[#1A1A1A]/15 flex items-center justify-between text-[10px]">
          <span className="text-[#1A1A1A]/70 font-bold uppercase">SELECTED:</span>
          <span className="font-extrabold text-[#B91C1C] uppercase bg-[#FFF5F5] px-2 py-0.5 border border-[#B91C1C]">
            {formatDateToDisplay(selectedDate)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NeoDatePicker: Complete field with 100% clickable trigger area and popover Neobrutalism Calendar.
 * Clicking ANYWHERE in the trigger box opens the calendar.
 */
export function NeoDatePicker({
  label = "Custom Unlock Date",
  value = "",
  onChange,
  minDate,
  validate,
  placeholder = "Select date..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useMemo(() => parseDate(value), [value]);
  const displayVal = selectedDate ? formatDateToDisplay(selectedDate) : '';
  const error = validate ? validate(value) : '';

  const handleToggle = (e) => {
    e?.stopPropagation();
    soundFX.playPop();
    setIsOpen(prev => !prev);
  };

  const handleSelectDate = (dateObj, isoStr, displayStr) => {
    if (onChange) {
      onChange(isoStr, displayStr, dateObj);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      {label && (
        <div className="flex justify-between items-end">
          <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
            {label}
          </label>
          {error && (
            <span className="text-red-500 font-mono text-[10px] font-bold tracking-tighter uppercase animate-pulse">
              {error}
            </span>
          )}
        </div>
      )}

      {/* 100% Clickable Area Trigger Box */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle(e); }}
        className={`w-full border-2 ${
          error ? 'border-red-500 shadow-[2px_2px_0px_#ef4444]' : 'border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
        } px-2 py-1.5 font-mono bg-white hover:bg-[#FAF7EE] focus:outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#1A1A1A] transition-all cursor-pointer flex items-center justify-between select-none overflow-hidden`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          <svg className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="1" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="8" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`text-[10px] whitespace-nowrap truncate ${displayVal ? 'text-[#1A1A1A] font-extrabold' : 'text-[#1A1A1A]/50 font-normal'}`}>
            {displayVal || placeholder}
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#1A1A1A]/70 font-bold whitespace-nowrap shrink-0">
          {isOpen ? '▲ CLOSE' : '▼ PICK DATE'}
        </span>
      </div>

      {/* Collapsible Neobrutalism Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="z-50 mt-1.5 w-full"
          >
            <Calendar
              selected={value}
              onSelect={handleSelectDate}
              minDate={minDate}
              className="w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

