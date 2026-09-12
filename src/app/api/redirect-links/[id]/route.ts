// Placeholder for single redirect link API route
// Implement logic for fetching, updating, and deleting a single redirect link

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Mock data for a single redirect link
  const now = new Date().toISOString();
  return new Response(
    JSON.stringify({
      _id: id,
      type: "UPDATE",
      targetId: "",
      slug: "jobs/senior-software-engineer-2024",
      title: "Edit software engineer job",
      externalUrl: "",
      redirectType: "internal",
      isActive: false,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    }),
    { status: 200 }
  );
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO: Implement updating a redirect link by ID
  return new Response(null, { status: 200 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO: Implement deleting a redirect link by ID
  return new Response(null, { status: 204 });
} 