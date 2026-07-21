import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifierOverviewPage() {
  const router = useRouter();

  // Redirect to applications queue since that's their primary workspace
  useEffect(() => {
    router.replace("/verifier/applications");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
      Loading verifier dashboard...
    </div>
  );
}
