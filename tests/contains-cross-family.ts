import * as assert from 'assert';
import { Netmask } from '../lib/netmask';

// Regression tests for #62: contains() must return a boolean for a
// validly-formatted address of the other family instead of throwing a
// low-level parser error.
describe('Netmask contains cross-family', () => {
    it('IPv4 range does not contain an IPv4-mapped IPv6 address', () => {
        const block = new Netmask('0.0.0.0/8');
        assert.strictEqual(block.contains('::ffff:127.0.0.1'), false);
    });

    it('IPv6 range does not contain an IPv4 address', () => {
        const block = new Netmask('fc00::/7');
        assert.strictEqual(block.contains('10.0.0.1'), false);
    });

    it('IPv4 range still contains a same-family IPv4 address', () => {
        const block = new Netmask('10.0.0.0/8');
        assert.strictEqual(block.contains('10.0.0.1'), true);
    });

    it('IPv6 range still contains a same-family IPv6 address', () => {
        const block = new Netmask('fc00::/7');
        assert.strictEqual(block.contains('fc00::1'), true);
    });
});
