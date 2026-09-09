import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for all jobs (can be more than latest jobs)
  const allJobs = [
    {
      id: 1,
      title: "BPSC Motor Vehicle Inspector Online Form 2025",
      slug: "bpsc-motor-vehicle",
      category: "Government Jobs",
      postedDate: "2025-01-15",
      lastDate: "2025-02-15",
      location: "Bihar",
      organization: "BPSC"
    },
    {
      id: 2,
      title: "Coast Guard Navik Yantrik Online Form 2025",
      slug: "coast-guard-navik",
      category: "Defence Jobs",
      postedDate: "2025-01-14",
      lastDate: "2025-02-10",
      location: "All India",
      organization: "Indian Coast Guard"
    },
    {
      id: 3,
      title: "SSC Stenographer Online Form 2025",
      slug: "ssc-stenographer",
      category: "Government Jobs",
      postedDate: "2025-01-13",
      lastDate: "2025-02-20",
      location: "All India",
      organization: "SSC"
    },
    {
      id: 4,
      title: "UPSC NDA II Online Form 2025",
      slug: "upsc-nda",
      category: "Defence Jobs",
      postedDate: "2025-01-12",
      lastDate: "2025-02-05",
      location: "All India",
      organization: "UPSC"
    },
    {
      id: 5,
      title: "UPSC CDS II Online Form 2025",
      slug: "upsc-cds",
      category: "Defence Jobs",
      postedDate: "2025-01-11",
      lastDate: "2025-02-01",
      location: "All India",
      organization: "UPSC"
    },
    {
      id: 6,
      title: "Indian Air Force AFCAT Online Form 2025",
      slug: "air-force-afcat",
      category: "Defence Jobs",
      postedDate: "2025-01-10",
      lastDate: "2025-01-30",
      location: "All India",
      organization: "Indian Air Force"
    },
    {
      id: 7,
      title: "NTA CSIR UGC NET Online Form 2025",
      slug: "nta-csir-ugc-net",
      category: "Teaching Jobs",
      postedDate: "2025-01-09",
      lastDate: "2025-01-25",
      location: "All India",
      organization: "NTA"
    },
    {
      id: 8,
      title: "UPSSSC PET Online Form 2025",
      slug: "upsssc-pet",
      category: "Government Jobs",
      postedDate: "2025-01-08",
      lastDate: "2025-01-20",
      location: "Uttar Pradesh",
      organization: "UPSSSC"
    },
    {
      id: 9,
      title: "Army School AWES TGT PGT PRT Online Form 2025",
      slug: "army-school-awes",
      category: "Teaching Jobs",
      postedDate: "2025-01-07",
      lastDate: "2025-01-18",
      location: "All India",
      organization: "AWES"
    },
    {
      id: 10,
      title: "SSC CGL Online Form 2025 for 14582 Post",
      slug: "ssc-cgl-14582",
      category: "Government Jobs",
      postedDate: "2025-01-06",
      lastDate: "2025-01-15",
      location: "All India",
      organization: "SSC"
    },
    // Add more jobs for demonstration
    {
      id: 11,
      title: "UP Police Constable Recruitment 2025",
      slug: "up-police-constable",
      category: "Police Jobs",
      postedDate: "2025-01-05",
      lastDate: "2025-01-25",
      location: "Uttar Pradesh",
      organization: "UP Police"
    },
    {
      id: 12,
      title: "Delhi Metro DMRC Various Post Online Form 2025",
      slug: "dmrc-various-post",
      category: "Metro Jobs",
      postedDate: "2025-01-04",
      lastDate: "2025-01-20",
      location: "Delhi",
      organization: "DMRC"
    }
  ];

  return NextResponse.json({
    success: true,
    data: allJobs,
    total: allJobs.length,
    message: "All jobs fetched successfully"
  });
} 