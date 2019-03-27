const expect = require('chai').expect
const {generateKeyPair} = require('../../../src/lib/wallet')
const {checkBlock, makeGenesisBlock, createBlock, calculateHash} = require('../../../src/lib/block')
const {BlockError} = require('../../../src/errors')

// Cryptonian
const {isDataValid, checkTransactions, checkTransaction, createRewardTransaction, buildTransaction} = require('../../../src/lib/transaction')

describe('block lib', () => {

  const genesisBlock = makeGenesisBlock()
  let validBlock;
  let invalidBlock;
  let wallet;

  //== Cryptonian - build a target chain to test functionalities. =====//
  const wallet1 = generateKeyPair();
  const wallet2 = generateKeyPair();
  const wallet3 = generateKeyPair();
  // Create simple chain with three blocks
  const chain = [genesisBlock];
  for (let i = 0; i < 2; i++) {
    let rewardTx = createRewardTransaction(wallet1)
    let block = createBlock([rewardTx], chain[chain.length - 1], wallet1)
    block.hash = calculateHash(block)
    chain.push(block)
  }

  const unspent = chain
    // Get all transactions from the chain
    .reduce((transactions, block) => transactions.concat(block.transactions), [])
    // Get all outputs from transactions and append tx id
    .reduce((outputs, tx) => outputs.concat(tx.outputs.map(o => Object.assign({}, o, {tx: tx.id}))), [])

  let tx1 = buildTransaction(wallet1, wallet2.public, 10, unspent)
  let tx2 = buildTransaction(wallet1, wallet3.public, 10, unspent)
  let block3 = createBlock([tx1,tx2], chain[chain.length - 1], wallet1)

  //===================================================================//

  beforeEach(() => {
    wallet = generateKeyPair()
    validBlock = createBlock([], genesisBlock, wallet)
    invalidBlock = createBlock([], genesisBlock, wallet)
  })

  it('should create valid block', (done) => {
    checkBlock(genesisBlock, validBlock, Number.MAX_SAFE_INTEGER, [])
    //Cryptonian
    console.log(chain[2])
    checkBlock(chain[2], block3, Number.MAX_SAFE_INTEGER, [])
    
    done()
  })

  describe('block data validation', () => {

    it('should fail on invalid index', (done) => {
      invalidBlock.index = 'test';
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on invalid prevHash', (done) => {
      invalidBlock.prevHash = 'invalid hash';
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on invalid time', (done) => {
      invalidBlock.time = 'invalid time';
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on invalid time', (done) => {
      invalidBlock.time = 'invalid time';
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on invalid nonce', (done) => {
      invalidBlock.nonce = 'invalid nonce';
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on invalid hash', (done) => {
      invalidBlock.hash = 'invalid hash';
      expectCheckBlockToThrow()
      done()
    })
  })

  describe('block verification', () => {

    it('should fail on incorrect index', (done) => {
      invalidBlock.index = 5
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on incorrect block prevHash', (done) => {
      invalidBlock.prevHash = calculateHash(invalidBlock)
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on incorrect block hash', (done) => {
      invalidBlock.nonce = 100
      expectCheckBlockToThrow()
      done()
    })

    it('should fail on incorrect difficulty', (done) => {
      expectCheckBlockToThrow(100)
      done()
    })

  })


  /* ========================================================================= *\
   * Helpers
  \* ========================================================================= */

  function expectCheckBlockToThrow (difficulty = Number.MAX_SAFE_INTEGER) {
    expect(() => {
      checkBlock(genesisBlock, invalidBlock, difficulty, [])
    }).to.throw(BlockError)
  }

})
