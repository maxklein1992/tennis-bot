import { useEffect, useRef, useState } from 'react';
import { searchMembers } from '../api/client';
import type { Partner } from '../api/types';

export function PartnerPicker({
  value,
  onChange,
}: {
  value: Partner[];
  onChange: (partners: Partner[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchMembers(query)
        .then((members) =>
          setResults(members.filter((m) => !value.some((v) => v.id === m.id))),
        )
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, value]);

  function addPartner(partner: Partner) {
    onChange([...value, partner]);
    setQuery('');
    setResults([]);
  }

  function removePartner(id: string) {
    onChange(value.filter((p) => p.id !== id));
  }

  return (
    <div className="partner-picker">
      <div className="partner-chips">
        {value.map((p) => (
          <span key={p.id} className="partner-chip">
            {p.name}
            <button type="button" onClick={() => removePartner(p.id)} aria-label={`${p.name} verwijderen`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder="Typ een naam om te zoeken..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div className="partner-results">Zoeken...</div>}
      {!loading && results.length > 0 && (
        <ul className="partner-results">
          {results.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => addPartner(m)}>
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
