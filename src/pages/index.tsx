import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { useWeb3ModalState } from '@web3modal/wagmi/react'
import { WalletClientSigner, getChain } from '@alchemy/aa-core'
import { AlchemyProvider } from '@alchemy/aa-alchemy'
import {
    LightSmartContractAccount,
    getDefaultLightAccountFactory,
} from '@alchemy/aa-accounts'
import { useAccount, useBalance } from 'wagmi'
import { MetaMaskSDK } from '@metamask/sdk'
import { AAWallet } from '../../components'

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''

export default function Home() {
    const { address } = useAccount()
    console.log('eoa:', address)

    const { selectedNetworkId } = useWeb3ModalState()
    const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
        useState(false)
    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false)

    const closeAll = () => {
        setIsNetworkSwitchHighlighted(false)
        setIsConnectHighlighted(false)
    }

    const create = () => {
        const chain = getChain(selectedNetworkId!)
        const MMSDK = new MetaMaskSDK({
            dappMetadata: {
                name: 'Tyron',
            },
        })

        MMSDK.connect()
            .then(async (accounts) => {
                console.log(
                    'MetaMask SDK is connected',
                    JSON.stringify(accounts, null, 2)
                )
                const providerETH = MMSDK.getProvider()

                const clientAA = createWalletClient({
                    chain: chain,
                    transport: custom(providerETH!),
                })

                // this can now be used as an owner for a Smart Contract Account
                const signer = new WalletClientSigner(
                    clientAA,
                    'json-rpc' //signerType
                )

                //@review
                const entry_point = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

                // Create a provider with your EOA as the smart account owner, this provider is used to send user operations from your smart account and interact with the blockchain
                const providerAA = new AlchemyProvider({
                    apiKey, // Replace with your Alchemy API key, you can get one at https://dashboard.alchemy.com/
                    chain,
                    // Entrypoint address, you can use a different entrypoint if needed, check out https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints
                    entryPointAddress: entry_point,
                }).connect(
                    (rpcClient) =>
                        new LightSmartContractAccount({
                            //@review
                            entryPointAddress: entry_point,
                            chain: rpcClient.chain,
                            owner: signer,
                            //@review
                            factoryAddress: getDefaultLightAccountFactory(
                                rpcClient.chain
                            ), // Default address for Light Account on Sepolia, you can replace it with your own.
                            rpcClient,
                        })
                )

                // Logging the smart account address -- please fund this address with some SepoliaETH in order for the user operations to be executed successfully
                providerAA
                    .getAddress()
                    .then(async (address: string) => {
                        console.log('aa:', address)

                        //@dev smart contract account creation
                        // Send a user operation from your smart contract account
                        const aaa = address.substring(2)
                        const { hash } = await providerAA.sendUserOperation({
                            target: `0x${aaa}`, // Replace with the desired target address
                            data: '0x', // Replace with the desired call data
                            value: BigInt(0), // value: bigint or undefined
                        })

                        console.log('aa creation: ', hash) // Log the user operation hash

                        // get owner
                        providerAA.account
                            .getOwnerAddress()
                            .then((address: string) =>
                                console.log('signer:', address)
                            )
                            .catch((err) => console.error('signer: ' + err))
                    })
                    .catch((err) => console.error('aa: ' + err))
            })
            .catch((err) => console.error(err))
    }

    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [])

    return (
        <>
            <Head>
                <title>Tyron</title>
                <meta name="description" content="Tyron SSI Protocol" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
                <div
                    className={styles.backdrop}
                    style={{
                        opacity:
                            isConnectHighlighted || isNetworkSwitchHighlighted
                                ? 1
                                : 0,
                    }}
                />
                <div className={styles.header}>
                    <div className={styles.buttons}>
                        <div
                            onClick={closeAll}
                            className={`${styles.highlight} ${
                                isNetworkSwitchHighlighted
                                    ? styles.highlightSelected
                                    : ``
                            }`}
                        >
                            <w3m-network-button />
                        </div>
                        <div
                            onClick={closeAll}
                            className={`${styles.highlight} ${
                                isConnectHighlighted
                                    ? styles.highlightSelected
                                    : ``
                            }`}
                        >
                            <w3m-button />
                        </div>
                    </div>
                    <div className={styles.logo}>
                        <Image
                            src="/wallet_connect.svg"
                            alt="WalletConnect"
                            height="32"
                            width="203"
                        />
                    </div>
                </div>
            </header>
            <main className={styles.main}>
                <div className={styles.wrapper}>
                    <div className={styles.container}>
                        <h1>Tyron Self-Sovereign Identity Protocol</h1>
                        <div className={styles.content}>
                            <ul>
                                <li>
                                    Click{' '}
                                    <span
                                        onClick={() => {
                                            setIsConnectHighlighted(
                                                !isConnectHighlighted
                                            )
                                            setIsNetworkSwitchHighlighted(false)
                                        }}
                                        className={styles.button}
                                    >
                                        Connect Wallet
                                    </span>{' '}
                                    to connect to a Web3 wallet.
                                </li>
                                <li>
                                    Click{' '}
                                    <span
                                        onClick={() => {
                                            setIsNetworkSwitchHighlighted(
                                                !isNetworkSwitchHighlighted
                                            )
                                            setIsConnectHighlighted(false)
                                        }}
                                        className={styles.button}
                                    >
                                        Select Network
                                    </span>{' '}
                                    to change networks.
                                </li>
                                <li>
                                    Create a TyronSSI Account with account
                                    abstraction:{' '}
                                    <span
                                        onClick={create}
                                        className={styles.button}
                                    >
                                        Create Account
                                    </span>
                                </li>
                                <li>
                                    Open account wallet:{' '}
                                    <span
                                        onClick={() => setOpen(true)}
                                        className={styles.button}
                                    >
                                        Open Wallet
                                    </span>
                                    {open && <AAWallet />}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.tyronLogo}>
                        <Image
                            src="/ssi_$tyron.svg"
                            alt="Tyron"
                            height="40"
                            width="120"
                        />
                    </div>
                    <div className={styles.footer}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            height={16}
                            width={16}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                            />
                        </svg>
                        <a
                            href="https://docs.walletconnect.com/web3modal/react/about?utm_source=next-starter-template&utm_medium=github&utm_campaign=next-starter-template"
                            target="_blank"
                        >
                            Check out the full documentation here
                        </a>
                    </div>
                </div>
            </main>
        </>
    )
}
