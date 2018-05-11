# LNPoker - A bitcoin Lightning Network Poker game

Hack BTC TLV - 2018

This project implements a texas holdem poker game over the lightning network.
The innovation of our project is that while the game is conducted by a server, **only the funds of the current hand is ever at (counterparty) risk** - the chip stack of users are always in their possession.

Moreover, the randomness of each hand is collected from all active participants and is verifiably fair.
the server's `Random` is seeded before each hand as following:
```python
server: generate random seed r
        send sha256(r) to all clients
client i: receive sha256(r) from server
          generate random seed s_i and send it to server
server: concatenate all the seed rand_seed=s_1|...|s_n|r
        use sha256(rand_seed) to generate randomness for current hand

// after hand finishes
server: reveal rand_seed to all players
client i: can verify that s_i appears in rand_seed
          extract r from rand_seed and check sha256(r) as given before
          simulate and verify sha256(rand_seed) as randomness for hand play
```

![screenshot](https://github.com/UriSha/pypoker/blob/master/LNPoker_screenshot.png)
## Prerequisites

in order to run the poker server you need to have the following apps:
- redis
- python 2.7
- lnd
- btcd
- grpc for python

## Recommended Lightning Network "getting started" guides

- setting up lnd with bitcoind: https://freedomnode.com/blog/107/how-to-install-and-use-lightning-network-with-bitcoind-on-the-bitcoin-mainnet
- setting up lnd with btcd: https://dev.lightning.community/guides/installation/
- python & lnd: https://github.com/lightningnetwork/lnd/blob/master/docs/grpc/python.md
- JS & lnd: https://github.com/lightningnetwork/lnd/blob/master/docs/grpc/python.md
- lnd API referance: https://api.lightning.community/?javascript#sendpayment
- LN technical overview: https://dev.lightning.community/overview/

## Installation
### setting up lnd nodes and channels

#### Useful aliases:
```shell
alias simctl="btcctl --simnet --rpcuser=hackme --rpcpass=hackme"
alias simbtcd="btcd --simnet --txindex --rpcuser=hackme --rpcpass=hackme"

alias alicelnd="lnd --rpclisten=localhost:10001 --listen=localhost:10011 --restlisten=localhost:8001 --datadir=~/gocode/dev/alice/data --logdir=~/gocode/dev/alice/log"
alias boblnd="lnd --rpclisten=localhost:10002 --listen=localhost:10012 --restlisten=localhost:8002 --datadir=~/gocode/dev/bob/data --logdir=~/gocode/dev/bob/log"
alias charlielnd="lnd --rpclisten=localhost:10003 --listen=localhost:10013 --restlisten=localhost:8003 --datadir=~/gocode/dev/charlie/data --logdir=~/gocode/dev/charlie/log"
alias serverlnd="lnd --rpclisten=localhost:10009 --listen=localhost:10019 --restlisten=localhost:8009 --datadir=~/gocode/dev/server/data --logdir=~/gocode/dev/server/log"


alias alicectl="lncli --rpcserver=localhost:10001 --no-macaroons"
alias bobctl="lncli --rpcserver=localhost:10002 --no-macaroons"
alias charliectl="lncli --rpcserver=localhost:10003 --no-macaroons"
alias serverctl="lncli --rpcserver=localhost:10009 --no-macaroons"
```

#### Scripts:

`reset-lnd.sh` (reset btcd and get mining addres):
```shell
#!/bin/sh
killall lnd
killall btcd
sleep 3
simbtcd > /dev/null &
sleep 2
serverlnd > /dev/null &
sleep 2
serverctl newaddress np2wkh
```

reset btcd andlightning nodes (players & server)
```shell
#!/bin/sh
##kill all running daemons + btcd
killall lnd
killall btcd
sleep 3

# restart btcd, wait and then lnds
simbtcd --miningaddr="$1" > lnd.log &
sleep 3
alicelnd >> lnd.log &
boblnd >> lnd.log &
charlielnd >> lnd.log &
serverlnd >> lnd.log &
```

#### Configs:

`lnd.conf`
```conf
[Application Options]
debuglevel=info
debughtlc=true

no-macaroons=true
noencryptwallet=1

[Bitcoin]
bitcoin.simnet=1
bitcoin.active=1
bitcoin.node=btcd

[btcd]
btcd.rpcuser=hackme
btcd.rpcpass=hackme
```

### Setting up poker server
```shell
$ python texasholdem_poker_service.py &
$ python client_web.py &
```

### Setting up players
each player needs to have its lnd node defined in the JS scripts running on the client side.
this project assumes all lnd nodes run locally under:
```javascript
https://localhost:10001
```

## Credits

The Graphical User Interface and most of the gaming logic is based on https://github.com/epifab/pypoker
