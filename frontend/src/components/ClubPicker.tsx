import { useEffect, useRef, useState } from 'react';
import { searchClubs } from '../api/client';
import type { Club } from '../api/types';

/** Zoek-en-selecteer-veld voor de vereniging (issue #11): typ een naam, kies
 * uit de resultaten. Zelfde interactiepatroon als PartnerPicker, maar dan
 * single-select — de gekozen club levert clubId + clubName voor onboarding. */
export function ClubPicker({
  value,
  onChange,
}: {
  value: Club | null;
  onChange: (club: Club | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Club[]>([]);
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
      searchClubs(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function selectClub(club: Club) {
    onChange(club);
    setQuery('');
    setResults([]);
  }

  if (value) {
    return (
      <div className="club-picker-selected">
        <span>{value.name}</span>
        <button type="button" onClick={() => onChange(null)}>
          Wijzigen
        </button>
      </div>
    );
  }

  return (
    <div className="club-picker">
      <input
        type="text"
        placeholder="Typ de naam van je vereniging..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div className="partner-results">Zoeken...</div>}
      {!loading && results.length > 0 && (
        <ul className="partner-results">
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => selectClub(c)}>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
