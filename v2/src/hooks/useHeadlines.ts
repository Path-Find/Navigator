import { useState, useMemo } from 'react';
import { HEADLINES } from '../constants';

type HeadlineType = 'all' | 'apply' | 'goal' | 'edu' | 'plans';

interface Headline {
    text: string;
    highlight: string;
}

export const useHeadlines = (type: HeadlineType) => {
    const choices = useMemo(() => HEADLINES[type], [type]);
    const [activeHeadline, setActiveHeadline] = useState<Headline>(
        () => choices[Math.floor(Math.random() * choices.length)]
    );
    const [prevChoices, setPrevChoices] = useState(choices);

    // Re-pick when type changes (avoids setState-in-effect)
    if (choices !== prevChoices) {
        setPrevChoices(choices);
        // eslint-disable-next-line react-hooks/purity
        setActiveHeadline(choices[Math.floor(Math.random() * choices.length)]);
    }

    return activeHeadline;
};
