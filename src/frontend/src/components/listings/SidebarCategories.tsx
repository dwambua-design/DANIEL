import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useSearchParams } from "react-router-dom";

export default function SidebarCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Pull all categories directly from backend route
        const res = await api.get("/search/categories");
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="p-4 border-r w-64">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );

  return (
    <div className="p-4 border-r w-64 bg-white h-full sticky top-0 overflow-y-auto">
      <h2 className="font-semibold mb-3">Categories</h2>

      <div className="space-y-1">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/listings/?category=${encodeURIComponent(cat)}`}
            className={`block p-2 rounded ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}
