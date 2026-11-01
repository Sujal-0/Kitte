import React from 'react';

/**
 * Format date input to automatically insert slashes: DD/MM/YYYY
 * Gracefully handles deletions/backspaces and pasting.
 */
export function formatDateInput(rawValue, prevValue = '') {
  if (!rawValue) return '';
  const isDeleting = prevValue && rawValue.length < prevValue.length;
  const digits = rawValue.replace(/\D/g, '').slice(0, 8);
  
  if (!digits) return '';

  if (isDeleting) {
    if (prevValue.endsWith('/') && rawValue === prevValue.slice(0, -1)) {
      const trimmed = digits.slice(0, -1);
      if (trimmed.length <= 2) return trimmed;
      if (trimmed.length <= 4) return `${trimmed.slice(0, 2)}/${trimmed.slice(2)}`;
      return `${trimmed.slice(0, 2)}/${trimmed.slice(2, 4)}/${trimmed.slice(4)}`;
    }
  }

  if (digits.length < 2) return digits;
  if (digits.length === 2) return isDeleting ? digits : `${digits}/`;
  if (digits.length < 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length === 4) return isDeleting ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2)}/`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Universal date validation helper for DD/MM/YYYY
 */
export function validateDateField(val) {
  if (!val || !val.trim()) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 0) return '';

  if (digits.length >= 2) {
    const day = parseInt(digits.slice(0, 2), 10);
    if (day < 1 || day > 31) return 'Day 01-31';
  }
  if (digits.length >= 4) {
    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10);
    if (month < 1 || month > 12) return 'Month 01-12';
    if ([4, 6, 9, 11].includes(month) && day > 30) return 'Max 30 days';
    if (month === 2 && day > 29) return 'Max 29 days in Feb';
  }
  if (digits.length >= 8) {
    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10);
    const year = parseInt(digits.slice(4, 8), 10);
    if (year < 1900 || year > 2099) return 'Year 1900-2099';
    if (month === 2 && day === 29) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (!isLeap) return 'Not a leap year';
    }
  }
  if (digits.length > 0 && digits.length < 8) {
    return 'DD/MM/YYYY';
  }
  return '';
}

export function NeoInput({ 
  label, 
  name, 
  value = '', 
  onChange, 
  placeholder, 
  type = "text", 
  maxLength,
  validate,
  isDate = false,
  showCharCount = true,
  helperText,
  min,
  max
}) {
  const error = validate ? validate(value) : '';

  const handleChange = (e) => {
    let newVal = e.target.value;
    if (isDate) {
      newVal = formatDateInput(newVal, value);
    }
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name: name || e.target.name,
          value: newVal
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-end">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-red-500 font-mono text-[10px] font-bold tracking-tighter uppercase animate-pulse">
              {error}
            </span>
          )}
          {showCharCount && !error && !isDate && (
            <span className="font-mono text-[10px] text-[#1A1A1A]/40 font-bold">
              {helperText || (maxLength ? `${(value || '').length}/${maxLength}` : '')}
            </span>
          )}
        </div>
      </div>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        className={`w-full border-2 ${error ? 'border-red-500 shadow-[2px_2px_0px_#ef4444]' : 'border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'} p-2 text-sm font-mono focus:outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#1A1A1A] transition-all bg-white`}
      />
    </div>
  );
}

export function NeoTextarea({
  label,
  name,
  value = '',
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  showCharCount = true,
  validate,
  helperText
}) {
  const error = validate ? validate(value) : '';

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-end">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-red-500 font-mono text-[10px] font-bold tracking-tighter uppercase animate-pulse">
              {error}
            </span>
          )}
          {showCharCount && !error && (
            <span className="font-mono text-[10px] text-[#1A1A1A]/40 font-bold">
              {helperText || (maxLength ? `${(value || '').length}/${maxLength}` : '')}
            </span>
          )}
        </div>
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full border-2 ${
          error ? 'border-red-500 shadow-[2px_2px_0px_#ef4444]' : 'border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
        } p-2 text-xs font-mono focus:outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#1A1A1A] transition-all bg-white resize-none`}
      />
    </div>
  );
}

