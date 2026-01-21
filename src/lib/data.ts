import type { Asset, Liability, Bill, Budget, SavingsGoal, Transaction, RunwayData, NetWorthHistory } from './types';

const today = new Date();
const getFutureDate = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days).toISOString();
const getPastDate = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - days).toISOString();
const getPastMonth = (months: number) => new Date(today.getFullYear(), today.getMonth() - months, 1).toISOString();


export const mockData = {
  assets: [
    { name: 'Checking Account', value: 8500 },
    { name: 'Savings Account', value: 25000 },
    { name: 'Robinhood', value: 12000 },
    { name: '401(k)', value: 55000 },
  ] as Asset[],

  liabilities: [
    { name: 'Credit Card Debt', value: 2500 },
    { name: 'Student Loan', value: 22000 },
  ] as Liability[],

  bills: [
    { id: 1, name: 'Netflix', amount: 15.99, dueDate: getFutureDate(5), paid: false },
    { id: 2, name: 'Rent', amount: 1800, dueDate: getFutureDate(1), paid: false },
    { id: 3, name: 'Car Insurance', amount: 120.50, dueDate: getFutureDate(10), paid: false },
    { id: 4, name: 'Spotify', amount: 10.99, dueDate: getPastDate(2), paid: true },
    { id: 5, name: 'Gym Membership', amount: 40.00, dueDate: getFutureDate(20), paid: false },
  ] as Bill[],

  budgets: [
    { category: 'Groceries', amount: 400 },
    { category: 'Dining Out', amount: 250 },
    { category: 'Shopping', amount: 200 },
    { category: 'Transportation', amount: 150 },
    { category: 'Entertainment', amount: 100 },
  ] as Budget[],

  savingsGoals: [
    { id: 1, name: 'Vacation to Japan', targetAmount: 5000, currentAmount: 3200 },
    { id: 2, name: 'New Laptop', targetAmount: 2000, currentAmount: 1850 },
    { id: 3, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 7500 },
  ] as SavingsGoal[],

  transactions: [
    { date: getPastDate(2), description: 'Trader Joe\'s', amount: -85.40, category: 'Groceries' },
    { date: getPastDate(3), description: 'Sweetgreen', amount: -15.75, category: 'Dining Out' },
    { date: getPastDate(5), description: 'Uniqlo', amount: -120.00, category: 'Shopping' },
    { date: getPastDate(1), description: 'Paycheck', amount: 2500.00, category: 'Income' },
    { date: getPastDate(7), description: 'Gas', amount: -45.50, category: 'Transportation' },
  ],
  
  runway: {
    runway: 12,
    burnRate: 3500,
    savingsVelocity: 500,
  } as RunwayData,

  netWorthHistory: [
    { date: getPastMonth(5), assets: 80000, liabilities: 28000, netWorth: 52000 },
    { date: getPastMonth(4), assets: 82500, liabilities: 27000, netWorth: 55500 },
    { date: getPastMonth(3), assets: 88000, liabilities: 26000, netWorth: 62000 },
    { date: getPastMonth(2), assets: 91000, liabilities: 24500, netWorth: 66500 },
    { date: getPastMonth(1), assets: 95500, liabilities: 24000, netWorth: 71500 },
    { date: getPastMonth(0), assets: 100500, liabilities: 24500, netWorth: 76000 },
  ] as NetWorthHistory[],
};
