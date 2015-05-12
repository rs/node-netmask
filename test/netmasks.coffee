vows = require 'vows'
assert = require 'assert'
util = require 'util'
Netmask = require('../lib/netmask').Netmask

fixtures =
[
    # addr                          mask                base                newmask             bitmask
    ['209.157.68.22/255.255.224.0', null,               '209.157.64.0',     '255.255.224.0',    19]
    ['209.157.68.22',               '255.255.224.0',    '209.157.64.0',     '255.255.224.0',    19]
    ['209.157.70.33',               0xffffe000,         '209.157.64.0',     '255.255.224.0',    19]
    ['209.157.70.33/19',            null,               '209.157.64.0',     '255.255.224.0',    19]
    ['209.157.70.33',               null,               '209.157.70.33',    '255.255.255.255',  32]
    ['140.174.82',                  null,               '140.174.82.0',     '255.255.255.0',    24]
    ['140.174',                     null,               '140.174.0.0',      '255.255.0.0',      16]
    ['10',                          null,               '10.0.0.0',         '255.0.0.0',        8]
    ['10/8',                        null,               '10.0.0.0',         '255.0.0.0',        8]
    ['209.157.64/19',               null,               '209.157.64.0',     '255.255.224.0',    19]
    ['209.157.64.0-209.157.95.255', null,               '209.157.64.0',     '255.255.224.0',    19]
    ['216.140.48.16/32',            null,               '216.140.48.16',    '255.255.255.255',  32]
    ['209.157/17',                  null,               '209.157.0.0',      '255.255.128.0',    17]
]

contexts = []

for fixture in fixtures
    [addr, mask, base, newmask, bitmask] = fixture
    context = topic: -> new Netmask(addr, mask)
    context["base is `#{base}'"] = (block) -> assert.equal block.base, base
    context["mask is `#{newmask}'"] = (block) -> assert.equal block.mask, newmask
    context["bitmask is `#{bitmask}'"] = (block) -> assert.equal block.bitmask, bitmask
    context["toString is `#{base}/`#{bitmask}'"] = (block) -> assert.equal block.toString(), block.base + "/" + block.bitmask
    contexts["for #{addr}" + (if mask then " with #{mask}" else '')] = context

vows.describe('Netmaks parsing').addBatch(contexts).export(module)

vows.describe('Netmask contains IP')
    .addBatch
        'block 192.168.1.0/24':
            topic: -> new Netmask('192.168.1.0/24')
            'contains IP 192.168.1.0': (block) -> assert.ok block.contains('192.168.1.0')
            'contains IP 192.168.1.255': (block) -> assert.ok block.contains('192.168.1.255')
            'contains IP 192.168.1.63': (block) -> assert.ok block.contains('192.168.1.63')
            'does not contain IP 192.168.0.255': (block) -> assert.ok not block.contains('192.168.0.255')
            'does not contain IP 192.168.2.0': (block) -> assert.ok not block.contains('192.168.2.0')
            'does not contain IP 10.168.2.0': (block) -> assert.ok not block.contains('10.168.2.0')
            'does not contain IP 209.168.2.0': (block) -> assert.ok not block.contains('209.168.2.0')
            'contains block 192.168.1.0/24': (block) -> assert.ok block.contains('192.168.1.0/24')
            'contains block 192.168.1': (block) -> assert.ok block.contains('192.168.1')
            'contains block 192.168.1.128/25': (block) -> assert.ok block.contains('192.168.1.128/25')
            'does not contain block 192.168.1.0/23': (block) -> assert.ok not block.contains('192.168.1.0/23')
            'does not contain block 192.168.2.0/24': (block) -> assert.ok not block.contains('192.168.2.0/24')
            'toString equals 192.168.1.0/24': (block) -> assert.equal block.toString(), '192.168.1.0/24'
        'block 192.168.0.0/24':
            topic: -> new Netmask('192.168.0.0/24')
            'does not contain block 192.168': (block) -> assert.ok not block.contains('192.168')
        'block 10.1.2.0/24':
            topic: ->  new Netmask('10.1.2.0/24')
            'contains 10.1.2.10/29': (block) -> assert.ok block.contains('10.1.2.10/29')
            'contains 10.1.2.10/31': (block) -> assert.ok block.contains('10.1.2.10/31')
            'contains 10.1.2.20/32': (block) -> assert.ok block.contains('10.1.2.20/32')
        'block 0.0.0.0/0':
            topic: ->  new Netmask('0.0.0.0/0')
            'contains 10.1.2.10/29': (block) -> assert.ok block.contains('10.1.2.10/29')
    .export(module)

vows.describe('Netmask forEach')
    .addBatch
        'block 192.168.1.0/24':
            topic: -> new Netmask('192.168.1.0/24')
            'should loop through all ip addresses': (block) ->
                called = 0
                block.forEach (ip, long, index) ->
                    called = index
                assert.equal (called + 1), 254
        'block 192.168.1.0/23':
            topic: -> new Netmask('192.168.1.0/23')
            'should loop through all ip addresses': (block) ->
                called = 0
                block.forEach (ip, long, index) ->
                    called = index
                assert.equal (called + 1), 510
    .export(module)
