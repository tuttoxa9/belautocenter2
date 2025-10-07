import { NextResponse } from 'next/server'

// This API route will now fetch directly from the Firestore REST API,
// bypassing the need for the Firebase Admin SDK and the problematic service account key.
// This mirrors the fetching logic used in other parts of the application.

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`;

export async function GET() {
  try {
    // We fetch directly from the Google Firestore REST API endpoint.
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        // It's good practice to set a user-agent.
        'User-Agent': 'Belauto-NextJS-API-Route/1.0'
      },
      // Using revalidate to ensure fresh data, similar to the client-side forceRefresh logic.
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Firestore API request failed with status ${response.status}:`, errorBody);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch from Firestore API', details: errorBody }),
        { status: response.status }
      );
    }

    const data = await response.json();

    // The client-side parser expects the raw Firestore API response, so we forward it directly.
    return NextResponse.json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("An unexpected error occurred in /api/cars route:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error', details: errorMessage }),
      { status: 500 }
    );
  }
}