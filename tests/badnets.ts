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
