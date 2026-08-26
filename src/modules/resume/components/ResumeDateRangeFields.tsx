import React, { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DateRangeParts {
    startMonth: string;
    endMonth: string;
    isCurrent: boolean;
}

const parseMonth = (value: string): string => {
    const numeric = value.match(/^(\d{4})-(\d{1,2})$/);
    if (numeric) return `${numeric[1]}-${numeric[2].padStart(2, '0')}`;

    const year = value.match(/\d{4}/)?.[0];
    if (!year) return '';
    const monthIndex = MONTHS.findIndex(month => value.toLowerCase().startsWith(month.toLowerCase()));
    return `${year}-${String(monthIndex >= 0 ? monthIndex + 1 : 1).padStart(2, '0')}`;
};

const parseDateRange = (value: string): DateRangeParts => {
    const parts = value.split(/\s*(?:-|–|—|\bto\b)\s*/i).map(part => part.trim()).filter(Boolean);
    const startMonth = parseMonth(parts[0] || '');
    const endValue = parts[1] || '';
    return {
        startMonth,
        endMonth: /present|current/i.test(endValue) ? '' : parseMonth(endValue),
        isCurrent: /present|current/i.test(endValue),
    };
};

const formatMonth = (value: string): string => {
    const match = value.match(/^(\d{4})-(\d{2})$/);
    if (!match) return '';
    return `${MONTHS[Number(match[2]) - 1] || MONTHS[0]} ${match[1]}`;
};

const formatDateRange = ({ startMonth, endMonth, isCurrent }: DateRangeParts): string => {
    const start = formatMonth(startMonth);
    const end = isCurrent ? 'Present' : formatMonth(endMonth);
    return [start, end].filter(Boolean).join(' – ');
};

interface ResumeDateRangeFieldsProps {
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
}

export const ResumeDateRangeFields: React.FC<ResumeDateRangeFieldsProps> = ({ value, onChange, compact = false }) => {
    const parts = useMemo(() => parseDateRange(value), [value]);
    const update = (next: DateRangeParts) => onChange(formatDateRange(next));

    return (
        <div className={compact ? 'space-y-2' : 'flex flex-wrap items-center gap-2'}>
            <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400">From</label>
                <input
                    type="month"
                    value={parts.startMonth}
                    onChange={event => update({ ...parts, startMonth: event.target.value })}
                    aria-label="Start month"
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-bold text-neutral-600 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                />
            </div>
            {!compact && <span className="text-neutral-300">–</span>}
            <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400">To</label>
                {!parts.isCurrent && (
                    <input
                        type="month"
                        value={parts.endMonth}
                        onChange={event => update({ ...parts, endMonth: event.target.value })}
                        aria-label="End month"
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-bold text-neutral-600 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    />
                )}
                {parts.isCurrent && <span className="px-1 text-xs font-bold text-neutral-500">Present</span>}
            </div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                <input
                    type="checkbox"
                    checked={parts.isCurrent}
                    onChange={event => update({ ...parts, isCurrent: event.target.checked, endMonth: event.target.checked ? '' : parts.endMonth })}
                    className="rounded border-neutral-300 text-neutral-600 focus:ring-neutral-400"
                />
                Current
            </label>
        </div>
    );
};
