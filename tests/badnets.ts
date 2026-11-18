import * as assert from 'assert';
import { Netmask, ip2long } from '../lib/netmask';

function shouldFailWithError(input: string, msg: string): void {
    it(`'${input}' should fail with error '${msg}'`, () => {
        assert.throws(
            () => new Netmask(input),
            (e: Error) => {
                assert.ok(e instanceof Error, `is an Error object: ${e}`);
                assert.ok(
                    e.message.toLowerCase().indexOf(msg.toLowerCase()) > -1,
                    `'${e.message}' should contain '${msg}'`
                );
                return true;
            }
        );
    });
}

describe('IPs with bytes greater than 255', () => {
    shouldFailWithError('209.256.68.22/255.255.224.0', 'Invalid net');
    shouldFailWithError('209.180.68.22/256.255.224.0', 'Invalid mask');
    shouldFailWithError('209.500.70.33/19', 'Invalid net');
    shouldFailWithError('140.999.82', 'Invalid net');
    shouldFailWithError('899.174', 'Invalid net');
    shouldFailWithError('209.157.65536/19', 'Invalid net');
    shouldFailWithError('209.300.64.0.10', 'Invalid net');
    shouldFailWithError('garbage', 'Invalid net');
});

describe('Invalid IP format', () => {
    shouldFailWithError(' 1.2.3.4', 'Invalid net');
    shouldFailWithError('  1.2.3.4', 'Invalid net');
    shouldFailWithError('1. 2.3.4', 'Invalid net');
    shouldFailWithError('1.2. 3.4', 'Invalid net');
    shouldFailWithError('1.2.3. 4', 'Invalid net');
    shouldFailWithError('1.2.3.4 ', 'Invalid net');
    shouldFailWithError('1 .2.3.4', 'Invalid net');
    shouldFailWithError('018.0.0.0', 'Invalid net');
    shouldFailWithError('08.0.0.0', 'Invalid net');
    shouldFailWithError('0xfg.0.0.0', 'Invalid net');
});

describe('Ranges that are a power-of-two big, but are not legal blocks', () => {
    shouldFailWithError('218.0.0.0/221.255.255.255', 'Invalid mask');
    shouldFailWithError('218.0.0.4/218.0.0.11', 'Invalid mask');
});

describe('Negative CIDR prefixes', () => {
    shouldFailWithError('192.168.1.0/-1', 'Invalid mask');
    shouldFailWithError('10.0.0.0/-5', 'Invalid mask');
});

function shouldRejectLong(input: string, msg: string): void {
    it(`ip2long('${input}') should fail with '${msg}'`, () => {
        assert.throws(
            () => ip2long(input),
            (e: Error) => {
                assert.ok(e instanceof Error, `is an Error object: ${e}`);
                assert.strictEqual(e.message, msg);
                return true;
            }
        );
    });
}

function shouldRejectContains(block: string, input: string): void {
    it(`'${block}' should not accept '${input}'`, () => {
        const net = new Netmask(block);
        assert.throws(() => net.contains(input), (e: Error) => {
            assert.ok(e instanceof Error, `is an Error object: ${e}`);
            return true;
        });
    });
}

