
'use server';

import { getFinancialAdvice, FinancialAdviceInput } from "@/ai/flows/financial-advice-from-insights";
import { netWorthSummary, NetWorthSummaryInput } from "@/ai/flows/net-worth-summary";

export async function getFinancialAdviceAction(input: FinancialAdviceInput) {
    try {
        const result = await getFinancialAdvice(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get financial advice." };
    }
}

export async function getNetWorthSummaryAction(input: NetWorthSummaryInput) {
    try {
        const result = await netWorthSummary(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get net worth summary." };
    }
}
