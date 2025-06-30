import SortAndProductGrid from "@/components/SortAndProductGrid";

export default function USBPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-[320px] flex items-center justify-center"
        style={{
          backgroundImage:
            "url(''), linear-gradient(90deg, #134e5e 0%, #71b280 100%)",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            USB Cables
          </h1>
          <p className="text-lg md:text-xl text-white font-medium drop-shadow-md max-w-2xl mx-auto">
            Reliable USB cables for charging and data transfer. Find the right cable for your device.
          </p>
        </div>
      </div>
      {/* Sort and Product Grid */}
      <SortAndProductGrid category="Cables" subcategory="USB" />
    </div>
  );
}
