import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { AATransfer, AAWallet } from '../../components'
import { MMSDK, aa } from '@/mixins/alchemy'
import { useWeb3ModalState } from '@web3modal/wagmi/react'

export default function Home() {
    const { selectedNetworkId } = useWeb3ModalState()

    const { address } = useAccount()

    const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
        useState(false)
    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false)

    const closeAll = () => {
        setIsNetworkSwitchHighlighted(false)
        setIsConnectHighlighted(false)
    }

    const create = () => {
        MMSDK.connect()
            .then(async (accounts) => {
                console.log(
                    '[MetaMask SDK connected]',
                    JSON.stringify(accounts, null, 2)
                )

                const account = aa(selectedNetworkId!)
                await account.providerAA
                    .getAddress()
                    .then(async (address: string) => {
                        // Logging the smart account address -- please fund this address with some SepoliaETH in order for the user operations to be executed successfully
                        console.log('[AAA]', address)

                        //@dev smart contract account creation
                        // Send a user operation from your smart contract account
                        const aaa = address.substring(2)
                        const { hash } =
                            await account.providerAA.sendUserOperation({
                                target: `0x${aaa}`, // Replace with the desired target address
                                data: '0x', // Replace with the desired call data
                                value: BigInt(0), // value: bigint or undefined
                            })

                        console.log('[AA creation txn]', hash) // Log the user operation hash
                    })
                    .catch((err: string) => console.error('[AA]' + err))
            })
            .catch((err) => console.error('[AA creation]', err))
    }

    const [open, setOpen] = useState(false)
    const [transfer, setTransfer] = useState(false)

    useEffect(() => {
        console.log('[EOA]', address)
        setOpen(false)
        setTransfer(false)
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
                        <div className={styles.tyronLogo}>
                            <Image
                                src="/ssi_$tyron.svg"
                                alt="Tyron"
                                height="40"
                                width="120"
                            />
                        </div>
                        <h2 className={styles.title}>
                            Self-Sovereign Identity Protocol
                        </h2>
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
                                    Create a TyronSSI account:{' '}
                                    <span
                                        onClick={create}
                                        className={styles.button}
                                    >
                                        Create Account
                                    </span>
                                </li>
                                <li>
                                    Open the account wallet:{' '}
                                    <span
                                        onClick={() => setOpen(true)}
                                        className={styles.button}
                                    >
                                        Open Wallet
                                    </span>
                                    {open && <AAWallet />}
                                </li>
                                <li>
                                    Click{' '}
                                    <span
                                        onClick={() => setTransfer(true)}
                                        className={styles.button}
                                    >
                                        Transfer Account
                                    </span>{' '}
                                    to use with another Web3 wallet.
                                    {transfer && <AATransfer />}
                                </li>
                            </ul>
                        </div>
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
