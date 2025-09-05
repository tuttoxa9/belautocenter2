import ContactsClient from './contacts-client'
import { db } from '@/lib/firebase-admin'
import { ContactsData } from '@/types/contacts'

async function getContactsData(): Promise<ContactsData | null> {
    try {
        const docRef = db.collection('pages').doc('contacts');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            // Using JSON.parse(JSON.stringify(...)) to ensure plain objects are passed
            return JSON.parse(JSON.stringify(docSnap.data()));
        } else {
            return {
                title: "Контакты",
                subtitle: "Свяжитесь с нами любым удобным способом",
                address: "г. Минск",
                phone: "+375 29 000 00 00",
                email: "info@belautocenter.by",
                workingHours: {
                  weekdays: "Пн-Пт: 9:00 - 18:00"
                },
                socialMedia: {}
              };
        }
    } catch (error) {
        console.error("Error fetching contacts page data:", error);
        return null;
    }
}

export const revalidate = 3600; // Revalidate every hour

export default async function ContactsPage() {
    const contactsData = await getContactsData();
    return <ContactsClient initialData={contactsData} />
}
