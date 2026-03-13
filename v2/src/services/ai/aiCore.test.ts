import { describe, it, expect } from 'vitest';
import { cleanJsonOutput } from './aiCore';

describe('cleanJsonOutput', () => {
    it('should return valid JSON string as is', () => {
        const input = '{"key": "value"}';
        expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should extract JSON from standard ```json block', () => {
        const input = '```json\n{"key": "value"}\n```';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should extract JSON from generic ``` block', () => {
        const input = '```\n{"key": "value"}\n```';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle whitespace around the block', () => {
        const input = '   ```json\n{"key": "value"}\n```   ';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should extract JSON embedded in other text', () => {
        const input = 'Here is the JSON:\n```json\n{"key": "value"}\n```\nHope this helps!';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle broken markdown (missing end tag)', () => {
        // The regex fallback logic handles this case
        const input = '```json\n{"key": "value"}';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle broken markdown (missing start tag)', () => {
        // The regex fallback logic handles this case
        const input = '{"key": "value"}\n```';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle case-insensitive markdown tags', () => {
        const input = '```JSON\n{"key": "value"}\n```';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle empty content', () => {
        const input = '```json\n```';
        expect(cleanJsonOutput(input)).toBe('');
    });

    it('should handle empty string and whitespace-only strings', () => {
        expect(cleanJsonOutput('')).toBe('');
        expect(cleanJsonOutput('   ')).toBe('');
        expect(cleanJsonOutput('\n\t\r')).toBe('');
    });

    it('should extract the first JSON block when multiple blocks exist', () => {
        const input = 'Here is the first:\n```json\n{"first": 1}\n```\nAnd the second:\n```json\n{"second": 2}\n```';
        expect(cleanJsonOutput(input)).toBe('{"first": 1}');
    });

    it('should return plain text as is if no code blocks are present', () => {
        const input = 'Just some plain text without any code blocks or JSON.';
        expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should handle markdown with trailing text and spaces after closing tag', () => {
        const input = '```json\n{"key": "value"}\n```   \nSome trailing text';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should handle malformed json without code blocks but trailing spaces', () => {
        const input = '   {"key": "value"}   ';
        expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });
});
