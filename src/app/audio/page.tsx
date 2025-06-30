import SortAndProductGrid from "@/components/SortAndProductGrid";
import Image from "next/image";

export default function AudioPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative w-full h-[260px] md:h-[320px] flex items-center justify-center bg-neutral-900 overflow-hidden mb-8">
        <Image
          src="/uploads/audio-hero.jpg"
          alt="Audio Hero"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Audio</h1>
          <p className="text-lg md:text-xl text-white font-medium max-w-2xl">
            Discover the best audio accessories: headphones, speakers, and more for your devices.
          </p>
        </div>
      </section>
      <SortAndProductGrid category="Audio" />
    </div>
  );
}
