export type ValidationError = {
    field: string;
    message: string;
};
export type ResponseBody = {
    data: Record<string, any>;
} | {
    errors: Array<ValidationError>;
    message: string;
};
export interface User {
    access_token: string;
    name: string;
    role: string;
    id: number;
}
