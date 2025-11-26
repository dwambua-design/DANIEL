import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useSearchParams } from "react-router-dom";
import { resolveImageUrl } from "@/libz/url";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBarWithSuggestions from "@/components/listings/SearchBarWithSuggestions";
import SidebarCategories from "@/components/listings/SidebarCategories";

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: { id: number; image_url: string; is_primary: boolean }[];
}
export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  // ---- Fetch listings using NEW /search/listings ----
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/search/listings", {
          params: { q, category },
        });
        setListings(res.data.results);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [q, category]);

  if (loading)
    return (
      <>
        <Header />
        <SearchBarWithSuggestions />
        <div className="p-8 text-center">Loading...</div>
        <Footer />
      </>
    );

  // ---- Group listings by category ----
  const grouped = listings.reduce((acc: any, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <div className="flex">
        <SidebarCategories />

        <div className="flex-1 p-8">
          <SearchBarWithSuggestions />

          {Object.keys(grouped).map((cat) => (
            <div key={cat} className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped[cat].map((listing: Listing) => {
                  const primaryImage =
                    listing.images?.find((img) => img.is_primary)?.image_url ||
                    listing.images?.[0]?.image_url ||
                    null;

                  return (
                    <Link
                      to={`/listings/${listing.id}`}
                      key={listing.id}
                      className="border rounded-lg shadow hover:shadow-lg transition bg-white"
                    >
                      <img
                        src={resolveImageUrl(primaryImage ?? undefined)}
                        alt={listing.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />

                      <div className="p-4">
                        <h3 className="text-lg font-semibold">
                          {listing.title}
                        </h3>
                        <p className="text-gray-500">{listing.location}</p>
                        <p className="text-blue-600 font-bold mt-2">
                          ${listing.price}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
