export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  currency: string;
  financialYearStartMonth?: number; // 1 for Jan, 12 for Dec
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  category: 'Electricity' | 'Gas' | 'Gym' | 'Health Insurance' | 'Housing' | 'Internet' | 'Loan Payment' | 'Mobile' | 'Subscriptions' | 'Water' | 'Other';
};

export type BudgetDoc = {
  id: string;
  category: string;
  allocated: number;
};

export type Budget = {
  id:string;
  category: string;
  allocated: number;
  spent: number;
};

export type Expense = {
  id: string;
  category: 'Food' | 'Dining Out' | 'Transportation' | 'Household' | 'Education' | 'Health' | 'Beauty' | 'Gifts' | 'Self-development' | 'Entertainment' | 'Other';
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
  type: 'Mortgage' | 'Auto Loan' | 'Student Loan' | 'Credit Card' | 'Personal Loan' | 'Medical Debt' | 'Loan from Friends/Family' | 'Buy Now, Pay Later' | 'Tax Debt' | 'Other';
};

export type NetWorth = {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
  name?: string;
}

export type NetWorthHistoryPoint = {
  date: string;
  netWorth: number;
};


export type IncomeStream = {
  id: string;
  name: string;
  amount: number;
  schedule: 'Weekly' | 'Bi-Weekly' | 'Semi-Monthly' | 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Yearly' | 'One-Time';
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
