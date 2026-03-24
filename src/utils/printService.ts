/**
 * printService.ts
 * Utility for handling high-fidelity printing/PDF export.
 */

export const printElement = async (
    elementId: string, 
    title: string = 'Document',
    options: {
        css?: string;
        removeSelectors?: string[];
    } = {}
) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to download/print documents.');
        return;
    }

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove unwanted elements
    if (options.removeSelectors) {
        options.removeSelectors.forEach(selector => {
            const el = clone.querySelector(selector);
            if (el) el.remove();
        });
    }

    // Get all styles from the parent window
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('');
            } catch (e) {
                // Skip cross-origin stylesheets
                return '';
            }
        })
        .join('\n');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                ${styles}
                ${options.css || ''}
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body class="bg-white">
            <div class="print-container p-4">
                ${clone.innerHTML}
            </div>
            <script>
                // Wait for any images to load
                window.onload = () => {
                    window.print();
                    // Optional: window.close();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
};
