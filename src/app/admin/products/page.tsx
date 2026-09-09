"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

type Product = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type ProductData = {
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type AdminInfo = {
  user_id: string;
  role: string;
  branch_id: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [admin, setAdmin] =
    useState<AdminInfo | null>(null);

  /*
   * ==========================================
   * LOAD ADMIN + PRODUCTS
   * ==========================================
   */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      /*
       * ========================================
       * 1. CHECK CURRENT LOGIN
       * ========================================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log(
        "PRODUCT PAGE USER:",
        user
      );

      if (userError) {
        console.error(
          "PRODUCT PAGE USER ERROR:",
          userError
        );

        throw new Error(
          "Unable to check your login session."
        );
      }

      if (!user) {
        throw new Error(
          "You are not logged in."
        );
      }

      /*
       * ========================================
       * 2. CHECK ADMIN
       * ========================================
       */

      const {
        data: adminData,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select(
          "user_id, role, branch_id"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

      console.log(
        "PRODUCT PAGE ADMIN:",
        adminData
      );

      console.log(
        "PRODUCT PAGE ADMIN ERROR:",
        adminError
      );

      if (adminError) {
        throw new Error(
          "Unable to check admin access."
        );
      }

      if (!adminData) {
        throw new Error(
          "You are not registered as an admin."
        );
      }

      setAdmin(
        adminData as AdminInfo
      );

      /*
       * ========================================
       * 3. CHECK SECURITY FUNCTION
       * ========================================
       */

      const {
        data: isAdmin,
        error: isAdminError,
      } = await supabase.rpc(
        "is_admin_user"
      );

      console.log(
        "is_admin_user() RESULT:",
        isAdmin
      );

      console.log(
        "is_admin_user() ERROR:",
        isAdminError
      );

      /*
       * ========================================
       * 4. LOAD PRODUCTS
       * ========================================
       */

      await loadProducts();

    } catch (error) {
      console.error(
        "PRODUCT PAGE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * LOAD PRODUCTS
   * ==========================================
   */

  async function loadProducts() {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(
        "id, category_id, name, description, price, image_url, is_available"
      )
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        JSON.stringify(
          error,
          null,
          2
        )
      );

      throw new Error(
        error.message ||
          "Unable to load products."
      );
    }

    console.log(
      "PRODUCTS LOADED:",
      data
    );

    setProducts(
      (data as Product[]) ?? []
    );
  }

  /*
   * ==========================================
   * OPEN ADD PRODUCT
   * ==========================================
   */

  function openAddProduct() {
    setEditingProduct(null);
    setError("");
    setModalOpen(true);
  }

  /*
   * ==========================================
   * OPEN EDIT PRODUCT
   * ==========================================
   */

  function openEditProduct(
    product: Product
  ) {
    setEditingProduct(product);
    setError("");
    setModalOpen(true);
  }

  /*
   * ==========================================
   * CLOSE MODAL
   * ==========================================
   */

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setError("");
  }

  /*
   * ==========================================
   * SAVE PRODUCT
   * ADD + EDIT
   * ==========================================
   */

  async function saveProduct(
    productData: ProductData
  ) {
    setError("");

    try {
      /*
       * ========================================
       * EDIT PRODUCT
       * ========================================
       */

      if (editingProduct) {
        const {
          data,
          error,
        } = await supabase.rpc(
          "update_admin_product",
          {
            p_product_id:
              editingProduct.id,

            p_category_id:
              productData.category_id,

            p_name:
              productData.name,

            p_description:
              productData.description,

            p_price:
              productData.price,

            p_image_url:
              productData.image_url,

            p_is_available:
              productData.is_available,
          }
        );

        if (error) {
          console.error(
            "UPDATE PRODUCT ERROR:",
            JSON.stringify(
              error,
              null,
              2
            )
          );

          throw new Error(
            error.message ||
              "Unable to update product."
          );
        }

        if (!data) {
          throw new Error(
            "Product update returned no data."
          );
        }

        const updatedProduct =
          data as Product;

        setProducts(
          (current) =>
            current.map(
              (product) =>
                product.id ===
                updatedProduct.id
                  ? updatedProduct
                  : product
            )
        );

        console.log(
          "PRODUCT UPDATED:",
          updatedProduct
        );
      }

      /*
       * ========================================
       * ADD PRODUCT
       * ========================================
       */

      else {
        const {
          data,
          error,
        } = await supabase
          .from("products")
          .insert(productData)
          .select(
            "id, category_id, name, description, price, image_url, is_available"
          )
          .single();

        if (error) {
          console.error(
            "ADD PRODUCT ERROR:",
            JSON.stringify(
              error,
              null,
              2
            )
          );

          throw new Error(
            error.message ||
              "Unable to add product."
          );
        }

        setProducts(
          (current) => [
            ...current,
            data as Product,
          ]
        );
      }

      /*
       * ========================================
       * CLOSE MODAL
       * ========================================
       */

      closeModal();

    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save product."
      );
    }
  }

  /*
   * ==========================================
   * DELETE PRODUCT
   * ==========================================
   */

  async function handleDeleteProduct(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const {
        error,
      } = await supabase
        .from("products")
        .delete()
        .eq(
          "id",
          product.id
        );

      if (error) {
        console.error(
          "DELETE PRODUCT ERROR:",
          JSON.stringify(
            error,
            null,
            2
          )
        );

        throw new Error(
          error.message ||
            "Unable to delete product."
        );
      }

      setProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              product.id
          )
      );

    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete product."
      );
    }
  }

  /*
   * ==========================================
   * TOGGLE AVAILABILITY
   * ==========================================
   *
   * IMPORTANT:
   * We use the secure Supabase RPC here.
   * We DO NOT directly update products
   * from the browser.
   */

  async function handleToggleAvailability(
    product: Product
  ) {
    setError("");

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "toggle_product_availability",
        {
          p_product_id:
            product.id,
        }
      );

      if (error) {
        console.error(
          "TOGGLE PRODUCT AVAILABILITY ERROR:",
          JSON.stringify(
            error,
            null,
            2
          )
        );

        throw new Error(
          error.message ||
            "Unable to update product availability."
        );
      }

      if (!data) {
        throw new Error(
          "Product update returned no data."
        );
      }

      const updatedProduct =
        data as Product;

      /*
       * Update only the changed product
       * in the current UI.
       */

      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updatedProduct.id
                ? updatedProduct
                : item
          )
      );

      console.log(
        "PRODUCT AVAILABILITY UPDATED:",
        updatedProduct
      );

    } catch (error) {
      console.error(
        "TOGGLE AVAILABILITY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update product availability."
      );
    }
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">

          <div className="text-4xl">
            🥤
          </div>

          <p className="mt-4 font-semibold text-gray-500">
            Loading products...
          </p>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* BACK */}

        <Link
          href="/admin"
          className="text-sm font-bold text-orange-500 transition hover:text-orange-600"
        >
          ← Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mt-5">

          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Products
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
            Menu Products
          </h1>

          <p className="mt-2 text-gray-600">
            Manage the products customers
            see on your menu.
          </p>

          {admin && (
            <p className="mt-2 text-xs font-semibold text-gray-400">
              Admin: {admin.role} · Branch{" "}
              {admin.branch_id}
            </p>
          )}

        </div>

        {/* ERROR */}

        {error && !modalOpen && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* PRODUCT COUNT */}

        <div className="mt-6 flex flex-wrap gap-3">

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm">
            Total: {products.length}
          </div>

          <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            Available:{" "}
            {
              products.filter(
                (product) =>
                  product.is_available
              ).length
            }
          </div>

          <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
            Unavailable:{" "}
            {
              products.filter(
                (product) =>
                  !product.is_available
              ).length
            }
          </div>

        </div>

        {/* PRODUCTS */}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={
                  openEditProduct
                }
                onDelete={
                  handleDeleteProduct
                }
                onToggleAvailability={
                  handleToggleAvailability
                }
              />
            )
          )}

          {/* ADD PRODUCT */}

          <button
            type="button"
            onClick={
              openAddProduct
            }
            className="group flex min-h-[360px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg"
          >

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-4xl font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
              +
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900">
              Add Product
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add a new juice, food item,
              or other menu product.
            </p>

            <p className="mt-5 font-bold text-orange-600">
              Add New Product →
            </p>

          </button>

        </div>

      </div>

      {/* PRODUCT MODAL */}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={closeModal}
          onSave={saveProduct}
        />
      )}

    </main>
  );
}