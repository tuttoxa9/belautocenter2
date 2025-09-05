export interface ContactsData {
    title?: string;
    subtitle?: string;
    address?: string;
    addressNote?: string;
    phone?: string;
    phone2?: string;
    phoneNote?: string;
    email?: string;
    emailNote?: string;
    workingHours?: {
      weekdays?: string;
      weekends?: string;
    };
    socialMedia?: {
      instagram?: {
        name?: string;
        url?: string;
      };
      telegram?: {
        name?: string;
        url?: string;
      };
      avby?: {
        name?: string;
        url?: string;
      };
      tiktok?: {
        name?: string;
        url?: string;
      };
    };
  }
