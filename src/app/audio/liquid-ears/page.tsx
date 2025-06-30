import SortAndProductGrid from "@/components/SortAndProductGrid";

export default function LiquidEarsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-[320px] flex items-center justify-center"
        style={{
          backgroundImage:
            "url(''), linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Liquid Ears
          </h1>
          <p className="text-lg md:text-xl text-white font-medium drop-shadow-md max-w-2xl mx-auto">
            Discover the full range of Liquid Ears audio products for every lifestyle and need.
          </p>
        </div>
      </div>
      {/* Sort and Product Grid */}
      <SortAndProductGrid category="Audio" subcategory="Liquid Ears" />
    </div>
  );
}
