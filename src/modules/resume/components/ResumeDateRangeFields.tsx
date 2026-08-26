import React, { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DateRangeParts {
    startMonth: string;
    endMonth: string;
    isCurrent: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 91 }, (_, index) => String(CURRENT_YEAR + 10 - index));

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
    hideCurrentToggle?: boolean;
    isCurrentOverride?: boolean;
}

const MonthYearSelect: React.FC<{ value: string; onChange: (value: string) => void; label: string }> = ({ value, onChange, label }) => {
    const [year = '', month = ''] = value.split('-');
    const update = (nextYear: string, nextMonth: string) => onChange(nextYear && nextMonth ? `${nextYear}-${nextMonth}` : '');

    return (
        <div className="flex items-center gap-1">
            <select
                value={month}
                onChange={event => update(year, event.target.value)}
                aria-label={`${label} month`}
                className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-xs font-bold text-neutral-600 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
                <option value="">Month</option>
                {MONTHS.map((monthName, index) => <option key={monthName} value={String(index + 1).padStart(2, '0')}>{monthName}</option>)}
            </select>
            <select
                value={year}
                onChange={event => update(event.target.value, month)}
                aria-label={`${label} year`}
                className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-xs font-bold text-neutral-600 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
                <option value="">Year</option>
                {YEAR_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
};

export const ResumeDateRangeFields: React.FC<ResumeDateRangeFieldsProps> = ({ value, onChange, compact = false, hideCurrentToggle = false, isCurrentOverride }) => {
    const parts = useMemo(() => parseDateRange(value), [value]);
    const isCurrent = isCurrentOverride ?? parts.isCurrent;
    const update = (next: DateRangeParts) => onChange(formatDateRange({ ...next, isCurrent }));

    return (
        <div className={compact ? 'space-y-2' : 'flex flex-wrap items-center gap-2'}>
            <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400">From</label>
                <MonthYearSelect value={parts.startMonth} onChange={startMonth => update({ ...parts, startMonth })} label="Start" />
            </div>
            {!compact && <span className="text-neutral-300">–</span>}
            <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400">To</label>
                {!isCurrent && (
                    <MonthYearSelect value={parts.endMonth} onChange={endMonth => update({ ...parts, endMonth })} label="End" />
                )}
                {isCurrent && <span className="px-1 text-xs font-bold text-neutral-500">Present</span>}
            </div>
            {!hideCurrentToggle && (
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                    <input
                        type="checkbox"
                        checked={isCurrent}
                        onChange={event => update({ ...parts, isCurrent: event.target.checked, endMonth: event.target.checked ? '' : parts.endMonth })}
                        className="rounded border-neutral-300 text-neutral-600 focus:ring-neutral-400"
                    />
                    Current
                </label>
            )}
        </div>
    );
};
