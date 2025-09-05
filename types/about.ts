interface Stat {
    icon: any; // Can be improved, but let's keep it simple for now
    label: string;
    value: string;
}

interface CompanyInfo {
    fullName: string;
    unp: string;
    registrationDate: string;
    legalAddress: string;
}

interface BankDetails {
    account: string;
    bankName: string;
    bik: string;
    bankAddress: string;
}

export interface AboutData {
    pageTitle: string;
    pageSubtitle: string;
    stats: Stat[];
    history?: {
        title: string;
        content: string[];
    };
    principles?: {
        title: string;
        items: Array<{
            icon: string;
            title: string;
            description: string;
        }>;
    };
    services?: {
        title: string;
        items: Array<{
            icon: string;
            title: string;
            description: string;
        }>;
    };
    companyInfo: CompanyInfo;
    bankDetails: BankDetails;
}
