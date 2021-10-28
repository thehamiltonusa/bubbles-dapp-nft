import { useCallback,useMemo,useEffect, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';
import { addresses, abis } from "@project/contracts";
//import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import { ethers } from "ethers";

import useWeb3Modal from "./useWeb3Modal";


//const APIURL_RINKEBY = "https://api.studio.thegraph.com/query/6693/snowflakes-rinkeby/0.0.1";
//const APIURL_XDAI = "https://api.studio.thegraph.com/query/6693/snowflakes-xdai/0.0.1";


function useContract() {

  const {provider,coinbase,netId,connecting} = useWeb3Modal();
  const [token,setToken] = useState();
  const [getData,setGetData] = useState();
  const [client,setClient] = useState();
  const [mints,setMints] = useState();
  const [totalSupply,setSupply] = useState();
  const [creators,setCreators] = useState([]);
  const [nfts,setNfts] = useState([]);
  const [checkingEvents,setCheckingEvents] = useState(false);

  const [myNfts,setMyNfts] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState([]);

  const [loadingNFTs,setLoadingNFTs] = useState();
  const [previousNetId,setPreviousNetId] = useState();
  const [previousCoinbase,setPreviousCoinbase] = useState();
  const [previousProvider,setPreviousProvider] = useState();

  let ids = [];

  const getMetadata = async(id,erc1155) => {
    const uriToken = await erc1155.uri(id);
    const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
    fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    return(metadataToken)
  }

  const getTotalSupply = useCallback(async () => {

    const totalSupply = Number(await token.totalSupply());
    setSupply(totalSupply);
    return(totalSupply)
  },[token])

  const getCreator = useCallback(async (id) => {
    const creator = await token.creators(id);
    //const creator = res.returnValues._to;
    let profile;
    let getProfile = true;
    creators.map(str => {
      const obj = JSON.parse(str);
      if(obj.address === creator){
        getProfile = false;
        profile = obj.profile
      }
    });
    if(getProfile){
      try{
        profile = await getLegacy3BoxProfileAsBasicProfile(creator);
      } catch(err){

      }

    }
    const creatorProfile = {
      address: creator,
      profile: profile
    }
    if(!creators.includes(JSON.stringify(creatorProfile))){
      const newCreators = creators;
      newCreators.push(JSON.stringify(creatorProfile));
      setCreators([...newCreators]);
    }
    return(creatorProfile)
  },[token,creators])

  const handleEvents = useCallback(async(err,res) => {
    try{
      if(res.address !== token.address){
        Promise.reject("Changed network")
      }
      const id = res.returnValues._id;
      if(ids.includes(id)){
        return;
      }
      const creator = await token.creators(id);
      const metadata = await getMetadata(id,token)
      getLegacy3BoxProfileAsBasicProfile(creator).then(profile => {
        const creatorProfile = {
          address: creator,
          profile: profile
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){
          const newCreators = creators;
          newCreators.unshift(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      }).catch(err => {
        console.log(err);
        const creatorProfile = {
          address: creator,
          profile: undefined
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){

          const creatorProfile = {
            address: creator,
            profile: undefined
          }
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      });
      const obj = {
        address: res.address,
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator
      }
      if(!nfts.includes(JSON.stringify(obj))){
        const newNfts = nfts;
        newNfts.push(JSON.stringify(obj));
        setNfts([...newNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                })]);
      }
      if(coinbase && creator){
        if(coinbase.toLowerCase() === creator.toLowerCase() && !myNfts.includes(JSON.stringify(obj))){
          const newMyNfts = myNfts;
          newMyNfts.push(JSON.stringify(obj));
          setMyNfts([...newMyNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                    })]);
        }
        const balance = await token.balanceOf(coinbase,id);
        if(balance > 0 && !myOwnedNfts.includes(JSON.stringify(obj))){
          const newMyOwnedNfts = myOwnedNfts;
          newMyOwnedNfts.push(JSON.stringify(obj));
          setMyOwnedNfts([...newMyOwnedNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                        })]);
        }

      }


      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[creators,token,coinbase,nfts,myNfts,myOwnedNfts,ids,getCreator,previousNetId,netId])

  const handleEventsSubgraph = useCallback(async(res) => {
    try{
      if(res.address !== token.address){
        Promise.reject("Changed network")
      }
      const id = res.id;
      const returnValues = {
        _id: id
      }
      if(ids.includes(id)){
        return;
      }
      //const metadata = JSON.parse(await ipfs.cat(res.metadata.replace("ipfs://","")))
      const metadata = JSON.parse(await (await fetch(`${res.metadata.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
      fetch(metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));

      const creator = res.creator;

      const obj = {
        address: res.address,
        returnValues: returnValues,
        metadata: metadata,
        creator: creator
      }
      if(!nfts.includes(JSON.stringify(obj))){
        const newNfts = nfts;
        newNfts.push(JSON.stringify(obj));
        setNfts([...newNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                })]);
      }
      if(coinbase && creator){
        if(coinbase.toLowerCase() === creator.toLowerCase() && !myNfts.includes(JSON.stringify(obj))){
          const newMyNfts = myNfts;
          newMyNfts.push(JSON.stringify(obj));
          setMyNfts([...newMyNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                    })]);
        }
        const owner = res.owner;
        if(owner.toLowerCase() === coinbase.toLowerCase() && !myOwnedNfts.includes(JSON.stringify(obj))){
          const newMyOwnedNfts = myOwnedNfts;
          newMyOwnedNfts.push(JSON.stringify(obj));
          setMyOwnedNfts([...newMyOwnedNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                        })]);
        }

      }


      if(id <= 1){
        setLoadingNFTs(false);
      }


      getLegacy3BoxProfileAsBasicProfile(creator).then(profile => {
        const creatorProfile = {
          address: creator,
          profile: profile
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }

      }).catch(err => {
        console.log(err);
        const creatorProfile = {
          address: creator,
          profile: undefined
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){

          const creatorProfile = {
            address: creator,
            profile: undefined
          }
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      });




      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[token,coinbase,creators,nfts,myNfts,myOwnedNfts])


  useMemo(() => {
    if(provider && netId && !token){
      ids = [];
      let newClient;
      let newToken = new ethers.Contract(addresses.erc1155.polygon,abis.erc1155p,provider);
      if(netId === 4){
        newToken = new ethers.Contract(addresses.erc1155.rinkeby,abis.erc1155,provider)
        /*
        newClient = new ApolloClient({
          uri: APIURL_RINKEBY,
          cache: new InMemoryCache()
        });
        */
      }
      if(netId === 0x64){
        newToken = new ethers.Contract(addresses.erc1155.xdai,abis.erc1155,provider)
        /*
        newClient = new ApolloClient({
          uri: APIURL_XDAI,
          cache: new InMemoryCache()
        });
        */
      }
      if(netId === 0x38){
        newToken = new ethers.Contract(addresses.erc1155.bsc,abis.erc1155,provider)
      }
      setToken(newToken)
      //setClient(newClient);
    }
  },[
    token,
    provider,
    netId
  ])



  useEffect(() => {
    //if(netId !== 0x89){
      setSupply(null);
      setMints(null);
      setNfts([]);
      setMyNfts([]);
      setMyOwnedNfts([]);
      setCreators([]);
      setGetData(false);
      setCheckingEvents(false);
      setToken(null);
      setLoadingNFTs(true);
    //}
  },[
    netId,
    coinbase
  ])

  useEffect(() => {
    if(token){

      getTotalSupply();
    }
  },[
    token
  ])

  useMemo(async () => {
    if(token && !checkingEvents){
      token.on("URI", async (value,id) => {
        const res = {
          address: token.address,
          returnValues: {
            _id: id,

          }
        }
        setLoadingNFTs(true);
        await getTotalSupply();
        await handleEvents(null,res);
        setLoadingNFTs(false);

      });
      setCheckingEvents(true);
    }
  },[
    token,
    checkingEvents
  ])


  useMemo(async () => {



    if(totalSupply && nfts?.length === 0  && !getData && token){
      setGetData(true);
      setLoadingNFTs(true);
      if(Number(totalSupply) === 0){
        setLoadingNFTs(false);
        return
      }
      let promises = [];
      /*

      let id = totalSupply;
      let tokensQuery = `
        query {
              tokens(orderBy: tokenID,
                     orderDirection:desc,
                     where: {
                      tokenID_lte: ${id}
                    }) {
              id
              tokenID
              metadataURI
              creator {
                id
              }
              owner {
                id
              }
            }
        }
      `
      let totalQueries = id % 100;
      let actualQuery = 1;
      if(totalQueries > Number(id % 100).toFixed(0)){
        totalQueries = totalQueries + 1;
      }
      while(actualQuery <= totalQueries){
        const results = await client.query({
          query: gql(tokensQuery)
        });
        const tokens = results.data.tokens;
        for(const token of tokens){
          if(token.metadataURI.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
            continue;
          }
          await handleEventsSubgraph({
                  address: token.address,
                  id: token.tokenID,
                  owner: token.owner.id,
                  creator: token.creator.id,
                  metadata: token.metadataURI
          });
        }
        id = id - 100;
        actualQuery = actualQuery + 1;
        if(id <= 0 || actualQuery > totalQueries){
          break;
        }
        tokensQuery = `
          query {
                tokens(orderBy: tokenID,
                       orderDirection:desc,
                       where: {
                        tokenID_lte: ${id}
                      }) {
                id
                tokenID
                metadataURI
                creator {
                  id
                }
                owner {
                  id
                }
              }
          }
        `
      }
      */

      for(let i = totalSupply; i >= 1 ; i--){

        const res = {
          address: token.address,
          returnValues: {
            _id: i
          }
        };
        try{
          await handleEvents(null,res)
        } catch(err){
          console.log(err)
        }
        if(i === 1){
          setLoadingNFTs(false);
        }
      }

    }


  },[
    token,
    nfts,
    totalSupply,
    getData,
  ])

  return({token,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata,getTotalSupply})
}

export default useContract;
