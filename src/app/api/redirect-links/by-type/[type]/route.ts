// Placeholder for filtering redirect links by type
export async function GET(req: Request, { params }: { params: { type: string } }) {
  const { type } = params;
  const now = new Date().toISOString();
  // Example filtered data
  const data = [
    {
      _id: "68559bbe3f268777b26082cb",
      type,
      targetId: "",
      slug: "jobs/senior-software-engineer-2024",
      title: `Filtered by type: ${type}`,
      externalUrl: "",
      redirectType: "internal",
      isActive: false,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
  ];
  return new Response(
    JSON.stringify({
      data: { link: data },
      meta: {
        timestamp: now,
        path: `/api/redirect-links/by-type/${type}`,
        statusCode: 200,
        total: data.length,
      },
    }),
    { status: 200 }
  );
} 