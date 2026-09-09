"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type Category = {
  id: number;
  name: string;
};

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  onSave: (data: {
    category_id: number | null;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
  }) => Promise<void>;
};

export default function ProductModal({
  product,
  onClose,
  onSave,
}: ProductModalProps) {
  const [name, setName] = useState(
    product?.name ?? ""
  );

  const [categoryId, setCategoryId] =
    useState(
      product?.category_id
        ? String(product.category_id)
        : ""
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [description, setDescription] =
    useState(
      product?.description ?? ""
    );

  const [price, setPrice] = useState(
    product?.price
      ? String(product.price)
      : ""
  );

  const [imageUrl, setImageUrl] =
    useState(
      product?.image_url ?? ""
    );

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string>(
      product?.image_url ?? ""
    );

  const [isAvailable, setIsAvailable] =
    useState(
      product?.is_available ?? true
    );

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);

      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .select("id, name")
        .order("id");

      if (error) {
        console.error(
          "LOAD CATEGORIES ERROR:",
          error
        );

        setError(
          "Unable to load categories."
        );

        setCategories([]);
      } else {
        setCategories(data ?? []);
      }

      setLoadingCategories(false);
    }

    loadCategories();
  }, []);

  // =========================================================
  // CLEAN UP PREVIEW URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select an image file."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 5 MB."
      );

      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  async function uploadImage(
    file: File
  ) {
    setUploading(true);

    try {
      const fileExtension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const filePath =
        `products/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("products")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      if (
        !publicUrlData.publicUrl
      ) {
        throw new Error(
          "Unable to get image URL."
        );
      }

      return publicUrlData.publicUrl;

    } finally {
      setUploading(false);
    }
  }

  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  async function handleSave() {
    setError("");

    if (!name.trim()) {
      setError(
        "Product name is required."
      );

      return;
    }

    const numericPrice =
      Number(price);

    if (
      !numericPrice ||
      numericPrice <= 0
    ) {
      setError(
        "Please enter a valid price."
      );

      return;
    }

    const numericCategory =
      categoryId.trim()
        ? Number(categoryId)
        : null;

    if (
      numericCategory !== null &&
      !Number.isInteger(
        numericCategory
      )
    ) {
      setError(
        "Please select a valid category."
      );

      return;
    }

    setSaving(true);

    try {
      let finalImageUrl =
        imageUrl.trim() || null;

      if (imageFile) {
        finalImageUrl =
          await uploadImage(
            imageFile
          );
      }

      await onSave({
        category_id:
          numericCategory,

        name:
          name.trim(),

        description:
          description.trim() ||
          null,

        price:
          numericPrice,

        image_url:
          finalImageUrl,

        is_available:
          isAvailable,
      });

    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 sm:px-6"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 text-gray-900 shadow-2xl sm:p-7"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              {product
                ? "Edit Product"
                : "Add Product"}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
              {product
                ? product.name
                : "New Product"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 transition hover:bg-gray-200 hover:text-red-500 disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="mt-7 space-y-5">

          {/* PRODUCT NAME */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Product Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Mango Juice"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(
                  e.target.value
                )
              }
              disabled={
                loadingCategories
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-500"
            >

              <option
                value=""
                className="text-gray-900"
              >
                {loadingCategories
                  ? "Loading categories..."
                  : "Select a category"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="text-gray-900"
                  >
                    {category.name}
                  </option>
                )
              )}

            </select>

            {!loadingCategories &&
              categories.length === 0 && (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  No categories found. Please add a category first.
                </p>
              )}

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Fresh mango juice..."
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

          </div>

          {/* PRICE */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Price *
            </label>

            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              placeholder="150"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

          </div>

          {/* IMAGE UPLOAD */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Product Image
            </label>

            <div className="mt-2 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-4">

              {/* IMAGE PREVIEW */}

              {imagePreview && (
                <div className="mb-4 overflow-hidden rounded-2xl bg-white">

                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-48 w-full object-cover"
                  />

                </div>
              )}

              {/* UPLOAD BUTTON */}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white px-4 py-6 text-center transition hover:bg-orange-100">

                <span className="text-4xl">
                  📷
                </span>

                <span className="mt-2 font-bold text-gray-800">
                  Choose Product Image
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG, WEBP · Maximum 5 MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>

              {imageFile && (
                <p className="mt-3 truncate text-center text-xs font-semibold text-green-600">
                  ✓ {imageFile.name}
                </p>
              )}

            </div>

          </div>

          {/* AVAILABILITY */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Availability
            </label>

            <select
              value={
                isAvailable
                  ? "available"
                  : "unavailable"
              }
              onChange={(e) =>
                setIsAvailable(
                  e.target.value ===
                    "available"
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >

              <option
                value="available"
                className="text-gray-900"
              >
                Available
              </option>

              <option
                value="unavailable"
                className="text-gray-900"
              >
                Unavailable
              </option>

            </select>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">

          <button
            type="button"
            onClick={onClose}
            disabled={
              saving ||
              uploading
            }
            className="flex-1 rounded-full border border-gray-200 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              uploading ||
              loadingCategories
            }
            className="flex-1 rounded-full bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading Image..."
              : saving
              ? "Saving..."
              : product
              ? "Save Changes"
              : "Add Product"}
          </button>

        </div>

      </div>
    </div>
  );
}