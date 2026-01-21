export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userProfileId: string;
}

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  category: 'Housing' | 'Utilities' | 'Internet' | 'Mobile' | 'Subscriptions' | 'Insurance' | 'Transport' | 'Healthcare' | 'Loan Payment' | 'Other';
};

export type BudgetDoc = {
  id: string;
  category: string;
  allocated: number;
};

export type Budget = {
  id: string;
  category: string;
  allocated: number;
  spent: number;
};

export type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
};

export type Asset = {
  id: string;
  name: string;
  value: number;
  type: 'Cash' | 'Investment' | 'Property' | 'Other';
};

export type Liability = {
  id: string;
  name: string;
  value: number;
  type: 'Loan' | 'Credit Card' | 'Mortgage' | 'Other';
};

export type NetWorth = {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
}

export type NetWorthHistoryPoint = {
  date: string;
  netWorth: number;
};

export type IncomeStream = {
  id: string;
  name: string;
  amount: number;
  schedule: 'Monthly' | 'Bi-Weekly' | 'One-Time' | 'Yearly';
};

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
}

export interface SummaryItem {
  item: string;
  budget: number | null;
  actual: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  fill: string;
}

export interface CashFlowChartItem {
    name: string;
    budget: number;
    actual: number;
}