describe('Out-of-range IPv4 numeric components', () => {
    // Values above 2^32-1 used to wrap modulo 2^32 inside parseNum.
    shouldRejectLong('4294967296', 'too large');
    shouldRejectLong('4294967297', 'too large');
    shouldRejectLong('6425673729', 'too large');
    shouldRejectLong('4429711368', 'too large');
    shouldRejectLong('0x100000000', 'too large');
    shouldRejectLong('0X100000000', 'too large');
    shouldRejectLong('0x0100000000', 'too large');
    shouldRejectLong('040000000000', 'too large');
    shouldRejectLong('1.4294967296', 'too large');
    shouldRejectLong('1.4294967297', 'too large');
    shouldRejectLong('1.0x100000000', 'too large');
    shouldRejectLong('0.040000000000', 'too large');
    shouldRejectLong('1.2.4294967296', 'too large');
    shouldRejectLong('1.2.3.4294967296', 'too large');
    shouldRejectLong('4294967296.0.0.1', 'too large');
    shouldRejectLong('8.8.8.4294967304', 'too large');
    shouldRejectLong('127.0.0.4294967296', 'too large');

    shouldFailWithError('6425673729', 'Invalid net');
    shouldFailWithError('4294967296', 'Invalid net');
    shouldFailWithError('0x100000000', 'Invalid net');
    shouldFailWithError('040000000000', 'Invalid net');
    shouldFailWithError('1.4294967296', 'Invalid net');
    shouldFailWithError('1.2.4294967296', 'Invalid net');
    shouldFailWithError('1.2.3.4294967296', 'Invalid net');
    shouldFailWithError('10.0.0.0/255.255.255.4294967296', 'Invalid mask');

    shouldRejectContains('127.0.0.0/8', '6425673729');
    shouldRejectContains('0.0.0.0/32', '4294967296');
    shouldRejectContains('8.8.8.8/32', '4429711368');
    shouldRejectContains('127.0.0.0/8', '127.0.0.4294967296');
    shouldRejectContains('8.8.8.8/32', '8.8.8.4294967304');
    shouldRejectContains('1.0.0.0/8', '1.4294967296');
    shouldRejectContains('1.2.0.0/16', '1.2.4294967296');

    // Part-width limits: still rejected when the component fits in 32 bits.
    describe('dotted-form boundaries', () => {
        shouldRejectLong('1.16777216', 'Invalid IP');
        shouldRejectLong('1.0x1000000', 'Invalid IP');
        shouldRejectLong('1.0100000000', 'Invalid IP');
        shouldRejectLong('256.16777215', 'Invalid IP');
        shouldRejectLong('255.16777216', 'Invalid IP');
        shouldRejectLong('1.2.65536', 'Invalid IP');
        shouldRejectLong('1.2.0x10000', 'Invalid IP');
        shouldRejectLong('1.2.0200000', 'Invalid IP');
        shouldRejectLong('1.256.65535', 'Invalid IP');
        shouldRejectLong('255.255.65536', 'Invalid IP');
        shouldRejectLong('1.2.3.256', 'Invalid IP');
        shouldRejectLong('0x100.0.0.0', 'Invalid IP');
        shouldRejectLong('0400.0.0.0', 'Invalid IP');
        shouldRejectLong('255.255.255.256', 'Invalid IP');
        shouldRejectLong('256.1', 'Invalid IP');
        shouldRejectLong('256.1.1', 'Invalid IP');

        shouldFailWithError('1.16777216', 'Invalid net');
        shouldFailWithError('255.16777216', 'Invalid net');
        shouldFailWithError('1.2.65536', 'Invalid net');
        shouldFailWithError('255.255.65536', 'Invalid net');
        shouldFailWithError('1.2.3.256', 'Invalid net');
        shouldFailWithError('256.0.0.1', 'Invalid net');
    });
});

