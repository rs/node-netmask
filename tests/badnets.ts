import * as assert from 'assert';
import { Netmask } from '../lib/netmask';

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

describe('IP components larger than 32 bits', () => {
    // 4294967423 is 2^32 + 127: it must not wrap around to 127.0.0.1 (#50)
    shouldFailWithError('4294967423.0.0.1', 'Invalid net');
    shouldFailWithError('4294967423', 'Invalid net');
    shouldFailWithError('4294967296/8', 'Invalid net');
    shouldFailWithError('0x100000000', 'Invalid net');
    shouldFailWithError('040000000000', 'Invalid net');
    shouldFailWithError('1.4294967298', 'Invalid net');
    shouldFailWithError('10.0.0.0/4294967551.0.0.0', 'Invalid mask');

    it('contains() does not match 4294967423.0.0.1 against 127.0.0.0/8', () => {
        assert.throws(() => new Netmask('127.0.0.0/8').contains('4294967423.0.0.1'));
    });
});
