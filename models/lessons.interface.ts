export interface Lessons {
    id: number;
    title: string;
    description: string;
    topics: string[];
    content: {
        type: string; 
        data: string;  
    }[];
}
