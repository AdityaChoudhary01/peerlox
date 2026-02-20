import Loader from "@/components/common/Loader";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader size="lg" text="Syncing Archive..." />
    </div>
  );
}