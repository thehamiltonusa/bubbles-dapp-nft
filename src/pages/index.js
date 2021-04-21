import * as React from 'react';
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
 } from '@chakra-ui/react';
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
import Web3 from 'web3';
import IPFS from 'ipfs-http-client';
import ERC1155 from '../contracts/ItemsERC1155.json';
import Blob from '../components/Blob';
import "../css/custom.css";
import detectEthereumProvider from '@metamask/detect-provider'

const Buffer = require('buffer').Buffer;
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});
class IndexPage extends React.Component {

  state = {
    inputs: [],
    loading: false
  }

  constructor(props){
    super(props);
    this.initWeb3 = this.initWeb3.bind(this);
    this.connectWeb3 = this.connectWeb3.bind(this);

  }

  componentWillMount = () => {
    if(typeof window !== 'undefined'){
      if(!window.location.href.includes("?e")){
        window.history.pushState({}, null, `?e=6&gw=6&se=699724&c=fdcb6e&o=0`);
      }
    }

  }

  componentDidMount = async () => {
    const hasLogged = localStorage.getItem('logged');
    if(hasLogged){
      await this.connectWeb3();
    } else {
      await this.initWeb3();
    }
  }

  initWeb3 = async () => {

    try{
      let web3;
      if(window.location.href.includes("?rinkeby")){
        web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
      } else {
        web3 = new Web3("https://rpc.xdaichain.com/")
      }
      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
      }
      //const coinbase = await web3.eth.getCoinbase();


      const lastTokenId = Number(await itoken.methods.totalSupply().call());
      this.setState({
        web3: web3,
        itoken: itoken,
        ipfs: ipfs,
        lastTokenId: lastTokenId,
        netId: netId
      });
      itoken.events.TransferSingle({
        filter: {
          from: '0x0000000000000000000000000000000000000000'
        },
        fromBlock: 'latest'
      }, this.handleEvents);
    } catch(err){
      console.log(err)
    }
  }
  connectWeb3 = async () => {
    try{
      this.setState({
        loading: true
      });
      let provider;
      if(window.ethereum?.isMetamask){
        provider = await detectEthereumProvider();
        if(!provider._metamask.isUnlocked()){
          alert("Please unlock your metamask first");
          this.setState({
            loading: false
          });
          return
        }
      } else {
        provider = window.ethereum;
      }
      if(provider){
        try{
          await provider.request({ method: 'eth_requestAccounts' });
        } catch(err){
          console.log(err);
          this.setState({
            loading: false,
          });
          return;
        }
      } else {
        alert('Web3 provider not detected, please install metamask');
        this.setState({
          loading: false,
        });
        return;
      }
      const web3 = new Web3(provider);
      const coinbase = await web3.eth.getCoinbase();
      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
      }
      if(netId !== 4 && netId !== 0x64){
        alert('Connect to xDAI network or Rinkeby testnet');
        if(window.location.href.includes("?rinkeby")){
          web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
        } else {
          web3 = new Web3("https://rpc.xdaichain.com/")
        }
      }
      const lastTokenId = Number(await itoken.methods.totalSupply().call());

      this.setState({
        web3: web3,
        itoken: itoken,
        coinbase:coinbase,
        loading: false,
        provider: provider,
        netId: netId,
        lastTokenId: lastTokenId
      });

      itoken.events.TransferSingle({
        filter: {
          from: '0x0000000000000000000000000000000000000000'
        },
        fromBlock: 'latest'
      }, this.handleEvents);
      localStorage.setItem('logged',true);
      provider.on('accountsChanged', accounts => window.location.reload(true));
      provider.on('chainChanged', chainId => window.location.reload(true));

    } catch(err){
      console.log(err)
    }
  }

  mint = async () => {

    try{
    this.setState({
      minting: true
    });

    const blob = JSON.parse(localStorage.getItem('blobs'))[0];
    console.log(blob)
    const blobSVG =  <Blob {...blob} />
    const lastTokenId = Number(await this.state.itoken.methods.totalSupply().call());
    const tokenId = lastTokenId + 1;
    const ipfs = this.state.ipfs;
    const imgres = await ipfs.add(ReactDOMServer.renderToString(blobSVG));
    console.log(imgres)
    let name = this.state.inputs["name"];
    if(!name){
      name = blob.name;
    }
    for(let i = 1;i<=this.state.lastTokenId;i++){
      const uriToken = await this.state.itoken.methods.uri(i).call();
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uriToken.replace("ipfs://","")}`)).text());
      if(metadata.image===`ipfs://${imgres.path}` || metadata.name.toLowerCase() === name.toLowerCase()){
        alert("Token with same image or name was already minted");
        this.setState({
          minting: false
        });
        return;
      }
    }
    const allTxs = await this.state.web3.eth.getTransactionCount(this.state.coinbase,'pending');
    const confirmedTxs = await this.state.web3.eth.getTransactionCount(this.state.coinbase);
    if(allTxs > confirmedTxs){
      alert("Wait all pending txs be confirmed");
      this.setState({
        minting: false
      });
      return;
    }

    let color = blob.color;
    if(blob.type === "gradient"){
      color = ` { from: ${ blob.colors[0]} , to : ${blob.colors[1]} }`;
    }
    let pattern;
    if(blob.type === "pattern"){
      pattern = blob.pattern;
    }
    let metadata = {
        name: name,
        image: `ipfs://${imgres.path}`,
        external_url: `https://uniquebubbles.com/token-info/?tokenId=${tokenId}`,
        description: this.state.inputs["description"],
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
    //const uri = res[0].hash;
    const uri = res.path;
    console.log(uri);
    const fees = []

      await this.state.itoken.methods.mint(tokenId,fees,1, uri).send({
        from: this.state.coinbase,
        value: 10 ** 18,
        gasPrice: 1000000000
      });


      this.setState({
        minting: false
      });
      return(true);

    } catch(err){
      this.setState({
        minting: false
      });
      console.log(err)
    }
  }

  handleOnChange = async e => {
    e.preventDefault();
    this.state.inputs[e.target.name] = e.target.value;
    console.log(this.state.inputs)
    await this.forceUpdate();
  }

  handleEvents = async(err,res) => {
    const lastTokenId = Number(await this.state.itoken.methods.totalSupply().call());
    this.setState({
      lastTokenId: lastTokenId
    })
  }

  render(){
    return(
      <Layout>
        <SEO
          title="Bubbles - Generate and mint beautiful blob shapes as NFT"
          description="Mint customizable Bubbles as NFT. Create random or fixed blobs, loop, animate, clip them with ease"
        />
        <Nav connectWeb3={this.connectWeb3} loading={this.state.loading} coinbase={this.state.coinbase} netId={this.state.netId}/>
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
            {
              (
                this.state.coinbase?.toLowerCase() === "0x4d2907583F6abc6124dAB05bc256ADAC123e78cC".toLowerCase() &&
                (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle mr={2}>Please contact developers!</AlertTitle>
                    <AlertDescription>You minted 4 bubbles which 2 we believe were error. Contact us to lock those tokens and receive back 2 xdai. Sorry for that incovenience.</AlertDescription>
                  </Alert>
                )

              )
            }
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
                this.state.coinbase &&
                (
                  <p>Logged as {this.state.coinbase}</p>
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
                <p>1 xDai = 1 Bubble</p>
                {
                  (
                    this.state.lastTokenId ?
                    (
                      <p><b>Bubbles left: {200000 - this.state.lastTokenId}</b></p>
                    ) :
                    (
                      <p><b>Bubbles left: 200000</b></p>

                    )
                  )
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
                    <p>Only 200000 Unique Bubbles will ever exist.</p>
                    <br />
                    <p>Bubbles are 200000 unique and personalized Bubbles created by some crypto early adopters. If you ever had the opportunity to own any Bubble, you not only own a rare piece of modern art, but you are also a very early adopter.</p>
                    <br />
                    <p>Each Bubble is generated from a creative process, the collectible is minted in a NFT, it can not be replicated or ever destroyed, it will be stored on Blockchain forever, you are also free to sell it and make profit from it.</p>
                    <br />
                    <p>xDai Token at: <a href={`https://blockscout.com/xdai/mainnet/address/${ERC1155.xdai}`} target="_blank" rel="noreferrer">{ERC1155.xdai}</a></p>
                    <br />
                    <p>Rinkeby Token at: <a href={`https://rinkeby.etherscan.io/token/${ERC1155.rinkeby}`} target="_blank" rel="noreferrer">{ERC1155.rinkeby}</a></p>
                    <br />
                    <p><a href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" target="_blank" rel="noreferrer" >How to connect metamask to xDai sidechain</a></p>
                  </Box>
                </Modal>
              </Flex>
              <BlobSettingsSection />
              <Box>
                <label > Name < /label>
                <Input
                  type = "text"
                  onChange = {
                    this.handleOnChange
                  }
                  name = 'name'
                 / >
              </Box>
              <Box>
                <label > Description < /label>
                <Input
                  type = "text"
                  onChange = {
                    this.handleOnChange
                  }
                  name = 'description'
                 / >
              </Box>
              <NavLinks mint={this.mint} coinbase={this.state.coinbase} connectWeb3={this.connectWeb3} loading={this.state.loading} minting={this.state.minting}/>
            </Box>
          </Box>
        </Flex>
        {
          (
            this.state.coinbase?.toLowerCase() === "0x4d2907583F6abc6124dAB05bc256ADAC123e78cC".toLowerCase() &&
            (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Please contact developers!</AlertTitle>
                <AlertDescription>You minted 4 bubbles which 2 we believe were error. Contact us to lock those tokens and receive back 2 xdai. Sorry for that incovenience.</AlertDescription>
              </Alert>
            )

          )
        }
      </Layout>
    )
  }
}


export default IndexPage;
