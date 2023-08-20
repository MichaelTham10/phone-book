export interface Phone {
    number: string;
    __typename?: "phone"
}

export interface Contact {
    created_at: Date;
    first_name: string;
    id: number;
    last_name: string;
    phones: Phone[];
    __typename:"contact"
}

export interface Contacts {
    contact: Contact[];
}