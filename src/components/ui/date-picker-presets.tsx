'use client';

import { Button } from '@/components/ui/button';
import { addDays, addMonths, addYears } from 'date-fns';

type Preset = '7-days' | '30-days' | 'next-month' | '3-months' | '6-months' | '1-year';

const presetMap: Record<Preset, { label: string; getDate: () => Date }> = {
    '7-days': { label: 'In 7 days', getDate: () => addDays(new Date(), 7) },
    '30-days': { label: 'In 30 days', getDate: () => addDays(new Date(), 30) },
    'next-month': { label: 'Next Month', getDate: () => addMonths(new Date(), 1) },
    '3-months': { label: 'In 3 months', getDate: () => addMonths(new Date(), 3) },
    '6-months': { label: 'In 6 months', getDate: () => addMonths(new Date(), 6) },
    '1-year': { label: 'In 1 year', getDate: () => addYears(new Date(), 1) },
}

interface DatePickerPresetsProps {
    onSelect: (date: Date) => void;
    presets: Preset[];
}

export function DatePickerPresets({ onSelect, presets }: DatePickerPresetsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 p-3 border-t">
            {presets.map(presetId => {
                const preset = presetMap[presetId];
                return (
                    <Button
                        key={presetId}
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(preset.getDate())}
                        className="h-auto px-2 py-1 text-xs"
                    >
                        {preset.label}
                    </Button>
                )
            })}
        </div>
    )
}
