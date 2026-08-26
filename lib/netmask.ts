import { ip2long, long2ip, Netmask4Impl } from './netmask4';
import { ip6bigint, bigint2ip6, Netmask6Impl } from './netmask6';

type NetmaskImpl = Netmask4Impl | Netmask6Impl;

class Netmask {
    base: string;
    mask: string;
    hostmask: string;
    bitmask: number;
    maskLong: number;
    netLong: number;
    size: number;
    first: string;
    last: string;
    broadcast: string | undefined;

    private _impl: NetmaskImpl;

    constructor(net: string, mask?: string | number) {
        if (typeof net !== 'string') {
            throw new Error("Missing `net' parameter");
        }

        // Detect IPv6: check the address part (before any /) for ':'
        const addrPart = net.indexOf('/') !== -1 ? net.substring(0, net.indexOf('/')) : net;
        if (addrPart.indexOf(':') !== -1) {
            this._impl = new Netmask6Impl(net, mask as number | undefined);
        } else {
            this._impl = new Netmask4Impl(net, mask);
        }

        this.base = this._impl.base;
        this.mask = this._impl.mask;
        this.hostmask = this._impl.hostmask;
        this.bitmask = this._impl.bitmask;
        this.size = this._impl.size;
        this.first = this._impl.first;
        this.last = this._impl.last;
        this.broadcast = this._impl.broadcast;

        if (this._impl instanceof Netmask4Impl) {
            this.maskLong = this._impl.maskLong;
            this.netLong = this._impl.netLong;
        } else {
            this.maskLong = 0;
            this.netLong = 0;
        }
    }

    contains(ip: string | Netmask): boolean {
        if (typeof ip === 'string') {
            // If it has a '/', it's a CIDR block — wrap it
            if (ip.indexOf('/') > 0) {
                ip = new Netmask(ip);
            }
            // IPv4 shorthand (fewer than 4 octets, no colons) — wrap it
            else if (ip.indexOf(':') === -1 && ip.split('.').length !== 4) {
                ip = new Netmask(ip);
            }
        }
        if (ip instanceof Netmask) {
            return this.contains(ip.base) && this.contains(ip.broadcast || ip.last);
        }
        // Plain IP string. Reject a different-family address before delegating:
        // the impl parser throws on an other-family address instead of returning a
        // boolean, which would crash callers using contains() as a predicate (#62).
        // Detect the address family the same way the constructor does — a ':' means
        // IPv6 — and avoid the security-sensitive parsing internals entirely.
        const addrIsV6 = (ip as string).indexOf(':') !== -1;
        const rangeIsV6 = this._impl instanceof Netmask6Impl;
        if (addrIsV6 !== rangeIsV6) {
            return false;
        }
        // Same-family plain IP string — delegate to impl
        return this._impl.contains(ip as string);
    }

    next(count: number = 1): Netmask {
        const nextImpl = this._impl.next(count);
        const result = new Netmask(nextImpl.base, nextImpl.bitmask);
        return result;
    }

    /** @deprecated */
    forEach(fn: (ip: string, long: number, index: number) => void): void {
        this._impl.forEach(fn);
    }

    toString(): string {
        return this._impl.toString();
    }
}

export { Netmask, ip2long, long2ip };
