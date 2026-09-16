import { useEffect, useState } from 'react';
import { inputClass } from '../ui/styles';

export default function SearchSelect({ placeholder, onSearch, renderItem, onSelect, minLength = 1 }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (query.length < minLength) {
      setResultados([]);
      return;
    }
    let vigente = true;
    onSearch(query).then((data) => {
      if (vigente) setResultados(data);
    });
    return () => {
      vigente = false;
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        className={inputClass}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
      />
      {abierto && resultados.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg bg-white shadow-lg ring-1 ring-slate-100">
          {resultados.map((item, idx) => (
            <button
              type="button"
              key={item.id ?? idx}
              className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50"
              onMouseDown={() => {
                onSelect(item);
                setQuery('');
                setResultados([]);
                setAbierto(false);
              }}
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
