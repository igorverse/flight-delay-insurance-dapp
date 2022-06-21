# Flight Delay Insurance Dapp (TCC)
This is a proof of concept for my TCC. The main goal of this project is to allow asking for parametric flight insurances. So, if a flight got delayed or canceled, you can have a payout.

## How to run locally

- npm install

**If you want to generate your own rinkeby smart contract**, you will need to have an alchemy account and configure it inside a file called *hardhat.config.js* (verxus-insurance-provider/hardhat.config.js)

```
module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: 'your_alchemy_provider_url',
      accounts: [
        'your_private_key',
      ],
    },
  },
}
```
In terminal:
```
cd verxus-insurance-provider
npx hardhat run scripts/deploy.js --network rinkeby
cd ..
cd client
npm start
```

**If you want just to run the application:**

```
cd client
npm start
```

How to run live application:

https://verxus.vercel.app/

## Techs

- nodeJS
- reactJS
- solidity
- hardhat
- alchemy
- rinkeby (ethereum)

*Talk with me:* [linkedin](https://www.linkedin.com/in/oigorsilva/)

