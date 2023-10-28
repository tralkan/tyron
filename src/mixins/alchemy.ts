import { AlchemyProvider } from '@alchemy/aa-alchemy'
import {
    LightSmartContractAccount,
    getDefaultLightAccountFactory,
} from '@alchemy/aa-accounts'
import { WalletClientSigner, getChain } from '@alchemy/aa-core'
import MetaMaskSDK from '@metamask/sdk'
import { createWalletClient, custom } from 'viem'
import { SupportedChains } from '@alchemy/aa-alchemy'

export const MMSDK = new MetaMaskSDK({
    dappMetadata: {
        name: 'Tyron',
    },
})

//@review
const entry_point = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

// Create a provider with your EOA as the smart account owner, this provider is used to send user operations from your smart account and interact with the blockchain
export const aa = (chain_id: number) => {
    const chain = getChain(chain_id)

    const providerETH = MMSDK.getProvider()
    const client = createWalletClient({
        chain: chain,
        transport: custom(providerETH!),
    })
    console.log('wallet client: ', JSON.stringify(client, null, 2))

    // this can now be used as an owner for a Smart Contract Account
    const signer = new WalletClientSigner(
        client,
        'json-rpc' //signerType
    )

    // @review ask for zkEVM support
    const supported_chain = SupportedChains.get(chain_id)
    console.log(
        'is chain supported by alchemy?',
        JSON.stringify(supported_chain, null, 2)
    )

    let apiKey = ''
    switch (chain.name) {
        case 'Ethereum':
            apiKey = process.env.NEXT_PUBLIC_ETHEREUM_KEY!
            break
        case 'Sepolia':
            apiKey = process.env.NEXT_PUBLIC_SEPOLIA_KEY!
            break
        case 'Polygon':
            apiKey = process.env.NEXT_PUBLIC_POLYGON_KEY!
            break
        case 'Polygon Mumbai':
            apiKey = process.env.NEXT_PUBLIC_MUMBAI_KEY!
            break
        case 'Polygon zkEVM':
            apiKey = process.env.NEXT_PUBLIC_ZKEVM_KEY!
            break
        default:
            ''
            break
    }

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
                factoryAddress: getDefaultLightAccountFactory(rpcClient.chain), // Default address for Light Account on Sepolia, you can replace it with your own.
                rpcClient,
            })
    )

    return {
        providerETH,
        client,
        signer,
        providerAA,
    }
}
