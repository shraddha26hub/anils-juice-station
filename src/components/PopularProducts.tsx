"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const { cart, addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, description, price, image_url"
          )
          .eq("is_available", true)
          .order("id", {
            ascending: true,
          })
          .limit(6);

        if (error) {
          console.error(
            "=============================="
          );
          console.error("PRODUCT FETCH ERROR");
          console.error(
            "Message:",
            error.message
          );
          console.error(
            "Details:",
            error.details
          );
          console.error(
            "Hint:",
            error.hint
          );
          console.error(
            "Code:",
            error.code
          );
          console.error(
            "Full error:",
            error
          );
          console.error(
            "=============================="
          );

          setProducts([]);
          return;
        }

        console.log(
          "PRODUCTS FETCHED:",
          data
        );

        setProducts(
          (data as Product[]) || []
        );
      } catch (error) {
        console.error(
          "UNEXPECTED PRODUCT FETCH ERROR:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /*
   * When a customer adds a product from Popular Picks,
   * immediately send them to the full Menu page.
   */
  const handleAddToCart = (
    product: Product
  ) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });

    router.push("/menu");
  };

  return (
    <section className="bg-black px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-end justify-between gap-4">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF6F00]">
              Fresh from the station
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Popular Picks
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#BDBDBD] sm:text-base">
              Fresh juices and delicious bites made to brighten your day.
            </p>
          </div>

          {/* DESKTOP VIEW MENU */}

          <Link
            href="/menu"
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-[#FF6F00] px-5 py-3 text-sm font-bold text-[#FF6F00] transition duration-200 hover:bg-[#FF6F00] hover:text-black sm:flex"
          >
            <span>View Menu</span>

            <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>

        {/* ================================================= */}
        {/* MOBILE VIEW MENU */}
        {/* ================================================= */}

        <div className="mt-5 sm:hidden">
          <Link
            href="/menu"
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-[#FF6F00] px-5 py-3 text-sm font-bold text-[#FF6F00] transition duration-200 hover:bg-[#FF6F00] hover:text-black"
          >
            <span>View Menu</span>

            <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-[#242424] bg-[#111111]"
                >
                  <div className="aspect-square animate-pulse bg-[#1b1b1b]" />

                  <div className="space-y-3 p-4">

                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#222]" />

                    <div className="h-4 w-full animate-pulse rounded bg-[#222]" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#222]" />

                    <div className="h-10 w-full animate-pulse rounded bg-[#222]" />

                  </div>
                </div>
              )
            )}

          </div>
        )}

        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        {!loading &&
          products.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">

              {products.map(
                (product, index) => {

                  const quantity =
                    cart.find(
                      (item) =>
                        item.id ===
                        product.id
                    )?.quantity || 0;

                  const accent =
                    index % 3 === 0
                      ? "#FF6F00"
                      : index % 3 === 1
                      ? "#FFD600"
                      : "#00FF7F";

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-3xl border border-[#242424] bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-[#333333] hover:shadow-xl"
                    >

                      {/* ================================================= */}
                      {/* IMAGE */}
                      {/* ================================================= */}

                      <div className="relative aspect-square overflow-hidden bg-[#181818]">

                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm text-[#666]">
                              No image
                            </span>
                          </div>
                        )}

                        <div
                          className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              accent,
                          }}
                        />

                      </div>

                      {/* ================================================= */}
                      {/* CONTENT */}
                      {/* ================================================= */}

                      <div className="p-4 sm:p-5">

                        <h3 className="line-clamp-1 text-base font-extrabold text-white sm:text-lg">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-[#888] sm:text-sm">
                            {
                              product.description
                            }
                          </p>
                        )}

                        {/* PRICE */}

                        <div className="mt-4">

                          <p
                            className="text-base font-black sm:text-lg"
                            style={{
                              color:
                                accent,
                            }}
                          >
                            Rs.{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </p>

                        </div>

                        {/* ================================================= */}
                        {/* ADD BUTTON */}
                        {/* ================================================= */}

                        <div className="mt-4">

                          {quantity === 0 ? (

                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                              className="w-full rounded-2xl border border-[#333333] bg-black px-3 py-3 text-xs font-bold text-white transition duration-200 hover:border-[#FF6F00] hover:bg-[#FF6F00] hover:text-black active:scale-95 sm:text-sm"
                            >
                              Add to Order +
                            </button>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  "/menu"
                                )
                              }
                              className="w-full rounded-2xl border border-[#00FF7F]/40 bg-[#00FF7F]/10 px-3 py-3 text-xs font-bold text-[#00FF7F] transition duration-200 hover:bg-[#00FF7F]/20 sm:text-sm"
                            >
                              Added ✓ — View Full Menu
                            </button>

                          )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* NO PRODUCTS */}
        {/* ================================================= */}

        {!loading &&
          products.length === 0 && (
            <div className="mt-8 rounded-3xl border border-[#242424] bg-[#111111] px-6 py-12 text-center">

              <p className="text-sm text-[#888]">
                No popular products available
                right now.
              </p>

              <Link
                href="/menu"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF6F00] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#FFD600]"
              >
                Explore Full Menu →
              </Link>

            </div>
          )}

      </div>
    </section>
  );
}