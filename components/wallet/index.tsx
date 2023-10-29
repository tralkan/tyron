import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { useBalance } from 'wagmi'
import { useWeb3ModalState } from '@web3modal/wagmi/react'
import { aa } from '@/mixins/alchemy'

function Component() {
    const { selectedNetworkId } = useWeb3ModalState()
    //@dev get address
    const [aaa, setAddress] = useState(
        '0x0000000000000000000000000000000000000000'
    )

    const update = async () => {
        if (selectedNetworkId) {
            const account = aa(selectedNetworkId)
            await account.providerAA
                .getAddress()
                .then((address: string) => {
                    console.log('[AAA]', address)
                    setAddress(address)
                })
                .catch((err: string) => console.error('[AAA]' + err))

            // verify deployment
            await account.providerAA.account
                .isAccountDeployed()
                .then((res) => console.log('[is aa deployed]', res))
                .catch((err: string) => console.error('[deployment]' + err))
        }
    }
    useEffect(() => {
        update()
    }, [selectedNetworkId])

    //@dev get balance
    const { data, isError, isLoading } = useBalance({
        address: `0x${aaa.substring(2)}`,
    })

    if (!selectedNetworkId) return <div>Click Connect Wallet</div>
    if (isLoading)
        return <div className={styles.container}>Fetching balance…</div>
    if (isError)
        return <div className={styles.container}>Error fetching balance</div>
    return (
        <div className={styles.container}>
            <div>Address: {aaa}</div>
            <div>
                Balance: {data?.formatted} {data?.symbol}
            </div>
        </div>
    )
}

export default Component
