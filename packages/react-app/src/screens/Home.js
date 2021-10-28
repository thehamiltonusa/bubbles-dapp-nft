import React,{useState,useMemo,useCallback} from 'react';
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import {
  Box,
  Heading,
  Flex ,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  HStack,
  useToast,
  Spinner,
  Text
 } from '@chakra-ui/react';
import { SavedIcon, TwitterIcon, BookmarkIcon } from '../components/Common/Icons';

import ReactDOMServer from 'react-dom/server';
import SEO from '../components/SEO';
import BlobSettingsSection from '../components/BlobSettingsSection';
import BlobActionBar from '../components/BlobActionBar';
import Logo from '../components/Common/Logo';
import BlobContainer from '../components/BlobContainer';
import NavLinks from '../components/NavLinks';
import Nav from '../components/Nav';

import Layout from '../components/Layout';
import Modal from '../components/Common/Modal';
import { QuestionIcon } from '../components/Common/Icons';
import IPFS from 'ipfs-http-client-lite';
import Blob from '../components/Blob';
import { dynamic } from '../state';

import "../css/custom.css";


import useWeb3Modal from "../hooks/useWeb3Modal";
import useContract from "../hooks/useContract";


const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})

function Home(){

  const toast = useToast();

  const {provider,coinbase,netId,profile,connecting,loadWeb3Modal} = useWeb3Modal();
  const {token,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata} = useContract();

  const [inputs,setInputs] = useState([]);
  const [minting,setMinting] = useState(false);



  const mint = useCallback(async () => {

    try{

    setMinting(true)

    const blob = JSON.parse(localStorage.getItem('blobs'))[0];
    console.log(blob)
    const blobSVG =  <Blob {...blob} />
    const lastTokenId = Number(totalSupply);
    const tokenId = lastTokenId + 1;
    const imgres = await ipfs.add(ReactDOMServer.renderToString(blobSVG));


    console.log(imgres)
    let name = inputs["name"];
    if(!name){
      name = blob.name;
    }
    for(let i = 1;i<=totalSupply;i++){
      const metadata = await getMetadata(i,token);
      if(metadata.image===`ipfs://${imgres.path}` || metadata.name.toLowerCase() === name.toLowerCase()){
        alert("Token with same image or name was already minted");
        setMinting(false)
        return;
      }
    }
    const allTxs = await provider.getTransactionCount(coinbase,'pending');
    const confirmedTxs = await provider.getTransactionCount(coinbase);
    if(allTxs > confirmedTxs){
      alert("Wait all pending txs be confirmed");
      setMinting(false)
      return;
    }

    let color = blob.color;
    if(blob.type === "gradient"){
      color = ` { from: ${ blob.colors[0]} , to : ${blob.colors[1]} }`;
    } else if(blob.type === "image"){
          color = null
    }

    let pattern;
    if(blob.type === "pattern"){
      pattern = blob.pattern;
    }
    let metadata = {
        name: name,
        image: `ipfs://${imgres[0].hash}`,
        external_url: `https://uniquebubbles.com/`,
        description: inputs["description"],
        attributes: [
          {
              trait_type: "Type",
              value: blob.type
          },
          {
              trait_type: "Color",
              value: color
          },
          {
              trait_type: "Edges",
              value: blob.edges
          },
          {
              trait_type: "Growth",
              value: blob.growth
          },
          {
              trait_type: "Outlined",
              value: blob.isOutline
          },
          {
              trait_type: "Pattern",
              value: pattern
          },
          {
              trait_type: "Seed",
              value: blob.seed
          }
        ]
    }
    const res = await ipfs.add(JSON.stringify(metadata));
    const uri = res[0].hash;
    //const uri = res.path;
    console.log(uri);
    const fees = [{
      recipient: coinbase,
      value: 500
    }];
    let value = '1';
    if(netId === 0x38){
      value = '0.0018'
    }
    const signer = provider.getSigner()

    const tokenWithSigner = token.connect(signer);
    let method;
    if(netId === 0x89){
      method = tokenWithSigner.mint(fees,uri,{
        value: ethers.utils.parseEther(value),
      });
    } else {
      method = tokenWithSigner.mint(tokenId,fees,1, uri,{
        value: ethers.utils.parseEther(value),
      });
    }
    const tx = await method;
    await tx.wait();
    setMinting(false)
    return(true);

    } catch(err){
      setMinting(false)
      console.log(err)
    }

  },[
    totalSupply,
    coinbase,
    getMetadata,
    token,
    provider
  ])


  const handleOnChange = async e => {
    e.preventDefault();
    let newInputs = inputs;
    newInputs[e.target.name] = e.target.value;
    setInputs(newInputs);
  }


  return(
    <Layout>
      <SEO
        title="UniqueBubbles - generate bubbles as NFT on xDAI, BSC and Polygon (Matic) network!"
        description="Mint customizable Bubbles as NFT. Create random or fixed blobs, loop, animate, clip them with ease"
      />
      <Nav loadWeb3Modal={loadWeb3Modal} coinbase={coinbase} netId={netId} connecting={connecting}/>
      <Flex wrap="wrap" flex="1">
        <Flex
          align="center"
          justify="center"
          direction="column"
          my="4"
          w="full"
          style={{textAlign: "center"}}
          display={{  lg: 'flex' }}
        >
          <Logo />
          <Heading fontSize="3xl" variant="main">
            Generate and mint bubbles
          </Heading>

        </Flex>
        <Box
          w={{ base: '100%', lg: 8 / 12 }}
          justifyContent="center"
          alignItems="center"
          display="flex"
          flexDirection="column"
        >
          {
            (
              coinbase &&
              (
                <p>Logged as {coinbase}</p>
              )
            )
          }
          <Box w={{ base: '100%', lg: 500 }} h={{ lg: 500 }}>
            <BlobContainer />
          </Box>
          <BlobActionBar />
        </Box>

        <Box
          flex="1"
          display="flex"
          alignItems="center"
          w={{ base: '100%', lg: 4 / 12 }}
        >
          <Box w="full">
            <Flex
              align="center"
              justify="center"
              direction="column"
              mb="8"
              display={{ sm: 'flex',lg: 'flex' }}
              style={{textAlign: "center"}}
            >
              <Heading fontSize="3xl" variant="main">
                Generate bubbles
              </Heading>
              <small>
              {
                netId === 0x38 ?
                <p>0.0018 BNB = 1 Bubble</p> :
                netId === 0x89 ?
                <p>1 Matic = 1 Bubble</p> :
                <p>1 xDai = 1 Bubble</p>

              }

              <p>Only {netId === 0x89 ? 10000 : 200000} Unique Bubbles will ever exist.</p>
              </small>
              {
                netId && totalSupply &&
                <>
                {
                  totalSupply >= 0 && netId === 0x89 ?
                  <p><b>Bubbles left: {10000 - totalSupply}</b></p> :
                  totalSupply >= 0 && <p><b>Bubbles left: {200000 - totalSupply}</b></p>
                }
                </>
              }
              <Modal
                title="Info"
                size="md"
                src={
                  <center>
                    <Button
                      variant="silent"
                      leftIcon={<QuestionIcon fontSize="lg" />}
                      aria-label="Info"
                      style={{display:"block"}}
                    >
                      Info
                    </Button>
                  </center>
                }
              >
                <Box>
                  <small>
                  <p>xDai Token at: <a href={`https://blockscout.com/xdai/mainnet/address/${addresses.erc1155.xdai}`} target="_blank" rel="noreferrer">{addresses.erc1155.xdai}</a></p>
                  <br />
                  <p>Polygon Token at: <a href={`https://polygonscan.com/address/${addresses.erc1155.polygon}`} target="_blank" rel="noreferrer">{addresses.erc1155.polygon}</a></p>
                  <br />
                  <p>BSC Token at: <a href={`https://bscscan.com/address/${addresses.erc1155.bsc}`} target="_blank" rel="noreferrer">{addresses.erc1155.bsc}</a></p>
                  <br />
                  <p>Rinkeby Token at: <a href={`https://rinkeby.etherscan.io/token/${addresses.erc1155.rinkeby}`} target="_blank" rel="noreferrer">{addresses.erc1155.rinkeby}</a></p>
                  <br />
                  <p><a href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" target="_blank" rel="noreferrer" >How to connect to xDai sidechain</a></p>
                  <p><a href="https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844" target="_blank" rel="noreferrer" >How to connect to Polygon sidechain</a></p>
                  <p><a href="https://docs.binance.org/smart-chain/wallet/metamask.html" target="_blank" rel="noreferrer" >How to connect to Binance Smart Chain</a></p>

                  </small>

                </Box>
              </Modal>
            </Flex>
            <BlobSettingsSection />
            <Box>
              <label > Name < /label>
              <Input
                type = "text"
                onChange = {
                  handleOnChange
                }
                name = 'name'
               / >
            </Box>
            <Box>
              <label > Description < /label>
              <Input
                type = "text"
                onChange = {
                  handleOnChange
                }
                name = 'description'
               / >
            </Box>
            {
              coinbase &&
              <NavLinks coinbase={coinbase} minting={minting} connecting={connecting} mint={mint} loadWeb3Modal={loadWeb3Modal}/>
            }
          </Box>
        </Box>
      </Flex>
    </Layout>
  )
}


export default Home;
