const { expect } = require("chai");
const { ethers } = require("hardhat");

function hasReason(error, text) {
  return error.toString().indexOf(text) > -1;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var initSmartContract = async (address) => {
  const HereBeforeToken = await ethers.getContractFactory("HereBeforeToken");
  const instance = await HereBeforeToken.deploy();
  console.log('Contract balance: ', (await ethers.provider.getBalance(instance.address)));
  return instance;
}


describe("HereBeforeToken", function() {

    it("should assert true", async function () {
        await initSmartContract();
        expect(true).to.true;
      });
    
      it("should match token name", async () => {
        const instance = await initSmartContract();
        const name = await instance.name();
        expect(name).to.equal("Here Before 100K");
      });
});

describe("HereBeforeToken", function(accounts) {
      it("mint", async () => {
        const instance = await initSmartContract();
        
        let error = null;
        try {
          await instance.mint(1);
        }
        catch(err) {
          error = err;
        }
        expect(hasReason(error, "Mint is not active.")).to.true;
        await instance.setMintActive(true);
        
        try {
          await instance.mint(10, { value: 1});
        }
        catch(err){
          error = err;
        }
        expect(hasReason(error, "Not enough eth.")).to.true;
        // eth balance for token [passed]

        // test num of tokens must in range (by defalut from 0 to 10) [passed]
        try {
          await instance.mint(0);
        }
        catch(err){
          error = err;
        }
        expect(hasReason(error, "Number of tokens is out of range.")).to.true;

        // num of tokens must in range (by defalut from 0 to 10) [passed]

        // test maximum count tokens by mint (by default 10) [passed]
        try {
          await instance.mint(11);
        }
        catch(err){
          error = err;
        }
        expect(hasReason(error, "Number of tokens is out of range.")).to.true;
        // maximum count tokens by mint (by default 10) [passed]
      });
});

describe("HereBeforeToken", function(accounts) {
  it("mintSpecial", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const instance = await initSmartContract();
    let error = null;
    let price = await instance.specialPrice();
    await instance.setMintActive(true);
    await instance.mintSpecial(51000, {value: price });
    
    let balance = (await instance.balanceOf(owner.address));
    expect(balance.toNumber()).to.equal(1);

    try {
      await instance.mintSpecial(51000, {value: price });
    }
    catch(err) {
      error = err;
    }
    expect(hasReason(error, "Token with this number already exists.")).to.true;
    try {
      await instance.mintSpecial(1000, { value: price });
    }
    catch(err) {
      error = err;
    }
    expect(hasReason(error, "Number is out of range.")).to.true;
    await instance.mintSpecial(50002, {value: price });
    balance = (await instance.balanceOf(owner.address));
    expect(balance.toNumber()).to.equal(2);
    let res = await instance.mintSpecial(50003, { value: price });
    
    balance = (await instance.balanceOf(owner.address));
    expect(balance.toNumber()).to.equal(3);

    
    const tokenOwnerAddress = (await instance.ownerOf(50003));
    expect(tokenOwnerAddress).to.equal(owner.address);

  });
});


// TEST UNIQUE TOKENS [PASSED]

// describe("HereBeforeToken", function(accounts) {
//   it("mint_all_avaliable", async function() {     
//     this.timeout(600000);
//     const instance = await initSmartContract();
//     await instance.setMintActive(true);
    
//     let price = await instance.price();

//     token_ids = [];
//     for(let j = 0; j < 5000; j++) {
//       let res = await instance.mint(10, { value: price + '0' });
//       res = await res.wait();
//       for(let i = 0; i < res.events.length; i++) {
//         let event = res.events[i].args;
//         var tokenId = event.tokenId.toNumber();
//         token_ids.push(Number(tokenId));
//       };  
//     }

//     let unique_ids = new Set(token_ids); 
//     expect(token_ids.length).to.equal(unique_ids.size);
    
//     token_ids.sort(function(a,b) { return a - b;});

//     expect(token_ids[0]).to.equal(50000);
//     expect(token_ids[token_ids.length-1]).to.equal(100000);
//   });
// });

describe("HereBeforeToken", function(accounts) {
  it("test_rewards", async function() {     
    this.timeout(60000);
    const instance = await initSmartContract();
    
    await instance.setMintActive(true);
    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    const addr1instance = await instance.connect(addr1).deployed();
    const addr2instance = await instance.connect(addr2).deployed();
    const addr3instance = await instance.connect(addr3).deployed();
    
    let price = await instance.price();

    var printBalances = async () => {
      console.log('Owner balance: ' + (await owner.getBalance()).toString());
      console.log('Addr1 balance: ' + (await addr1.getBalance()).toString() + ' tokens: ', (await instance.balanceOf(addr1.address)));
      console.log('Addr2 balance: ' + (await addr2.getBalance()).toString() + ' tokens: ', (await instance.balanceOf(addr2.address)));
      console.log('Addr3 balance: ' + (await addr3.getBalance()).toString() + ' tokens: ', (await instance.balanceOf(addr3.address)));
      console.log('Contract balance: ', (await ethers.provider.getBalance(instance.address)));
    }
    // print balance of addr1, addr2, addr3, contract
    printBalances();
    
    await sleep(1000);
    // mint 100
    for(let j = 0; j < 50; j++) {
      await addr1instance.mint(10, { value: price + '0' });
      await addr2instance.mint(10, { value: price + '0' });
    }
    await sleep(1000);
    // print balance of addr1, addr2, addr3, contract
    printBalances();
    
    await sleep(1000);
    // call reward 1
    await instance.reward(3);
    await sleep(1000);
    // print balance of addr1, addr2, addr3, contract
    printBalances();
    
    await sleep(1000);
    await instance.withdraw();
    await sleep(1000);
    // print balance of addr1, addr2, addr3, contract
    printBalances();
    
  });
});

