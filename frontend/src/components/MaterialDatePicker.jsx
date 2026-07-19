import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  isBefore,
  isAfter,
  startOfDay,
  getYear,
  setYear,
  setMonth,
  getDaysInMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

var PRIMARY = '#0f2a5c';
var PRIMARY_LIGHT = 'rgba(0,0,0,0.06)';
var PRIMARY_HOVER = 'rgba(0,0,0,0.04)';

function classNames() {
  var classes = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg) continue;
    if (typeof arg === 'string') classes.push(arg);
    else if (Array.isArray(arg)) classes.push(arg.filter(Boolean).join(' '));
    else if (typeof arg === 'object') for (var k in arg) if (arg[k]) classes.push(k);
  }
  return classes.join(' ');
}

function MaterialDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  range,
  label,
  placeholder,
}) {
  var [open, setOpen] = useState(false);
  var [view, setView] = useState('days');
  var [tempDate, setTempDate] = useState(value ? startOfDay(new Date(value)) : startOfDay(new Date()));
  var [hoverDate, setHoverDate] = useState(null);
  var [animating, setAnimating] = useState(false);

  var isRange = range && Array.isArray(value);
  var rangeStart = isRange ? (value[0] ? startOfDay(new Date(value[0])) : null) : null;
  var rangeEnd = isRange ? (value[1] ? startOfDay(new Date(value[1])) : null) : null;

  var today = useMemo(function () { return startOfDay(new Date()); }, []);

  useEffect(function () {
    if (open) {
      requestAnimationFrame(function () { setAnimating(true); });
    } else {
      setAnimating(false);
      setView('days');
    }
  }, [open]);

  function formatDisplay(d) {
    if (!d) return '';
    return format(d, 'dd/MM/yyyy', { locale: es });
  }

  function handleInputClick() {
    setOpen(true);
    if (value) {
      var d = isRange ? (value[0] ? startOfDay(new Date(value[0])) : today) : startOfDay(new Date(value));
      setTempDate(d);
    } else {
      setTempDate(today);
    }
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleOk() {
    if (isRange) {
      if (rangeStart && rangeEnd) {
        onChange([format(rangeStart, 'yyyy-MM-dd'), format(rangeEnd, 'yyyy-MM-dd')]);
      }
    } else {
      onChange(format(tempDate, 'yyyy-MM-dd'));
    }
    setOpen(false);
  }

  // ===== NAVIGATION =====
  function goPrevMonth() { setTempDate(function (d) { return subMonths(d, 1); }); }
  function goNextMonth() { setTempDate(function (d) { return addMonths(d, 1); }); }
  function goPrevYear() { setTempDate(function (d) { return setYear(d, getYear(d) - 1); }); }
  function goNextYear() { setTempDate(function (d) { return setYear(d, getYear(d) + 1); }); }

  function selectYear(year) {
    setTempDate(function (d) { return setYear(d, year); });
    setView('months');
  }

  function selectMonth(monthIdx) {
    setTempDate(function (d) { return setMonth(d, monthIdx); });
    setView('days');
  }

  // ===== DAY CLICK =====
  function handleDayClick(day) {
    if (isRange) {
      var newRange = [rangeStart, rangeEnd];
      if (!rangeStart || (rangeStart && rangeEnd)) {
        newRange = [day, null];
      } else {
        if (isBefore(day, rangeStart)) {
          newRange = [day, rangeStart];
        } else {
          newRange = [rangeStart, day];
        }
      }
      onChange(newRange.map(function (d) { return d ? format(d, 'yyyy-MM-dd') : null; }));
    } else {
      setTempDate(day);
    }
  }

  function isInRange(day) {
    if (!isRange || !rangeStart) return false;
    if (rangeStart && rangeEnd) {
      return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
    }
    if (rangeStart && hoverDate) {
      var s = isBefore(rangeStart, hoverDate) ? rangeStart : hoverDate;
      var e = isBefore(rangeStart, hoverDate) ? hoverDate : rangeStart;
      return isWithinInterval(day, { start: s, end: e });
    }
    return isSameDay(day, rangeStart);
  }

  function isRangeStart(day) { return rangeStart && isSameDay(day, rangeStart); }
  function isRangeEnd(day) { return rangeEnd && isSameDay(day, rangeEnd); }

  // ===== CALENDAR GRID =====
  var calendarDays = useMemo(function () {
    var monthStart = startOfMonth(tempDate);
    var monthEnd = endOfMonth(tempDate);
    var calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    var calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    var days = [];
    var day = calStart;
    while (isBefore(day, calEnd) || isSameDay(day, calEnd)) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [tempDate]);

  var weekDays = useMemo(function () {
    return ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  }, []);

  var displayMonth = format(tempDate, 'MMMM yyyy', { locale: es });
  var displayYear = format(tempDate, 'yyyy');

  // ===== YEARS =====
  var years = useMemo(function () {
    var ys = [];
    for (var y = 2000; y <= 2030; y++) ys.push(y);
    return ys;
  }, []);

  // ===== MONTHS =====
  var months = useMemo(function () {
    return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }, []);

  // ===== KEYBOARD =====
  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' && view === 'days') handleOk();
  }

  // ===== DISABLED =====
  function isDisabled(day) {
    if (minDate && isBefore(day, startOfDay(new Date(minDate)))) return true;
    if (maxDate && isAfter(day, startOfDay(new Date(maxDate)))) return true;
    return false;
  }

  // ===== RENDER =====
  var inputValue = '';
  if (value) {
    if (isRange) {
      inputValue = (value[0] ? format(value[0], 'dd/MM/yyyy') : '') + ' - ' + (value[1] ? format(value[1], 'dd/MM/yyyy') : '');
    } else {
      inputValue = format(value, 'dd/MM/yyyy');
    }
  }

  return (
    <>
      {/* ===== INPUT FIELD ===== */}
      <div className="relative" onKeyDown={handleKeyDown}>
        {label ? <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label> : null}
        <div
          onClick={handleInputClick}
            className={classNames(
              'flex items-center w-full px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer',
              'bg-white text-sm transition-colors',
              'focus-within:ring-2 focus-within:ring-[#0f2a5c]/20 focus-within:border-[#0f2a5c]'
            )}
          role="button"
          tabIndex={0}
          aria-label="Abrir selector de fecha"
          onKeyDown={function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputClick(); } }}
        >
          <span className={classNames('flex-1', inputValue ? 'text-gray-800' : 'text-gray-400 dark:text-gray-500')}>
            {inputValue || placeholder || 'DD/MM/YYYY'}
          </span>
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="#0f2a5c" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={function (e) { if (e.target === e.currentTarget) handleCancel(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Selector de fecha"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <div
            className={classNames(
              'relative z-10 w-[360px] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden',
              'transition-all duration-250 ease-out',
              animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            style={{ borderRadius: '28px' }}
          >
            {/* ===== HEADER ===== */}
            <div className="px-6 pt-5 pb-4 text-white" style={{ backgroundColor: PRIMARY }}>
              {/* Month/Year navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goPrevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Mes anterior"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={function () { setView('months'); }}
                    className="px-2 py-1 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer capitalize"
                    aria-label="Seleccionar mes"
                  >
                    {displayMonth}
                  </button>
                  <button
                    onClick={function () { setView('years'); }}
                    className="px-2 py-1 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Seleccionar año"
                  >
                    {displayYear}
                  </button>
                </div>
                <button
                  onClick={goNextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Mes siguiente"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              {/* Selector label */}
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span className="text-xs font-medium text-white/70 tracking-wide">Seleccionar fecha</span>
              </div>
              {/* Date */}
              <div className="text-2xl font-bold text-white leading-tight">
                {isRange ? (
                  <span>
                    {rangeStart ? format(rangeStart, 'dd MMM', { locale: es }) : '__ ___'} — {rangeEnd ? format(rangeEnd, 'dd MMM', { locale: es }) : '__ ___'}
                  </span>
                ) : (
                  <span>{format(tempDate, 'EEEE, d MMMM', { locale: es })}</span>
                )}
              </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="px-6 py-4 bg-white">

              {/* VIEW: DAYS */}
              {view === 'days' && (
                <div>

                  {/* Weekday header */}
                  <div className="grid grid-cols-7 mb-1">
                    {weekDays.map(function (d, i) {
                      return (
                        <div key={d + i} className="flex items-center justify-center h-10 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {d}
                        </div>
                      );
                    })}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map(function (day, idx) {
                      var outside = !isSameMonth(day, tempDate);
                      var selected = !isRange && !outside && isSameDay(day, tempDate);
                      var todayFlag = isToday(day);
                      var inRange = isRange && isInRange(day);
                      var rangeStartFlag = isRange && isRangeStart(day);
                      var rangeEndFlag = isRange && isRangeEnd(day);
                      var singleSelected = isRange && !outside && !rangeStart && !rangeEnd && isSameDay(day, tempDate);
                      var disabled = isDisabled(day);

                      return (
                        <div key={idx} className="flex items-center justify-center">
                          <button
                            onClick={function () { if (!disabled) handleDayClick(day); }}
                            onMouseEnter={function () { if (isRange && rangeStart && !rangeEnd) setHoverDate(day); }}
                            disabled={disabled}
                            className={classNames(
                              'w-12 h-12 flex items-center justify-center text-sm font-medium rounded-full transition-all cursor-pointer select-none relative',
                              outside && 'text-gray-300 dark:text-gray-600',
                              !outside && !selected && !inRange && !disabled && 'text-black hover:bg-[#0f2a5c]/20',
                              selected && 'text-white',
                              singleSelected && 'text-white',
                              todayFlag && !selected && !singleSelected && 'border-2',
                              inRange && !rangeStartFlag && !rangeEndFlag && 'text-gray-700 dark:text-gray-200',
                              disabled && 'opacity-30 cursor-not-allowed',
                            )}
                            style={{
                              backgroundColor: (selected || singleSelected || rangeStartFlag || rangeEndFlag) ? '#0f2a5c' : (inRange && !rangeStartFlag && !rangeEndFlag) ? PRIMARY_LIGHT : undefined,
                              borderColor: todayFlag && !selected && !singleSelected ? '#0f2a5c' : undefined,
                            }}
                            aria-label={format(day, 'd MMMM yyyy', { locale: es })}
                            aria-selected={selected || singleSelected}
                            aria-disabled={disabled}
                          >
                            {format(day, 'd')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW: MONTHS */}
              {view === 'months' && (
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map(function (m, idx) {
                      var current = getMonth(tempDate) === idx;
                      return (
                        <button
                          key={m}
                          onClick={function () { selectMonth(idx); }}
                          className={classNames(
                            'h-14 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                            current ? 'text-white rounded-xl' : 'text-gray-700 hover:bg-[#0f2a5c]/10',
                          )}
                          style={{ backgroundColor: current ? '#0f2a5c' : undefined }}
                          aria-label={m}
                        >
                          {m.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW: YEARS */}
              {view === 'years' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Seleccionar año</label>
                  <select
                    value={getYear(tempDate)}
                    onChange={function (e) { selectYear(parseInt(e.target.value)); }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] bg-white text-gray-800 cursor-pointer"
                    aria-label="Seleccionar año"
                  >
                    {years.map(function (y) {
                      return (
                        <option key={y} value={y}>{y}</option>
                      );
                    })}
                  </select>
                </div>
              )}
    </div>

    {/* ===== DIVIDER ===== */}
    <div className="border-t border-gray-200 dark:border-gray-700" />

    {/* ===== FOOTER ===== */}
    <div className="flex items-center justify-end gap-2 px-4 py-3 bg-white">
      <button
        onClick={handleCancel}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label="Cancelar"
      >
        Cancel
      </button>
      {!isRange && (
        <button
          onClick={handleOk}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0f2a5c] hover:bg-[#0f2a5c]/90 transition-colors cursor-pointer"
          aria-label="Aceptar"
        >
          OK
        </button>
      )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getMonth(date) {
  return date.getMonth();
}

export default MaterialDatePicker;
