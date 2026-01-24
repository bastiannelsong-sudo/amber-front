import { FC, memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';

interface Props {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

// Helper functions outside component to prevent recreation
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(dateStr + 'T12:00:00');

  if (targetDate.toDateString() === today.toDateString()) {
    return 'Hoy';
  }
  if (targetDate.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  }

  return date.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const getFullDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Convert YYYY-MM-DD to DD-MM-YYYY for display
const toDisplayFormat = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

// Parse DD-MM-YYYY to YYYY-MM-DD
const parseInputDate = (input: string): string | null => {
  // Remove any separators and get numbers
  const cleaned = input.replace(/[^0-9]/g, '');

  // Try to parse different formats
  let day: string, month: string, year: string;

  if (cleaned.length === 8) {
    // DDMMYYYY
    day = cleaned.substring(0, 2);
    month = cleaned.substring(2, 4);
    year = cleaned.substring(4, 8);
  } else if (input.includes('-') || input.includes('/')) {
    // DD-MM-YYYY or DD/MM/YYYY
    const parts = input.split(/[-/]/);
    if (parts.length === 3) {
      day = parts[0].padStart(2, '0');
      month = parts[1].padStart(2, '0');
      year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    } else {
      return null;
    }
  } else {
    return null;
  }

  // Validate
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2020 || yearNum > 2030) {
    return null;
  }

  const result = `${year}-${month}-${day}`;

  // Validate it's a real date
  const testDate = new Date(result + 'T12:00:00');
  if (isNaN(testDate.getTime())) {
    return null;
  }

  return result;
};

const DateSelector: FC<Props> = ({ selectedDate, onDateChange }) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === today;
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when selectedDate changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(toDisplayFormat(selectedDate));
    }
  }, [selectedDate, isEditing]);

  const handlePrevDay = useCallback(() => {
    onDateChange(addDays(selectedDate, -1));
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const nextDay = addDays(selectedDate, 1);
    if (nextDay <= today) {
      onDateChange(nextDay);
    }
  }, [selectedDate, today, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange(today);
  }, [today, onDateChange]);

  const handleNativeDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      if (newDate && newDate <= today) {
        onDateChange(newDate);
      }
    },
    [today, onDateChange]
  );

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setInputValue(toDisplayFormat(selectedDate));
    setTimeout(() => inputRef.current?.select(), 0);
  }, [selectedDate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInputDate(inputValue);
      if (parsed && parsed <= today) {
        onDateChange(parsed);
        setIsEditing(false);
      } else {
        // Invalid date, reset to current
        setInputValue(toDisplayFormat(selectedDate));
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(toDisplayFormat(selectedDate));
    }
  }, [inputValue, today, onDateChange, selectedDate]);

  const handleInputBlur = useCallback(() => {
    const parsed = parseInputDate(inputValue);
    if (parsed && parsed <= today) {
      onDateChange(parsed);
    } else {
      setInputValue(toDisplayFormat(selectedDate));
    }
    setIsEditing(false);
  }, [inputValue, today, onDateChange, selectedDate]);

  const displayDate = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);
  const fullDate = useMemo(() => getFullDate(selectedDate), [selectedDate]);

  return (
    <div
      className="glass-card"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
      }}
    >
      {/* Previous Day Button */}
      <button
        onClick={handlePrevDay}
        aria-label="Día anterior"
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#a1a1aa',
          cursor: 'pointer',
          transition: 'all 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#27272a';
          e.currentTarget.style.color = '#fafafa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }}
      >
        <HiChevronLeft style={{ width: '22px', height: '22px' }} />
      </button>

      {/* Date Display / Input */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(39, 39, 42, 0.5)',
          border: isEditing ? '1px solid #f59e0b' : '1px solid rgba(63, 63, 70, 0.5)',
          minWidth: '240px',
          transition: 'border-color 150ms',
        }}
      >
        {/* Calendar Icon - Click to open native picker */}
        <div
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <HiCalendar style={{ width: '18px', height: '18px', color: '#ffffff' }} />
          {/* Hidden native date input on calendar icon */}
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={handleNativeDateChange}
            aria-label="Seleccionar fecha con calendario"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Date Text / Input */}
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              placeholder="DD-MM-YYYY"
              autoFocus
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#fafafa',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                padding: 0,
                margin: 0,
              }}
            />
          ) : (
            <div
              onClick={handleStartEditing}
              style={{ cursor: 'text' }}
            >
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#fafafa',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {displayDate}
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#71717a',
                  margin: 0,
                }}
              >
                {toDisplayFormat(selectedDate)}
              </p>
            </div>
          )}
        </div>

        {/* Edit hint */}
        {!isEditing && (
          <span
            onClick={handleStartEditing}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: '#52525b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(39, 39, 42, 0.5)',
            }}
          >
            Escribir
          </span>
        )}
      </div>

      {/* Next Day Button */}
      <button
        onClick={handleNextDay}
        disabled={isToday}
        aria-label="Día siguiente"
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isToday ? '#3f3f46' : '#a1a1aa',
          cursor: isToday ? 'not-allowed' : 'pointer',
          transition: 'all 150ms',
          opacity: isToday ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isToday) {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#fafafa';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = isToday ? '#3f3f46' : '#a1a1aa';
        }}
      >
        <HiChevronRight style={{ width: '22px', height: '22px' }} />
      </button>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '28px',
          backgroundColor: '#3f3f46',
          margin: '0 4px',
        }}
      />

      {/* Today Button */}
      <button
        onClick={handleToday}
        disabled={isToday}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '12px',
          border: 'none',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: isToday ? 'not-allowed' : 'pointer',
          transition: 'all 150ms',
          backgroundColor: isToday ? 'transparent' : 'rgba(245, 158, 11, 0.1)',
          color: isToday ? '#3f3f46' : '#f59e0b',
          opacity: isToday ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isToday) {
            e.currentTarget.style.backgroundColor = '#f59e0b';
            e.currentTarget.style.color = '#0a0a0b';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isToday ? 'transparent' : 'rgba(245, 158, 11, 0.1)';
          e.currentTarget.style.color = isToday ? '#3f3f46' : '#f59e0b';
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
        Hoy
      </button>
    </div>
  );
};

export default memo(DateSelector);
