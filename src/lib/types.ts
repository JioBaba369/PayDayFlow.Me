export interface Asset {
  name: string;
  value: number;
}

export interface Liability {
  name: string;
  value: number;
}

export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

export interface Budget {
  category: string;
  amount: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface RunwayData {
    runway: number;
    burnRate: number;
    savingsVelocity: number;
}

export interface NetWorthHistory {
    date: string;
    assets: number;
    liabilities: number;
    netWorth: number;
}
