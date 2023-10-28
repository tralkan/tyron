import React, { useState } from 'react'
import styles from './styles.module.scss'
import { useBalance } from 'wagmi'
import { useWeb3ModalState } from '@web3modal/wagmi/react'
import { getChain } from '@alchemy/aa-core'
import { aa } from '@/mixins/alchemy'

function Component() {
    const { selectedNetworkId } = useWeb3ModalState()
    //@dev get address
    const [aaa, setAddress] = useState(
        '0x0000000000000000000000000000000000000000'
    )

    if (selectedNetworkId) {
        const account = aa(selectedNetworkId)
        account.providerAA
            .getAddress()
            .then(async (address: string) => {
                setAddress(address)
            })
            .catch((err: string) => console.error('aaa: ' + err))
    }

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
