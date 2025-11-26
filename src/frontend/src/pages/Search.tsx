import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "@/libz/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/listings/ListingCard";
import SearchBarWithSuggestions from "@/components/listings/SearchBarWithSuggestions";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: { id: number; image_url: string; is_primary: boolean }[];
}

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const query = params.get("q") || "";
  const category = params.get("category") || "";

  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");

  // --- Fetch search results ---
    useEffect(() => {
        const loadResults = async () => {
            setLoading(true);
            try {
            const res = await api.get("/search/listings", {
                params: { q: query, category, sort },
            });

            // FIX 🔥
            setResults(Array.isArray(res.data.results) ? res.data.results : []);

            } finally {
                setLoading(false);
            }
    };

    loadResults();
    }, [query, category, sort]);


  return (
    <>
      <Header />
        <SearchBarWithSuggestions/>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">
          Search Results
        </h1>

        {(query || category) && (
          <p className="text-gray-500 mb-6">
            Showing results for{" "}
            <span className="font-semibold text-gray-700">
              {query ? `"${query}"` : ""}
              {query && category && " in "}
              {category ? category : ""}
            </span>
          </p>
        )}

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div />
          <select
            className="border px-3 py-2 rounded"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading results…
          </div>
        )}

        {/* No results */}
        {!loading && results.length === 0 && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-3">
              No results found
            </h2>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or browse popular categories.
            </p>

            {/* Link back */}
            <Link
              to="/listings"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Listings
            </Link>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
