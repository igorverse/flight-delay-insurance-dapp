const main = async () => {
  const [deployer] = await hre.ethers.getSigners()
  const accountBalance = await deployer.getBalance()

  console.log('Deploying contracts with account: ', deployer.address)
  console.log('Account balance: ', accountBalance.toString())

  const insuranceContractFactory = await hre.ethers.getContractFactory(
    'VerxusInsurance'
  )
  const insuranceContract = await insuranceContractFactory.deploy()
  await insuranceContract.deployed()

  console.log('Verxus Insurance address: ', insuranceContract.address)
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()