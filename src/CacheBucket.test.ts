import { Bucket } from './CacheBucket';

describe('Bucket', () => {
    let bucket: Bucket;

    beforeEach(() => {
        bucket = new Bucket();
    });

    test('get() retrieves value using getter if not cached', () => {
        const getter = jest.fn(() => 'computedValue');
        const value = bucket.get('testBucket', 'testKey', getter);
        expect(getter).toHaveBeenCalledTimes(1);
        expect(value).toBe('computedValue');
    });

    test('get() returns cached value and does not call getter again', () => {
        const getter = jest.fn(() => 'computedValue');
        bucket.get('testBucket', 'testKey', getter);
        const value = bucket.get('testBucket', 'testKey', getter);
        expect(getter).toHaveBeenCalledTimes(1);
        expect(value).toBe('computedValue');
    });

    test('set() explicitly sets value and get() returns it', () => {
        bucket.set('testBucket', 'testKey', 'explicitValue');
        const getter = jest.fn(() => 'computedValue'); // should not be used
        const value = bucket.get('testBucket', 'testKey', getter);
        expect(getter).not.toHaveBeenCalled();
        expect(value).toBe('explicitValue');
    });

    test('clear(bucket) clears specific bucket', () => {
        bucket.set('bucket1', 'key1', 'value1');
        bucket.set('bucket2', 'key2', 'value2');

        // Clear only bucket1
        bucket.clear('bucket1');

        const getter1 = jest.fn(() => 'newValue1');
        // When get() is called for bucket1, it should use the getter again
        const value1 = bucket.get('bucket1', 'key1', getter1);
        expect(getter1).toHaveBeenCalled();
        expect(value1).toBe('newValue1');

        // Bucket2 should remain unchanged
        const getter2 = jest.fn(() => 'computedValue2');
        const value2 = bucket.get('bucket2', 'key2', getter2);
        expect(getter2).not.toHaveBeenCalled();
        expect(value2).toBe('value2');
    });

    test('clear() clears all buckets', () => {
        bucket.set('bucket1', 'key1', 'value1');
        bucket.set('bucket2', 'key2', 'value2');

        // Clear entire cache
        bucket.clear();

        const getter1 = jest.fn(() => 'newValue1');
        const value1 = bucket.get('bucket1', 'key1', getter1);
        expect(getter1).toHaveBeenCalled();
        expect(value1).toBe('newValue1');

        const getter2 = jest.fn(() => 'newValue2');
        const value2 = bucket.get('bucket2', 'key2', getter2);
        expect(getter2).toHaveBeenCalled();
        expect(value2).toBe('newValue2');
    });
});