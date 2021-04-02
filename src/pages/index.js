import * as React from 'react';
import { Box, Heading, Flex , Input, Button } from '@chakra-ui/react';
import ReactDOMServer from 'react-dom/server';
import SEO from '../components/SEO';
import BlobSettingsSection from '../components/BlobSettingsSection';
import BlobActionBar from '../components/BlobActionBar';
import Logo from '../components/Common/Logo';
import BlobContainer from '../components/BlobContainer';
import NavLinks from '../components/NavLinks';
import Layout from '../components/Layout';
import Modal from '../components/Common/Modal';
import { QuestionIcon } from '../components/Common/Icons';
import Web3 from 'web3';
import IPFS from 'ipfs-http-client';
import ERC1155 from '../contracts/ItemsERC1155.json';
import Blob from '../components/Blob';
import "../css/custom.css";
const Buffer = require('buffer').Buffer;
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});
class IndexPage extends React.Component {

  state = {
    inputs: []
  }

  constructor(props){
    super(props);
    this.initWeb3 = this.initWeb3.bind(this);
  }

  componentWillMount = () => {
    if(typeof window !== 'undefined'){
      if(!window.location.href.includes("?e")){
        window.history.pushState({}, null, `?e=6&gw=6&se=699724&c=fdcb6e&o=0`);
      }
    }

  }

  componentDidMount = async () => {
    await this.initWeb3();
  }

  initWeb3 = async () => {
    if (!window.ethereum) {
      alert("Please install metamask in your browser");
    }
    try{
      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId !== 4 && netId !== 0x64){
        alert('Connect to xDai sidechain or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
      }
      const coinbase = await web3.eth.getCoinbase();


      const lastTokenId = Number(await itoken.methods.totalSupply().call());
      this.setState({
        web3: web3,
        coinbase: coinbase,
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

  mint = async () => {
    const blob = JSON.parse(localStorage.getItem('blobs'))[0];
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
    let metadata = {
        name: name,
        image: `ipfs://${imgres.path}`,
        external_url: `https://uniquebubbles.com/token-info/?tokenId=${tokenId}`,
        description: this.state.inputs["description"],
        attributes: [{
            trait_type: "Name",
            value: this.state.inputs["name"]
          },
          {
            trait_type: "Date",
            value: new Date().getTime()
          },
          {
            trait_type: "Artist",
            value: this.state.coinbase
          },
          {
              trait_type: "GeneratedName",
              value: blob.name
          },
        ]
    }
    const res = await ipfs.add(JSON.stringify(metadata));
    //const uri = res[0].hash;
    const uri = res.path;
    const fees = []
    try{
      await this.state.itoken.methods.mint(tokenId,fees,1, uri).send({
        from: this.state.coinbase,
        value: 10 ** 18
      });
    } catch(err){
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
                <Logo display={{sm: 'nonde'}}/>
                <Heading fontSize="3xl" variant="main">
                  Generate bubbles
                </Heading>
                <p>1 Bubble = 1 xDai</p>
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
              <NavLinks mint={this.mint}/>
            </Box>
          </Box>
        </Flex>
      </Layout>
    )
  }
}


export default IndexPage;
