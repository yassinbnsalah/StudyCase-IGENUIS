

export interface Course {
    id: number;
    title: string;
    description: string;
    modules?: { id: number }[];
}