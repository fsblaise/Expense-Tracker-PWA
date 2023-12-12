export interface User {
    id: string,
    email: string,
    fullName: string,
    syncDarkMode: boolean,
    darkMode: boolean | null,
    expensePreferences: {
        currency: string,
        language: string
    }
}