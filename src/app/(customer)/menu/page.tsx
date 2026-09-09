"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number | null;
  is_available: boolean;
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  /*
  ============================================================
  QR TABLE
  ============================================================
  */

  const [tableNumber, setTableNumber] =
    useState<number | null>(null);

  const [tableId, setTableId] =
    useState<number | null>(null);

  const [tableChecking, setTableChecking] =
    useState(true);

  const {
    cart,
    addToCart,
    decreaseQuantity,
    cartCount,
  } = useCart();

  /*
  ============================================================
  DETECT TABLE FROM QR CODE
  ============================================================
  */

  useEffect(() => {
    async function detectTable() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const tableParam = params.get("table");

        /*
        ========================================================
        NO TABLE PARAMETER
        ========================================================
        */

        if (!tableParam) {
          setTableNumber(null);
          setTableId(null);
          return;
        }

        const parsedTableNumber =
          Number(tableParam);

        /*
        ========================================================
        CHECK TABLE NUMBER
        ========================================================
        */

        if (
          !Number.isInteger(parsedTableNumber) ||
          parsedTableNumber <= 0
        ) {
          setError(
            "Invalid table QR code."
          );
          return;
        }

        /*
        ========================================================
        CHECK TABLE IN SUPABASE
        ========================================================

        Branch 2 = Kathmandu

        Only active tables are allowed.
        */

        const {
          data,
          error,
        } = await supabase
          .from("tables")
          .select(
            "id, table_number, status, is_active"
          )
          .eq(
            "table_number",
            parsedTableNumber
          )
          .eq(
            "branch_id",
            2
          )
          .maybeSingle();

        if (error) {
          throw new Error(
            error.message
          );
        }

        /*
        ========================================================
        TABLE NOT FOUND
        ========================================================
        */

        if (!data) {
          setError(
            `Table ${parsedTableNumber} was not found.`
          );
          return;
        }

        /*
        ========================================================
        TABLE NOT ACTIVE
        ========================================================
        */

        if (
          data.status !== "active" ||
          data.is_active !== true
        ) {
          setError(
            `Table ${parsedTableNumber} is currently unavailable. Please choose an active table.`
          );
          return;
        }

        /*
        ========================================================
        TABLE IS VALID AND ACTIVE
        ========================================================
        */

        setTableNumber(
          parsedTableNumber
        );

        setTableId(
          data.id
        );

        /*
        ========================================================
        SAVE QR TABLE INFORMATION
        ========================================================
        */

        localStorage.setItem(
          "qr_table_id",
          String(data.id)
        );

        localStorage.setItem(
          "qr_table_number",
          String(data.table_number)
        );

        localStorage.setItem(
          "qr_order_type",
          "dine_in"
        );

        console.log(
          "QR TABLE DETECTED:",
          {
            tableId: data.id,
            tableNumber:
              data.table_number,
          }
        );

      } catch (err) {
        console.error(
          "QR TABLE ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify table."
        );

      } finally {
        setTableChecking(false);
      }
    }

    detectTable();
  }, []);

  /*
  ============================================================
  FETCH MENU
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    async function fetchMenu() {
      try {
        setError("");

        const [
          categoriesResponse,
          productsResponse,
        ] = await Promise.all([
          /*
          ======================================================
          CATEGORIES
          ======================================================
          */

          supabase
            .from("categories")
            .select(
              "id, name"
            )
            .order(
              "id",
              {
                ascending: true,
              }
            ),

          /*
          ======================================================
          PRODUCTS
          ======================================================
          */

          supabase
            .from("products")
            .select(
              "id, name, description, price, image_url, category_id, is_available"
            )
            .eq(
              "is_available",
              true
            )
            .order(
              "id",
              {
                ascending: true,
              }
            ),
        ]);

        /*
        ========================================================
        CHECK CATEGORY ERROR
        ========================================================
        */

        if (
          categoriesResponse.error
        ) {
          throw new Error(
            categoriesResponse.error.message
          );
        }

        /*
        ========================================================
        CHECK PRODUCT ERROR
        ========================================================
        */

        if (
          productsResponse.error
        ) {
          throw new Error(
            productsResponse.error.message
          );
        }

        if (!mounted) {
          return;
        }

        /*
        ========================================================
        SET CATEGORIES
        ========================================================
        */

        setCategories(
          (categoriesResponse.data as Category[]) ??
            []
        );

        /*
        ========================================================
        SET PRODUCTS
        ========================================================
        */

        setProducts(
          (productsResponse.data as Product[]) ??
            []
        );

        console.log(
          "MENU PRODUCTS:",
          productsResponse.data
        );

      } catch (err) {
        console.error(
          "MENU LOAD ERROR:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load menu."
        );

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    /*
    ============================================================
    INITIAL LOAD
    ============================================================
    */

    fetchMenu();

    /*
    ============================================================
    REALTIME PRODUCT UPDATES
    ============================================================
    */

    const channel =
      supabase
        .channel(
          "customer-menu-products"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
          },
          (payload) => {
            console.log(
              "MENU PRODUCT REALTIME UPDATE:",
              payload
            );

            fetchMenu();
          }
        )
        .subscribe(
          (status) => {
            console.log(
              "MENU PRODUCT REALTIME STATUS:",
              status
            );
          }
        );

    /*
    ============================================================
    CLEANUP
    ============================================================
    */

    return () => {
      mounted = false;

      supabase.removeChannel(
        channel
      );
    };
  }, []);

  /*
  ============================================================
  FILTER PRODUCTS
  ============================================================
  */

  const filteredProducts =
    useMemo(() => {
      return products.filter(
        (product) => {
          const matchesCategory =
            selectedCategory ===
              null ||
            product.category_id ===
              selectedCategory;

          const searchText =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            searchText === "" ||
            product.name
              .toLowerCase()
              .includes(
                searchText
              ) ||
            product.description
              ?.toLowerCase()
              .includes(
                searchText
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      products,
      selectedCategory,
      search,
    ]);

  /*
  ============================================================
  GET CATEGORY NAME
  ============================================================
  */

  function getCategoryName(
    categoryId: number | null
  ) {
    if (
      categoryId === null
    ) {
      return "Menu";
    }

    return (
      categories.find(
        (category) =>
          category.id ===
          categoryId
      )?.name ??
      "Menu"
    );
  }

  /*
  ============================================================
  CATEGORY EMOJI
  ============================================================
  */

  function getCategoryEmoji(
    categoryName: string
  ) {
    const name =
      categoryName.toLowerCase();

    if (
      name.includes("juice")
    ) {
      return "🍹";
    }

    if (
      name.includes("lemon")
    ) {
      return "🍋";
    }

    if (
      name.includes(
        "cold drinks"
      )
    ) {
      return "🥤";
    }

    if (
      name.includes(
        "cold coffee"
      )
    ) {
      return "🧋";
    }

    if (
      name.includes(
        "hot beverages"
      )
    ) {
      return "☕";
    }

    if (
      name.includes(
        "fast bites"
      )
    ) {
      return "🥟";
    }

    if (
      name.includes("noodle")
    ) {
      return "🍜";
    }

    if (
      name.includes("snack")
    ) {
      return "🍟";
    }

    return "🍴";
  }

  /*
  ============================================================
  GET PRODUCT QUANTITY
  ============================================================
  */

  function getProductQuantity(
    productId: number
  ) {
    const item =
      cart.find(
        (item) =>
          item.id ===
          productId
      );

    return (
      item?.quantity ?? 0
    );
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (
    loading ||
    tableChecking
  ) {
    return (
      <main className="min-h-screen bg-black px-4 py-16 sm:px-6">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto h-4 w-36 animate-pulse rounded-full bg-[#222]" />

            <div className="mx-auto mt-5 h-14 w-64 animate-pulse rounded-xl bg-[#151515]" />

            <div className="mx-auto mt-4 h-4 w-96 max-w-full animate-pulse rounded-full bg-[#111]" />

          </div>

          <div className="mt-10 flex justify-center gap-3 overflow-hidden">

            {Array.from({
              length: 7,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-[#111]"
                />
              )
            )}

          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-[#242424] bg-[#111]"
                >

                  <div className="aspect-[4/3] animate-pulse bg-[#171717]" />

                  <div className="space-y-3 p-5">

                    <div className="h-3 w-20 animate-pulse rounded bg-[#222]" />

                    <div className="h-6 w-40 animate-pulse rounded bg-[#222]" />

                    <div className="h-4 w-full animate-pulse rounded bg-[#191919]" />

                    <div className="h-10 w-full animate-pulse rounded bg-[#191919]" />

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </main>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error) {
    return (
      <main className="min-h-screen bg-black px-4 py-16 sm:px-6">

        <div className="mx-auto max-w-xl rounded-3xl border border-[#242424] bg-[#111] p-10 text-center">

          <div className="text-6xl">
            😕
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-white">
            Unable to Load Menu
          </h1>

          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-3 font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,111,0,0.25)]"
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }

  /*
  ============================================================
  MAIN MENU
  ============================================================
  */

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="border-b border-[#171717] bg-black px-4 pb-10 pt-10 sm:px-6 md:pb-12 md:pt-14">

        <div className="mx-auto max-w-7xl text-center">

          <div className="flex items-center justify-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
              Fresh &amp; Delicious
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD600] shadow-[0_0_10px_#FFD600]" />

          </div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">

            Our{" "}

            <span className="text-[#FF6F00]">
              Menu
            </span>

          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#999] sm:text-base">
            Fresh juices, delicious food and refreshing
            favorites made for you at Anil&apos;s Juice Station.
          </p>

        </div>

      </section>

      {/* ================================================= */}
      {/* MENU */}
      {/* ================================================= */}

      <section className="bg-black px-4 py-8 sm:px-6 md:py-10">

        <div className="mx-auto max-w-7xl">

          {/* ================================================= */}
          {/* QR TABLE DETECTED */}
          {/* ================================================= */}

          {tableNumber !== null && (
            <div className="mb-7">

              <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#00FF7F]/30 bg-[#00FF7F]/5 px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00FF7F]/10 text-lg">
                  🪑
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                    Table Detected
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-white">
                    Table{" "}
                    {tableNumber}
                  </p>
                </div>

                <span className="ml-2 rounded-full border border-[#00FF7F]/20 bg-[#00FF7F]/10 px-3 py-1 text-xs font-bold text-[#00FF7F]">
                  Active
                </span>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* ORDER STARTED MESSAGE */}
          {/* ================================================= */}

          {cartCount > 0 && (
            <div className="mb-7 overflow-hidden rounded-3xl border border-[#FF6F00]/30 bg-[#111]">

              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF6F00]/10 text-xl">
                    🛒
                  </div>

                  <div>

                    <h2 className="text-base font-extrabold text-white sm:text-lg">
                      Your order has started 🎉
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#888] sm:text-sm">

                      You already selected{" "}

                      <span className="font-bold text-[#FFD600]">
                        {cartCount}{" "}
                        {cartCount === 1
                          ? "item"
                          : "items"}
                      </span>

                      . Feel free to explore the menu and add more.

                    </p>

                  </div>

                </div>

                <a
                  href="/cart"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-5 py-3 text-sm font-extrabold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,111,0,0.2)]"
                >
                  Review Order
                  <span>→</span>
                </a>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="mx-auto max-w-2xl">

            <div className="relative">

              <Search
                size={19}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#666]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search food or drinks..."
                className="w-full rounded-full border border-[#292929] bg-[#111] py-4 pl-12 pr-5 text-sm text-white outline-none transition placeholder:text-[#666] focus:border-[#FF6F00] focus:shadow-[0_0_20px_rgba(255,111,0,0.08)]"
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* CATEGORIES */}
          {/* ================================================= */}

          <div className="mt-7 overflow-x-auto pb-2">

            <div className="flex min-w-max justify-center gap-2.5">

              <button
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    null
                  )
                }
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                  selectedCategory ===
                  null
                    ? "border-[#FF6F00] bg-[#FF6F00] text-black shadow-[0_0_18px_rgba(255,111,0,0.18)]"
                    : "border-[#292929] bg-[#111] text-[#aaa] hover:border-[#FF6F00] hover:text-white"
                }`}
              >
                All
              </button>

              {categories.map(
                (category) => (
                  <button
                    key={
                      category.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                      selectedCategory ===
                      category.id
                        ? "border-[#FF6F00] bg-[#FF6F00] text-black shadow-[0_0_18px_rgba(255,111,0,0.18)]"
                        : "border-[#292929] bg-[#111] text-[#aaa] hover:border-[#FF6F00] hover:text-white"
                    }`}
                  >
                    {getCategoryEmoji(
                      category.name
                    )}{" "}
                    {category.name}
                  </button>
                )
              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <div className="mt-8 flex items-end justify-between gap-4 border-b border-[#1c1c1c] pb-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
                Freshly Prepared
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">

                {selectedCategory ===
                null
                  ? "Everything"
                  : getCategoryName(
                      selectedCategory
                    )}

              </h2>

            </div>

            <p className="shrink-0 rounded-full border border-[#292929] bg-[#111] px-4 py-2 text-xs font-bold text-[#888]">

              {
                filteredProducts.length
              }{" "}

              {filteredProducts.length ===
              1
                ? "item"
                : "items"}

            </p>

          </div>

          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          {filteredProducts.length >
          0 ? (

            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map(
                (product) => {

                  const quantity =
                    getProductQuantity(
                      product.id
                    );

                  const categoryName =
                    getCategoryName(
                      product.category_id
                    );

                  return (
                    <article
                      key={
                        product.id
                      }
                      className="group overflow-hidden rounded-3xl border border-[#242424] bg-[#111] transition duration-300 hover:-translate-y-1 hover:border-[#FF6F00]/60 hover:shadow-[0_0_30px_rgba(255,111,0,0.08)]"
                    >

                      {/* IMAGE */}

                      <div className="relative h-56 overflow-hidden bg-[#080808]">

                        {product.image_url ? (

                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center text-7xl">

                            {getCategoryEmoji(
                              categoryName
                            )}

                          </div>

                        )}

                        {/* CATEGORY */}

                        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-xs font-bold text-[#FFD600] backdrop-blur-sm">

                          {
                            categoryName
                          }

                        </span>

                      </div>

                      {/* DETAILS */}

                      <div className="p-5">

                        <h3 className="line-clamp-1 text-lg font-extrabold text-white">
                          {
                            product.name
                          }
                        </h3>

                        <p className="mt-2 min-h-10 text-xs leading-5 text-[#888] sm:text-sm">

                          {product.description ||
                            "Freshly prepared with quality ingredients."}

                        </p>

                        <div className="mt-5 flex items-end justify-between gap-3">

                          {/* PRICE */}

                          <div>

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                              Price
                            </p>

                            <p className="mt-0.5 text-xl font-extrabold text-[#FFD600]">

                              Rs.{" "}

                              {Number(
                                product.price
                              ).toLocaleString()}

                            </p>

                          </div>

                          {/* CART */}

                          {quantity ===
                          0 ? (

                            <button
                              type="button"
                              onClick={() =>
                                addToCart({
                                  id: product.id,
                                  name: product.name,
                                  price: Number(
                                    product.price
                                  ),
                                  image_url:
                                    product.image_url,
                                })
                              }
                              className="rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-5 py-2.5 text-sm font-extrabold text-black transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,111,0,0.25)] active:scale-95"
                            >
                              Add +
                            </button>

                          ) : (

                            <div className="flex items-center rounded-full border border-[#00FF7F]/40 bg-[#00FF7F]/10 text-[#00FF7F]">

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    product.id
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold transition hover:bg-[#00FF7F]/10"
                                aria-label={`Decrease ${product.name}`}
                              >
                                −
                              </button>

                              <span className="w-7 text-center text-sm font-extrabold">
                                {
                                  quantity
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: Number(
                                      product.price
                                    ),
                                    image_url:
                                      product.image_url,
                                  })
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold transition hover:bg-[#00FF7F]/10"
                                aria-label={`Increase ${product.name}`}
                              >
                                +
                              </button>

                            </div>

                          )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="mt-10 rounded-3xl border border-[#242424] bg-[#111] px-6 py-16 text-center">

              <div className="text-6xl">
                🔍
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-white">
                No Items Found
              </h3>

              <p className="mt-2 text-sm text-[#777]">
                Try another category or search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(
                    null
                  );

                  setSearch("");
                }}
                className="mt-6 rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5"
              >
                Show All Items
              </button>

            </div>

          )}

        </div>

      </section>

      {/* ================================================= */}
      {/* FLOATING CART */}
      {/* ================================================= */}

      {cartCount > 0 && (

        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">

          <a
            href="/cart"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#333] bg-[#111]/95 px-4 py-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-md transition hover:border-[#FF6F00]"
          >

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] text-black">

                <ShoppingCart
                  size={18}
                />

              </div>

              <div className="min-w-0">

                <p className="text-sm font-extrabold">

                  {cartCount}{" "}

                  {cartCount === 1
                    ? "item"
                    : "items"}{" "}
                  in your order

                </p>

                <p className="text-xs text-[#888]">
                  Ready to review
                </p>

              </div>

            </div>

            <span className="shrink-0 text-sm font-extrabold text-[#FFD600]">

              Continue

              <span className="ml-1">
                →
              </span>

            </span>

          </a>

        </div>

      )}

    </main>
  );
}