"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import rawInstitutions from "../../../../data/seed/institutions.json";

export default function VerifyDocRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params?.id as string;

  useEffect(() => {
    // Find college that owns this docId
    let targetCollegeId = "nit-nilgiri";
    for (const col of rawInstitutions as any[]) {
      if (col.documents?.some((d: any) => d.id === docId)) {
        targetCollegeId = col.id;
        break;
      }
    }
    router.replace(`/verify?collegeId=${targetCollegeId}&docId=${docId}`);
  }, [docId, router]);

  return (
    <div className="p-12 text-center text-slate-500 text-xs">
      Loading document verification record for <code className="font-mono">{docId}</code>...
    </div>
  );
}
