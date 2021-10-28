import React,{ useState,useMemo,useEffect,useContext } from 'react'




/**
 * Our custom React hook to manage state
 */

 const AppContext = React.createContext({})



const useAppState = () => {
  const initialState = {
    token: null,
    coinbase: null,
    loadingNFTs: true,
    netId: null,
    nfts: [],
    myNfts: [],
    myOwnedNfts: [],
    creators: [],
    profile: null,
    connecting : false,
  }

  // Manage the state using React.useState()
  const [state, setState] = useState(initialState)

  // Build our actions. We'll use useMemo() as an optimization,
  // so this will only ever be called once.
  const actions = useMemo(() => getActions(setState), [setState])

  return { state, actions }
}

// Define your actions as functions that call setState().
// It's a bit like Redux's dispatch(), but as individual
// functions.
const getActions = (setState) => ({
  setProvider: (provider) => {
    setState((state) => ({ ...state, provider: provider }))
  },
  setToken: (token) => {
    setState((state) => ({ ...state, token: token }))
  },
  setNetId: (netId) => {
    setState((state) => ({ ...state, netId: netId }))
  },
  setCoinbase: (coinbase) => {
    setState((state) => ({ ...state, coinbase: coinbase }))
  },
  setNfts: (nfts) => {
    setState((state) => ({ ...state, nfts: nfts }))
  },
  setMyNfts: (myNfts) => {
    setState((state) => ({ ...state, myNfts: myNfts }))
  },
  setMyOwnedNfts: (myOwnedNfts) => {
    setState((state) => ({ ...state, myOwnedNfts: myOwnedNfts }))
  },
  setLoadingNFTs: (loading) => {
    setState((state) => ({ ...state, loadingNFTs: loading }))
  },
  setCreators: (creators) => {
    setState((state) => ({ ...state, creators: creators }))
  },
  setTotalSupply: (supply) => {
    setState((state) => ({ ...state, totalSupply: supply }))
  },
  setProfile: (profile) => {
    setState((state) => ({ ...state, profile: profile }))
  },
  setConnecting: (connecting) => {
    setState((state) => ({ ...state, connecting: connecting }))
  },
})


const useAppContext = () => {
  return useContext(AppContext)
}

export { AppContext, useAppState, useAppContext }
