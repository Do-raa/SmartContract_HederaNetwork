const {
    PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar
} = require("@hashgraph/sdk");


async function NewAccount(client) {
    try {
     const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    //Log the account ID
    console.log("The new account ID is: " + newAccountId);

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

        console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar."); 
        
        return [newAccountId, newAccountPrivateKey]

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports = NewAccount;
