"use client";
import React, { useEffect, useState } from "react";
import RedirectLinkForm from "../../components/RedirectLinkForm";
import { Card } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";

export default function EditRedirectLinkPage() {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/redirect-links/${id}`);
      if (res.ok) {
        const apiData = await res.json();
        const data = apiData.data || apiData;
        setInitialData({
          type: data.type ?? "",
          targetId: data.targetId ?? "",
          slug: data.slug ?? "",
          title: data.title ?? "",
          externalUrl: data.externalUrl ?? "",
          redirectType: data.redirectType ?? "internal",
          isActive: data.isActive ?? false,
        });
      }
    }
    if (id) fetchData();
  }, [id]);

  async function handleSubmit(data: any) {
    setLoading(true);
    const res = await fetch(`/api/redirect-links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/redirect-links");
    } else {
      alert("Failed to update redirect link");
    }
  }

  if (!initialData) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Redirect Link</h1>
      <Card className="p-4 max-w-xl mx-auto">
        <RedirectLinkForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
} 