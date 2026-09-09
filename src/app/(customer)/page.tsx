import Hero from "@/components/Hero";
import PopularProducts from "@/components/PopularProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import Reviews from "@/components/Reviews";
import LocationContact from "@/components/LocationContact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularProducts />
      <WhyChooseUs />
      <Reviews />
      <LocationContact />
    </>
  );
}