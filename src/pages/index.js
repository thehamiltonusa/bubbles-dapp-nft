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
import ERC721 from '../contracts/ItemsERC721.json';
import Blob from '../components/Blob';

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

  componentDidMount = async () => {
    await this.initWeb3();
  }

  initWeb3 = async () => {
    if (!window.ethereum) {
      alert("Please install metamask in your browser");
    }
    await window.ethereum.enable();
    const web3 = new Web3(window.ethereum);
    const netId = await web3.eth.net.getId();
    let itoken;
    if(netId !== 4 && netId !== 56){
      alert('Connect to Binance Smart Chain mainnet or Rinkeby testnet');
    } else if(netId === 4){
      itoken = new web3.eth.Contract(ERC721.abi, ERC721.rinkeby);
    } else if(netId === 56){
      itoken = new web3.eth.Contract(ERC721.abi, ERC721.binance);
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
    itoken.events.Transfer({
      filter: {
        from: '0x0000000000000000000000000000000000000000'
      },
      fromBlock: 'latest'
    }, this.handleEvents);
  }

  mint = async () => {
    const blob = JSON.parse(localStorage.getItem('blobs'))[0];
    const blobSVG =  <Blob {...blob} />
    const lastTokenId = Number(await this.state.itoken.methods.totalSupply().call());
    const tokenId = lastTokenId + 1;
    const ipfs = this.state.ipfs;
    const imgres = await ipfs.add(ReactDOMServer.renderToString(blobSVG));
    console.log(imgres)
    let metadata = {
        name: this.state.inputs["name"],
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
    try{
      await this.state.itoken.methods.mint(this.state.coinbase, uri).send({
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
            display={{ base: 'flex', lg: 'none' }}
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
                display={{ base: 'none', lg: 'flex' }}
              >
                <Logo />
                <Heading fontSize="3xl" variant="main">
                  Generate bubbles
                </Heading>
                <p>1 Bubble = 1 BNB</p>
                {
                  (
                    this.state.lastTokenId ?
                    (
                      <p><b>Bubbles left: {1000 - this.state.lastTokenId}</b></p>
                    ) :
                    (
                      <p><b>Bubbles left: 1000</b></p>

                    )
                  )
                }
                <Modal
                  title="Info"
                  size="md"
                  src={
                    <Button
                      variant="silent"
                      leftIcon={<QuestionIcon fontSize="lg" />}
                      aria-label="Info"
                    >
                      Info
                    </Button>
                  }
                >
                  <Box>
                    <p>Only 1.000 Unique Bubbles will ever exist.</p>
                    <br />
                    <p>Bubbles are 1.000 unique and personalized Bubbles created by some crypto early adopters. If you ever had the opportunity to own any Bubble, you not only own a rare piece of modern art, but you are also a very early adopter.</p>
                    <br />
                    <p>Each Bubble is generated from a creative process, the collectible is minted in a NFT, it can not be replicated or ever destroyed, it will be stored on Blockchain forever, you are also free to sell it and make profit from it.</p>
                    <br />
                    <p>Token at: {
                      (
                        this.state.netId === 4 ?
                        (
                          <a href={`https://rinkeby.etherscan.io/token/${this.state.itoken.options.address}`} target="_blank" rel="noreferrer">{this.state.itoken.options.address}</a>
                        ) :
                        (
                          this.state.netId === 56 &&
                          (
                            <a href={`https://bscscan.com/token/${this.state.itoken.options.address}`} target="_blank" rel="noreferrer">{this.state.itoken.options.address}</a>
                          )
                        )
                      )
                    }</p>
                    <br />
                    <p><a href="https://docs.binance.org/smart-chain/wallet/metamask.html" target="_blank" rel="noreferrer" >How to connect metamask to Binance Smart Chain</a></p>
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
