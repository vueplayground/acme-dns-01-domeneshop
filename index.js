export default ({ domain, token, secret, propagationTimeout = 3000, propagationDelay = 5000 }) => {

    const headers = {
        Authorization: `Basic ${Buffer.from(token + ':' + secret, 'utf-8')}`,
        'Content-Type': `application/json`
    }

    let domainId = ''
    let recordIds = []

    return {
        async init(deps) {},
        async zones(args) {
            return [domain]
        },
        async set(args) {
            try {
                const challenge = args.challenge

                let domainsResult = await fetch('https://api.domeneshop.no/v0/domains', {
                    headers
                })
                let domains = await domainsResult.json()

                domainId = domains.find(d => d.domain === domain)?.id

                let result = await fetch(`https://api.domeneshop.no/v0/domains/${domainId}/dns`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        host: challenge.dnsHost.replace(`.${domain}`, ''),
                        ttl: 300, // Smallest possible = 300 / 60 = 5min
                        type: 'TXT',
                        data: challenge.keyAuthorizationDigest
                    })
                })

                recordIds.push({
                    id: (await result.json())?.id,
                    dnsHost: challenge.dnsHost
                })

                // Give some time to let the propagation complete (Can be adjusted to eg. TTL time)
                return new Promise(resolve => setTimeout(resolve, propagationTimeout))
            } catch(e) {
                console.log('Something went wrong: ', e.message)
                return
            }
        },
        async get(args) {
            try {

                const challenge = args.challenge
                const recordId = recordIds.find(r => r.dnsHost === challenge.dnsHost)?.id

                if (!recordId) {
                    throw new Error(`TXT record for ${challenge.dnsHost} not found.`)
                }

                const result = await fetch(`https://api.domeneshop.no/v0/domains/${domainId}/dns/${recordId}`, {
                    headers
                })

                if (result.status !== 200) {
                    throw new Error(`Failed to retrieve TXT record (status: ${result.status})`)
                }

                const recordData = await result.json()

                return recordData.data === challenge.keyAuthorizationDigest
            } catch(e) {
                console.log('Something went wrong: ', e.message)
                return
            }
        },
        async remove(args) {
            try {
                const challenge = args.challenge
                const recordId = recordIds.find(r => r.dnsHost === challenge.dnsHost)?.id
                await fetch(`https://api.domeneshop.no/v0/domains/${domainId}/dns/${recordId}`, {
                    method: 'delete',
                    headers
                })
            } catch(e) {
                console.log('Something went wrong: ', e.message)
                return
            }
        },
        propagationDelay
    }

}