describe('In-range IPv4 edge values', () => {
    const accepted: [string, number, string][] = [
        ['4294967295', 4294967295, '255.255.255.255'],
        ['0xffffffff', 4294967295, '255.255.255.255'],
        ['0xFFFFFFFF', 4294967295, '255.255.255.255'],
        ['0XFFFFFFFF', 4294967295, '255.255.255.255'],
        ['037777777777', 4294967295, '255.255.255.255'],
        ['255.255.255.255', 4294967295, '255.255.255.255'],
        ['0xff.0xff.0xff.0xff', 4294967295, '255.255.255.255'],
        ['0xFF.0xFF.0xFF.0xFF', 4294967295, '255.255.255.255'],
        ['0377.0377.0377.0377', 4294967295, '255.255.255.255'],
        ['1.16777215', 33554431, '1.255.255.255'],
        ['1.0xffffff', 33554431, '1.255.255.255'],
        ['1.0XFFFFFF', 33554431, '1.255.255.255'],
        ['1.077777777', 33554431, '1.255.255.255'],
        ['255.16777215', 4294967295, '255.255.255.255'],
        ['255.0xffffff', 4294967295, '255.255.255.255'],
        ['255.077777777', 4294967295, '255.255.255.255'],
        ['1.2.65535', 16973823, '1.2.255.255'],
        ['1.2.0xffff', 16973823, '1.2.255.255'],
        ['1.2.0177777', 16973823, '1.2.255.255'],
        ['255.255.65535', 4294967295, '255.255.255.255'],
        ['255.255.0xffff', 4294967295, '255.255.255.255'],
        ['255.255.0177777', 4294967295, '255.255.255.255'],
        ['0', 0, '0.0.0.0'],
    ];

    accepted.forEach(([input, long, base]) => {
        it(`ip2long('${input}') is ${long}`, () => {
            assert.strictEqual(ip2long(input), long);
        });
        it(`Netmask('${input}').base is '${base}'`, () => {
            assert.strictEqual(new Netmask(input).base, base);
        });
    });

    it('127.0.0.0/8 still contains 127.0.0.1', () => {
        assert.strictEqual(new Netmask('127.0.0.0/8').contains('127.0.0.1'), true);
    });
    it('0.0.0.0/32 still contains 0.0.0.0', () => {
        assert.strictEqual(new Netmask('0.0.0.0/32').contains('0.0.0.0'), true);
    });
    it('8.8.8.8/32 still contains 8.8.8.8', () => {
        assert.strictEqual(new Netmask('8.8.8.8/32').contains('8.8.8.8'), true);
    });
    it('1.0.0.0/8 contains the 24-bit maximum 1.16777215', () => {
        assert.strictEqual(new Netmask('1.0.0.0/8').contains('1.16777215'), true);
    });
    it('1.2.0.0/16 contains the 16-bit maximum 1.2.65535', () => {
        assert.strictEqual(new Netmask('1.2.0.0/16').contains('1.2.65535'), true);
    });
    it('255.255.255.255/32 contains the 32-bit maximum', () => {
        assert.strictEqual(new Netmask('255.255.255.255/32').contains('4294967295'), true);
    });
});

describe('Prefix lengths that are not plain decimal integers (#50)', () => {
    shouldFailWithError('1.2.3.4/24abc', 'Invalid mask');
    shouldFailWithError('1.2.3.4/ 24', 'Invalid mask');
    shouldFailWithError('1.2.3.4/0x10', 'Invalid mask');
    shouldFailWithError('1.2.3.4/+8', 'Invalid mask');
    shouldFailWithError('1.2.3.4/1e1', 'Invalid mask');
    shouldFailWithError('2001:db8::/64x', 'Invalid mask');
    shouldFailWithError('2001:db8::/0x10', 'Invalid mask');
    shouldFailWithError('2001:db8::/ 64', 'Invalid mask');
    shouldFailWithError('2001:db8::/', 'Invalid mask');

    it('rejects a fractional mask argument', () => {
        assert.throws(() => new Netmask('1.2.3.4', 0.1), /Invalid mask/);
        assert.throws(() => new Netmask('1.2.3.4', 24.5), /Invalid mask/);
        assert.throws(() => new Netmask('2001:db8::', 64.5), /Invalid mask/);
    });

    it('still accepts integer masks given as numbers or strings', () => {
        assert.strictEqual(new Netmask('1.2.3.4', 24).toString(), '1.2.3.0/24');
        assert.strictEqual(new Netmask('1.2.3.4', '24').toString(), '1.2.3.0/24');
        assert.strictEqual(new Netmask('1.2.3.4/024').toString(), '1.2.3.0/24');
        assert.strictEqual(new Netmask('2001:db8::1', 64).toString(), '2001:db8::/64');
        assert.strictEqual(new Netmask('2001:db8::1/0').toString(), '::/0');
    });
});
