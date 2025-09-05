export interface Review {
    id: string;
    name: string;
    rating: number;
    text: string;
    carModel?: string;
    imageUrl?: string;
    createdAt: Date;
    status?: string;
}
