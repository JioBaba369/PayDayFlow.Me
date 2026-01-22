'use client';

import {
  Zap,
  Fuel,
  Dumbbell,
  HeartPulse,
  Home,
  Wifi,
  Landmark,
  Smartphone,
  Repeat,
  Droplets,
  Ellipsis,
  ShoppingBasket,
  Utensils,
  Plane,
  BookOpen,
  Sparkles,
  Gift,
  BrainCircuit,
  Ticket,
  type LucideProps,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Bill Categories
  Electricity: Zap,
  Gas: Fuel,
  Gym: Dumbbell,
  'Health Insurance': HeartPulse,
  Housing: Home,
  Internet: Wifi,
  'Loan Payment': Landmark,
  Mobile: Smartphone,
  Subscriptions: Repeat,
  Water: Droplets,

  // Expense Categories
  Food: ShoppingBasket,
  'Dining Out': Utensils,
  Transportation: Plane,
  Household: Home,
  Education: BookOpen,
  Health: HeartPulse,
  Beauty: Sparkles,
  Gifts: Gift,
  'Self-development': BrainCircuit,
  Entertainment: Ticket,

  // Common Category
  Other: Ellipsis,
};

interface CategoryIconProps extends LucideProps {
  category: string;
}

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[category] || Ellipsis;
  return <IconComponent {...props} />;
}
