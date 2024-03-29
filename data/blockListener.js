const path = require('path')
const dotenv = require('dotenv')
const ftABI = require('../abift.json')
dotenv.config({ path: path.resolve(__dirname, '../.env') })
const {ape} = require('../trading')
const {getLowerCaseUserNameTime, getApeStatus} = require('./dictManager')


// Specify the path to the .env file relative to test.js
const ethers = require('ethers')
const userPrivateKey = process.env.USER_KEY
const friendTechContractAddress = process.env.FRIENDTECH_CONTRACT
const provider = new ethers.JsonRpcProvider(process.env.RPC)
const connectedFriendTech = new ethers.Wallet(userPrivateKey, provider)
  // Create a contract instance

const friendTechContract = new ethers.Contract(friendTechContractAddress, ftABI, connectedFriendTech)


const functionSignature = '0x6945b123' // Replace with your desired function signature
//const { getUserAddress, getDetailsFromAddress } = require('../apiCalls')

function logCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Get milliseconds

  console.log(`${hours}:${minutes}:${seconds}.${milliseconds}`);
}

async function processTransaction(txHash, blockNumber, txDetails) {
  try {
    const sender = txDetails.from.toLowerCase();
    const subject = '0x' + txDetails.data.slice(34, 74).toLowerCase()

    if (sender === subject) {
      //console.log(sender);
      //console.log(`txhash: ${txHash}`)

      const dictAddress = getLowerCaseUserNameTime(sender)
        if (!dictAddress==false){
            logCurrentTime()
            console.log(`*${dictAddress[1]}`)
            console.log(`*${dictAddress[0]}`)
            console.log('---------------')

            let apeStatus = getApeStatus(dictAddress[0])

              if (!apeStatus==false){
                console.log(apeStatus)
                ape(friendTechContract,sender,apeStatus[1])
              }
        } 
      //   else {
      //     //getting address from kosetto
      //     const [success, payload] = await getDetailsFromAddress(sender)
      //     const lowerAddress = payload.toLowerCase()
      //     logCurrentTime()
      //     console.log(lowerAddress)
          
      // }
      //console.log('---------------')
    }
  } catch (error) {
    console.error('Error processing transaction:', error)
  }
}

async function processBlocks(provider, functionSignature) {
  try {
    provider.on('block', async (blockNumber) => {
      try {
        const block = await provider.getBlock(blockNumber)

        if (block && block.transactions.length > 0) {
          await Promise.all(
            block.transactions.map(async (txHash) => {
              try {
                const txDetails = await provider.getTransaction(txHash)

                if (txDetails && txDetails.data.startsWith(functionSignature)) {
                  await processTransaction(txHash, blockNumber, txDetails)
                }
              } catch (error) {
                console.error('Error fetching transaction details:', error)
              }
            })
          );
        }
      } catch (error) {
        console.error('Error fetching blocks:', error)
      }
    });

    provider.on('error', (error) => {
      console.error('Provider error:', error)
    });
  } catch (error) {
    console.error('Error setting up block listener:', error);
  }
}

// Usage: Call this function to start listening for new blocks and processing transactions.
function startBlockListener() {
 
  processBlocks(provider, functionSignature)
}

module.exports = {startBlockListener}
