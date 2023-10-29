import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { useWeb3ModalState } from '@web3modal/wagmi/react'
import { MMSDK, aa } from '@/mixins/alchemy'
import { encodeFunctionData } from 'viem'

function Component() {
    const { selectedNetworkId } = useWeb3ModalState()
    const [provider, setProvider] = useState<any>()
    const [uo_hash, setHash] = useState<any>('No')

    //@dev get signer address
    const [signer, setAddress] = useState('Account not created.')

    //@dev get EOAs
    const [accounts, setAccounts] = useState<any>()

    const updateAddr = async () => {
        if (selectedNetworkId) {
            const account = aa(selectedNetworkId)
            await account.providerAA.account
                .getOwnerAddress()
                .then((res) => {
                    console.log('[signer]', res)
                    setProvider(account.providerAA)
                    setAddress(res)
                })
                .catch((err: string) => console.error('[signer]' + err))

            if (uo_hash != 'No') {
                const uo = await account.providerAA.getUserOperationByHash(
                    uo_hash
                )

                console.log('[UO]', JSON.stringify(uo, null, 2))
            }
        }
        MMSDK.connect()
            .then((accounts) => {
                console.log(
                    '[MetaMask SDK connected]',
                    JSON.stringify(accounts, null, 2)
                )
                setAccounts(accounts)
            })
            .catch((err) => console.error('[MMSDK]', err))
    }
    useEffect(() => {
        updateAddr()
    }, [selectedNetworkId])

    const transfer = async () => {
        const accountAddress = accounts[0] as `0x${string}`
        const newOwner = accounts[1] as `0x${string}`

        const { hash, request } = await provider.sendUserOperation({
            target: accountAddress,
            data: encodeFunctionData({
                abi: [
                    {
                        inputs: [
                            {
                                internalType: 'address',
                                name: 'newOwner',
                                type: 'address',
                            },
                        ],
                        name: 'transferOwnership',
                        outputs: [],
                        stateMutability: 'nonpayable',
                        type: 'function',
                    },
                ],
                functionName: 'transferOwnership',
                args: [newOwner],
            }),
        })
        setHash(hash)
        console.log('[UO request]', JSON.stringify(request, null, 2))
    }
    return (
        <div className={styles.container}>
            <div>Current Web3 wallet: {signer}</div>
            <div>
                New Web3 wallet:{' '}
                {accounts
                    ? accounts[1]
                        ? accounts[1]
                        : 'New wallet not connected.'
                    : 'None'}
            </div>
            <span onClick={transfer} className={styles.button}>
                Transfer
            </span>
            <div>User operation confirmed: {uo_hash}</div>
            {uo_hash != 'No' && (
                <span onClick={updateAddr} className={styles.button}>
                    Update
                </span>
            )}
        </div>
    )
}

export default Component
