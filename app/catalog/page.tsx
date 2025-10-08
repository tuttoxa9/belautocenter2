import CatalogClient from './catalog-client';
import { parseFirestoreDoc } from '@/lib/firestore-parser';

export const revalidate = 3600; // Кэшировать на 1 час

async function getCars(searchParams: any) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`;

    const response = await fetch(firestoreUrl, {
        next: { tags: ['cars'] }, // Add cache tag
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-Direct-Firestore/1.0'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cars');
    }

    const rawData = await response.json();
    const allCars = rawData.documents?.map((doc: any) => {
        const carData = parseFirestoreDoc(doc);
        carData.id = doc.name.split('/').pop() || '';
        return carData;
    }) || [];

    // Filter, sort, and paginate cars on the server
    const {
        sortBy = 'date-desc',
        priceFrom,
        priceTo,
        make,
        model,
        yearFrom,
        yearTo,
        mileageFrom,
        mileageTo,
        transmission,
        fuelType,
        driveTrain,
        page = '1'
    } = searchParams;

    const filteredCars = allCars.filter((car: any) => {
        if (!car || car.isAvailable === false) return false;

        const carPrice = car.price || 0;
        const carYear = car.year || 0;
        const carMileage = car.mileage || 0;

        const pFrom = priceFrom ? Number.parseInt(priceFrom) || 0 : 0;
        const pTo = priceTo ? Number.parseInt(priceTo) || 0 : 0;
        const yFrom = yearFrom ? Number.parseInt(yearFrom) || 0 : 0;
        const yTo = yearTo ? Number.parseInt(yearTo) || 0 : 0;
        const mFrom = mileageFrom ? Number.parseInt(mileageFrom) || 0 : 0;
        const mTo = mileageTo ? Number.parseInt(mileageTo) || 0 : 0;

        return (
            (!pFrom || carPrice >= pFrom) &&
            (!pTo || carPrice <= pTo) &&
            (!make || make === 'all' || car.make === make) &&
            (!model || model === 'all' || car.model === model) &&
            (!yFrom || carYear >= yFrom) &&
            (!yTo || carYear <= yTo) &&
            (!mFrom || carMileage >= mFrom) &&
            (!mTo || carMileage <= mTo) &&
            (!transmission || transmission === 'any' || car.transmission === transmission) &&
            (!fuelType || fuelType === 'any' || car.fuelType === fuelType) &&
            (!driveTrain || driveTrain === 'any' || car.driveTrain === driveTrain)
        );
    });

    filteredCars.sort((a: any, b: any) => {
        switch (sortBy) {
            case 'price-asc': return (a.price || 0) - (b.price || 0);
            case 'price-desc': return (b.price || 0) - (a.price || 0);
            case 'year-desc': return b.year - a.year;
            case 'year-asc': return a.year - b.year;
            case 'mileage-asc': return a.mileage - b.mileage;
            case 'mileage-desc': return b.mileage - a.mileage;
            case 'date-asc': return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
            default: return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
    });

    const currentPage = parseInt(page, 10);
    const carsPerPage = 12;
    const totalCars = filteredCars.length;
    const totalPages = Math.ceil(totalCars / carsPerPage);
    const paginatedCars = filteredCars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage);

    return {
        cars: paginatedCars,
        totalCars,
        totalPages,
        currentPage,
        availableMakes: [...new Set(allCars.map((car: any) => car.make))].sort(),
        availableModels: [...new Set(allCars.map((car: any) => car.model))].sort()
    };
}

export default async function CatalogPage({ searchParams }: { searchParams: any }) {
    const { cars, totalCars, totalPages, currentPage, availableMakes, availableModels } = await getCars(searchParams);

    return (
        <CatalogClient
            initialCars={cars}
            totalCars={totalCars}
            totalPages={totalPages}
            currentPage={currentPage}
            availableMakes={availableMakes}
            availableModels={availableModels}
            searchParams={searchParams}
        />
    );
}
