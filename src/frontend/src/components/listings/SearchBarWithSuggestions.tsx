import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useNavigate } from "react-router-dom";

interface SearchInsights {
  popular_searches: { term: string; count: number }[];
  suggested_searches: string[];
  popular_categories?: string[];
}

interface QuickResult {
  id: number;
  title: string;
  price: number;
}

export default function SearchBarWithSuggestions() {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<SearchInsights | null>(null);
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // ---- Load insights once ----
  useEffect(() => {
    api.get("/search/insights")
      .then((res) => setInsights(res.data))
      .catch(() => {});
  }, []);

  // ---- Real-time results ----
  useEffect(() => {
    if (query.trim().length === 0) {
      setQuickResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await api.get(`/search/quick?q=${encodeURIComponent(query)}`);
      setQuickResults(res.data);
    }, 200);

    return () => clearTimeout(delay);
  }, [query]);

  // ---- Log search ----
  const logSearch = async (term: string) => {
    try {
      const deviceType = /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop";

      await api.post("/search/log", {
        query_text: term,
        device_type: deviceType,
      });
    } catch {}
  };

  const goToSearchResults = async (term: string) => {
    await logSearch(term);
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative max-w-2xl mx-auto my-6">
      <input
        type="text"
        placeholder="Search listings…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500"
      />

      {showDropdown && (
        <div className="absolute w-full bg-white border shadow-lg rounded-lg mt-1 p-3 z-40 max-h-96 overflow-y-auto">
          
          {/* ---- 1. REAL RESULTS ---- */}
          {quickResults.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Search Results
              </h4>
              {quickResults.map((item) => (
                <Link
                  key={item.id}
                  to={`/listings/${item.id}`}
                  className="block py-1 px-2 hover:bg-gray-100 rounded"
                >
                  {item.title} – ${item.price}
                </Link>
              ))}

              <button
                className="block w-full text-left py-1 px-2 mt-1 text-blue-600 hover:bg-blue-50 rounded"
                onClick={() => goToSearchResults(query)}
              >
                View all results →
              </button>
            </div>
          )}

          {/* ---- 2. Suggested Searches ---- */}
          {insights?.suggested_searches?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Suggested Searches
              </h4>
              {insights.suggested_searches.map((term) => (
                <button
                  key={term}
                  className="block w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={() => goToSearchResults(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* ---- 3. Popular Searches ---- */}
          {insights?.popular_searches?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Popular Searches
              </h4>
              {insights.popular_searches.map((s) => (
                <button
                  key={s.term}
                  className="block w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={() => goToSearchResults(s.term)}
                >
                  {s.term} ({s.count})
                </button>
              ))}
            </div>
          )}

          {/* ---- 4. Popular Categories ---- */}
          {insights?.popular_categories?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Popular Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.popular_categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/search-results?category=${encodeURIComponent(cat)}`}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
