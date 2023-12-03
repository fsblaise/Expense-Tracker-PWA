import { Transaction } from "./transaction.model"

export interface Expense {
    id: string,
    userId: string,
    month: string,
    summary: {
        spent: number,
        storeCount: number,
        transactionCount: number
    },
    guests: {
        id: string,
        fullName: string,
    }[],
    transactions: Transaction[]
}