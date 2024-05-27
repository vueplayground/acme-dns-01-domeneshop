# [acme-dns-01-domeneshop](https://github.com/vueplayground/acme-dns-01-domeneshop/blob/master/index.js)

Domeneshop + Let's Encrypt for Node.js

This handles ACME dns-01 challenges, compatible with ACME.js and Greenlock.js.

# Install

```bash
npm i --s acme-dns-01-domeneshop
```

Generate Domeneshop API Token:

- <https://www.domeneshop.no/admin?view=api>

# Usage

First you create an instance with your credentials:

```js
import dns01 from 'acme-dns-01-domeneshop'
```

Then you can use it with any compatible ACME library,
such as Greenlock.js or ACME.js.

### Greenlock.js

```js
import Greenlock from 'greenlock-express'

const greenlock = Greenlock.create({
    challenges: {
        'dns-01': dns01({
            domain,
            token,
            secret,
            propagationTimeout: 3000, // (optional)
            propagationDelay: 5000 // (optional)
        })
    }
})
```

See [Greenlock Express](https://git.rootprojects.org/root/greenlock-express.js)
and/or [Greenlock.js](https://git.rootprojects.org/root/greenlock.js)
documentation for more details.

### ACME.js

```js
let pems = await acme.certificates.create({
    account,
    accountKey,
    csr,
    domains,
    challenges: {
        'dns-01': dns01({
            domain: topLevelDomain,
            token: provider?.key,
            secret: provider?.secret,
            propagationTimeout: 3000, // (optional)
            propagationDelay: 5000 // (optional)
        })
    }
})
```

See the [ACME.js](https://git.rootprojects.org/root/acme-v2.js) for more details.

# Authors

- Siglar Development AS
