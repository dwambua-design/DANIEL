import { Link } from "react-router-dom";
import { resolveImageUrl } from "@/libz/url";

export default function ListingCard({ listing }) {
  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url ||
    null;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="border rounded-lg shadow hover:shadow-lg transition bg-white"
    >
      <img
        src={resolveImageUrl(primaryImage ?? undefined)}
        alt={listing.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="text-gray-500">{listing.location}</p>
        <p className="text-blue-600 font-bold mt-2">
          ${listing.price}
        </p>
      </div>
    </Link>
  );
}
