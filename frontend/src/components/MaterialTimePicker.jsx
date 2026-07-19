import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

var PRIMARY = '#0f2a5c';

function MaterialTimePicker({
  value,
  onChange,
  label,
  placeholder,
}) {
  var [open, setOpen] = useState(false);
  var [animating, setAnimating] = useState(false);

  useEffect(function () {
    if (open) {
      requestAnimationFrame(function () { setAnimating(true); });
    } else {
      setAnimating(false);
    }
  }, [open]);

  var hours = [];
  for (var h = 7; h <= 22; h++) {
    for (var m = 0; m < 60; m += 30) {
      var hh = String(h).padStart(2, '0');
      var mm = String(m).padStart(2, '0');
      hours.push(hh + ':' + mm);
    }
  }

  function handleInputClick() {
    setOpen(true);
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleSelect(time) {
    onChange(time);
    setOpen(false);
  }

  var inputValue = value || '';

  return (
    <>
      <div className="relative">
        {label ? <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label> : null}
        <div
          onClick={handleInputClick}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer transition-colors hover:border-gray-300"
          role="button"
          tabIndex={0}
          onKeyDown={function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputClick(); } }}
        >
          <span className={'text-sm ' + (inputValue ? 'text-gray-900 font-medium' : 'text-gray-400')}>
            {inputValue || placeholder || 'Selecciona una hora'}
          </span>
          <Clock className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={function (e) { if (e.target === e.currentTarget) handleCancel(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Selector de hora"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className={'relative z-10 w-[360px] bg-white shadow-2xl overflow-hidden transition-all duration-250 ease-out ' + (animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            style={{ borderRadius: '28px' }}
          >
            <div className="px-6 pt-6 pb-2" style={{ backgroundColor: PRIMARY }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-xs font-medium text-white/80 tracking-wide">Seleccionar hora</span>
              </div>
              <div className="text-2xl font-bold text-white leading-tight pb-1">
                <span>{inputValue || 'HH:MM'}</span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="h-64 overflow-y-auto scroll-smooth" role="listbox" aria-label="Horas">
                <div className="grid grid-cols-3 gap-2">
                  {hours.map(function (time) {
                    var selected = value === time;
                    return (
                      <button key={time} onClick={function () { handleSelect(time); }}
                        className={'h-12 rounded-2xl text-sm font-medium transition-colors cursor-pointer ' + (selected ? 'text-white' : 'text-gray-700 hover:bg-gray-100')}
                        style={{ backgroundColor: selected ? PRIMARY : undefined }}
                        role="option" aria-selected={selected}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />
            <div className="flex items-center justify-end gap-2 px-4 py-3">
              <button onClick={handleCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MaterialTimePicker;