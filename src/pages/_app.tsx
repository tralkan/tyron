import '@/styles/globals.css'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import {
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    polygonZkEvm,
} from 'wagmi/chains'

const chains = [mainnet, sepolia, polygon, polygonMumbai, polygonZkEvm]

// 1. Get projectID at https://cloud.walletconnect.com

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || ''

const metadata = {
    name: 'Tyron',
    description: 'Tyron SSI Protocol',
    url: 'https://tyron.network',
    icons: ['https://avatars.githubusercontent.com/u/87374296?v=4'],
}

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })

export default function App({ Component, pageProps }: AppProps) {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    }, [])
    return (
        <>
            {ready ? (
                <WagmiConfig config={wagmiConfig}>
                    <Component {...pageProps} />
                </WagmiConfig>
            ) : null}
        </>
    )
}
