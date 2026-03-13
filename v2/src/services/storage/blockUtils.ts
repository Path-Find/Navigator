export const areBlocksEqual = (a: { type: string; title?: string; organization?: string }, b: { type: string; title?: string; organization?: string }) => {
    if (a.type !== b.type) return false;
    const normTitleA = String(a.title || "").toLowerCase().trim();
    const normTitleB = String(b.title || "").toLowerCase().trim();
    const normOrgA = String(a.organization || "").toLowerCase().trim();
    const normOrgB = String(b.organization || "").toLowerCase().trim();

    if (['work', 'education', 'project', 'volunteer'].includes(a.type)) {
        return normTitleA === normTitleB && normOrgA === normOrgB;
    }
    if (a.type === 'skill') return normTitleA === normTitleB;
    if (a.type === 'summary') return true;
    return false;
};
