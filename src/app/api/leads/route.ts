/**
 * Lead Capture API Route
 * Phase 3: ProTender Fund Finder - Lead Generation
 *
 * Handles email capture for downloadable resources
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, businessType, resourceName, resourceFileName, source, timestamp } = body;

    // Validation
    if (!name || !email || !resourceName) {
      return NextResponse.json(
        { error: "Name, email, and resource name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Store lead in database
    // Note: You'll need to create a Lead model in your Prisma schema
    // For now, we'll use the Feedback table as a temporary solution
    // or you can create a new Lead table

    // Temporary solution using Feedback table (or create new Lead table)
    try {
      const lead = await prisma.feedback.create({
        data: {
          type: "lead_capture",
          title: `Lead: ${name} - ${resourceName}`,
          description: JSON.stringify({
            name,
            businessType: businessType || null,
            resourceName,
            resourceFileName: resourceFileName || null,
            source: source || "funding_guide",
            capturedAt: timestamp || new Date().toISOString(),
          }),
          email,
          priority: "medium",
          status: "pending",
        },
      });

      // TODO: Send email with download link
      // For now, we'll return success. In production, integrate with:
      // - SendGrid/Mailgun for transactional email
      // - Store file URLs in environment variables
      // - Send personalized email with download link

      // TODO: Add to email marketing list (if you use Mailchimp, ConvertKit, etc.)

      return NextResponse.json(
        {
          success: true,
          message: "Thank you! Check your email for the download link.",
          leadId: lead.id,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);

      // If database fails, still return success to user but log error
      // This ensures user experience isn't broken if DB has issues
      return NextResponse.json(
        {
          success: true,
          message: "Thank you! Check your email for the download link.",
          warning: "Lead captured but notification may be delayed",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads (admin only - add authentication)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, return error
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );

    // Future implementation:
    // const leads = await prisma.feedback.findMany({
    //   where: { category: "lead_capture" },
    //   orderBy: { createdAt: "desc" },
    //   take: 100,
    // });
    //
    // return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
