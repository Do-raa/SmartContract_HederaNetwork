const { Client, PrivateKey, ContractFunctionParameters, ContractCreateTransaction, FileCreateTransaction, Hbar, ContractCallQuery, ContractExecuteTransaction } = require("@hashgraph/sdk");
require('dotenv').config();
const NewAccount = require("./CreateNewAccount");
let helloHedera = require("./HelloHedera.json");

async function environmentSetup() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    //Create your Hedera Testnet client
    const client = Client.forTestnet();

    //Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);

    //Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100));

    //Set the maximum payment for queries (in Hbar)
    client.setMaxQueryPayment(new Hbar(50));

    //Create new account
    const newAccountInfo = await NewAccount(client)
    const newAccountID = newAccountInfo[0]
    const newAccountPrivateKey = newAccountInfo[1]

    //Import the compiled contract from the HelloHedera.json file
    const bytecode = helloHedera.data.bytecode.object;

    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction()
        //Set the bytecode of the contract
        .setContents(bytecode);

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    console.log("The smart contract byte code file ID is " + bytecodeFileId)

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(100000)
        //Provide the constructor parameters for the contract
        .setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!"));

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const newContractId = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + newContractId);

    // Calls a function of the smart contract
const contractQuery = await new ContractCallQuery()
     //Set the gas for the query
     .setGas(100000)
     //Set the contract ID to return the request for
     .setContractId(newContractId)
     //Set the contract function to call
     .setFunction("get_address" )
     //Set the query payment for the node returning the request
     //This value must cover the cost of the request otherwise will fail
     .setQueryPayment(new Hbar(2));

//Submit to a Hedera network
const getAddress = await contractQuery.execute(client);

// Get a string from the result at index 0
const address = getAddress.getString(0);

//Log the Address
console.log("The contract Address: " + address);

    //v2 Hedera JavaScript SDK
    
     //Create the transaction to update the contract message
const contractExecTx = await new ContractExecuteTransaction()
        //Set the ID of the contract
        .setContractId(newContractId)
        //Set the gas for the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction("set_address", new ContractFunctionParameters().addString("Hello from Hedera again!"));

//Submit the transaction to a Hedera network and store the response
const submitExecTx = await contractExecTx.execute(client);

//Get the receipt of the transaction
const receipt2 = await submitExecTx.getReceipt(client);

//Confirm the transaction was executed successfully 
console.log("The transaction status is " +receipt2.status.toString());

//Query the contract for the contract message
const contractCallQuery = new ContractCallQuery()
        //Set the ID of the contract to query
        .setContractId(newContractId)
        //Set the gas to execute the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction("get_address")
        //Set the query payment for the node returning the request
        //This value must cover the cost of the request otherwise will fail 
        .setQueryPayment(new Hbar(2));

//Submit the transaction to a Hedera network 
const contractUpdateResult = await contractCallQuery.execute(client);

//Get the updated address at index 0
const address2 = contractUpdateResult.getString(0);

//Log the updated address to the console
console.log("The updated contract address: " + address2);

//v2 Hedera JavaScript SDK
}
environmentSetup();