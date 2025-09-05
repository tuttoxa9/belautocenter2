import ReviewsClient from './reviews-client'
import { db } from '@/lib/firebase-admin'
import { Review } from '@/types/review'

async function getReviews(): Promise<Review[]> {
    try {
        const reviewsQuery = db.collection('reviews')
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc');

        const snapshot = await reviewsQuery.get();

        if (snapshot.empty) {
            return [];
        }

        const reviewsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Firestore Timestamps need to be converted to a serializable format (e.g., ISO string)
                createdAt: data.createdAt.toDate().toISOString(),
            } as Review;
        });

        return JSON.parse(JSON.stringify(reviewsData));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export const revalidate = 3600; // Revalidate every hour

export default async function ReviewsPage() {
    const reviews = await getReviews();
    return <ReviewsClient initialReviews={reviews} />
}
