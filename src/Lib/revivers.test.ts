import compositeReviver from './compositeReviver';
import dateFieldReviver from './dateFieldReviver';
import urlFieldReviver from './urlFieldReviver';

describe('JSON field revivers', () => {
    it('converts date-time strings into Date instances', () => {
        const revived = dateFieldReviver('expiresOn', '2025-05-05T12:34:56.789Z');

        expect(revived).toBeInstanceOf(Date);
        expect(revived.toISOString()).toBe('2025-05-05T12:34:56.789Z');
    });

    it('leaves non-date strings unchanged', () => {
        expect(dateFieldReviver('name', '2025-05-05')).toBe('2025-05-05');
    });

    it('converts http and https strings into URL instances', () => {
        const revived = urlFieldReviver('downloadUrl', 'https://example.com/photo.jpg');

        expect(revived).toBeInstanceOf(URL);
        expect(revived.href).toBe('https://example.com/photo.jpg');
    });

    it('runs composed revivers in order when parsing JSON', () => {
        const parsed = JSON.parse(
            JSON.stringify({
                expiresOn: '2025-05-05T12:34:56.789Z',
                downloadUrl: 'https://example.com/photo.jpg',
                label: 'unchanged'
            }),
            compositeReviver(dateFieldReviver, urlFieldReviver)
        );

        expect(parsed.expiresOn).toBeInstanceOf(Date);
        expect(parsed.downloadUrl).toBeInstanceOf(URL);
        expect(parsed.label).toBe('unchanged');
    });
});
