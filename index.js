const { Web3 } = require('web3');
const config=require('./config');
const provider = new providers.HttpProvider("https://rpc-mainnet.maticvigil.com")
const aavegotchiAddress = ""; 
const aavegotchiContract = new web3Instance.eth.Contract(erc721ABI, aavegotchiAddress);
const web3=new Web3(`https://mainnet.infura.io/v3/${config.infuraProjectId}`);
const marketplaceAddress = "0xE468cE99444174Bd3bBBEd09209577d25D1ad673";
const marketplaceContract = new web3Instance.eth.Contract(marketplaceABI, marketplaceAddress);

async function bidOnNFT(tokenId, bidAmount) {
  try {
    const listing = await marketplaceContract.methods.getERC721Listing(tokenId, aavegotchiAddress).call();
    const currentPrice = listing.priceInWei;
    if (bidAmount > currentPrice) {
      const txData = {
        from: account,
        to: marketplaceAddress,
        value: bidAmount, 
        gas: 200000, 
        data: marketplaceContract.methods.executeERC721Bid(tokenId, aavegotchiAddress).encodeABI(), 
      };
      const signedTx = await web3Instance.eth.accounts.signTransaction(txData, privateKey);
      const txReceipt = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`Bid on NFT ${tokenId} for ${bidAmount} wei. Tx hash: ${txReceipt.transactionHash}`);
    } else {
      console.log(`Bid too low for NFT ${tokenId}. Current price: ${currentPrice} wei`);
      const bidAmounts = []; 
    }
  } catch (error) {
    console.error(error);
  }
}

async function getNewNFTs() {
    try {
      const latestBlock = await web3Instance.eth.getBlockNumber();
      const transferEvents = await aavegotchiContract.getPastEvents("Transfer", {
        fromBlock: latestBlock - 1,
        toBlock: latestBlock,
      });
      const newNFTEvents = transferEvents.filter(
        (event) => event.returnValues.from === "0x0000000000000000000000000000000000000000"
      );
      for (let event of newNFTEvents) {
        const tokenId = event.returnValues.tokenId;
        const tokenURI = await aavegotchiContract.methods.tokenURI(tokenId).call();
        const tokenData = await get(tokenURI);
        console.log(`New NFT created: ${tokenData.data.name} (ID: ${tokenId})`);
      }
    } catch (error) {
      console.error(error);
    }
  }
  setInterval(getNewNFTs, 10000);

async function chooseNFTs() {
  const minRarity = 500; 
  const maxPrice = 0.5; 
  const bidAmounts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; 
  const allNFTs = await marketplaceContract.methods.getAllERC721Listings(aavegotchiAddress).call();
  for (let nft of allNFTs) {
    const tokenId = nft.erc721TokenId;
    const price = nft.priceInWei;
    const tokenURI = await aavegotchiContract.methods.tokenURI(tokenId).call();
    const tokenData = await get(tokenURI);
    const rarity = tokenData.data.rarityScore;
    if (rarity >= minRarity) {
      if (price <= web3Instance.utils.toWei(maxPrice.toString(), "ether")) {
        const bidAmount = bidAmounts[Math.floor(Math.random() * bidAmounts.length)];
        await bidOnNFT(tokenId, web3Instance.utils.toWei(bidAmount.toString(), "ether"));
      }
    }
  }
}
setInterval(chooseNFTs, 600000);