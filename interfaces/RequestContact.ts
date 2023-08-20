import { Phone } from "./Contact";

export interface RequestContact {
    id?: number | undefined;
    first_name: string;
    last_name: string;
    phones: Phone[];
}