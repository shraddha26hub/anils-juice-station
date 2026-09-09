"use client";

type Product = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
}: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* IMAGE */}

      <div className="relative h-52 w-full overflow-hidden bg-orange-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🍹
          </div>
        )}

        {/* AVAILABILITY BADGE */}

        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm ${
              product.is_available
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {product.is_available
              ? "Available"
              : "Unavailable"}
          </span>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-6">
        <h2 className="text-xl font-extrabold text-gray-900">
          {product.name}
        </h2>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
            {product.description}
          </p>
        )}

        <p className="mt-4 text-xl font-extrabold text-orange-600">
          Rs. {product.price}
        </p>

        {/* AVAILABILITY TOGGLE */}

        <button
          type="button"
          onClick={() =>
            onToggleAvailability(product)
          }
          className={`mt-5 w-full rounded-xl py-3 font-bold transition ${
            product.is_available
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          {product.is_available
            ? "🟢 Mark Unavailable"
            : "🔴 Mark Available"}
        </button>

        {/* ACTION BUTTONS */}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="rounded-xl border border-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="rounded-xl border border-red-200 py-3 font-bold text-red-600 transition hover:bg-red-50"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}