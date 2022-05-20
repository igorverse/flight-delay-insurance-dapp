const main = async () => {
  const insuranceContractFactory = await hre.ethers.getContractFactory(
    'InsuranceProvider'
  )
  const insuranceContract = await insuranceContractFactory.deploy()
  await insuranceContract.deployed()
  console.log('Contract addy:', insuranceContract.address)

  let insuranceCount
  insuranceCount = await insuranceContract.getTotalInsurances()
  console.log(insuranceCount.toNumber())

  let insuranceTxn = await insuranceContract.insurance(
    'ada',
    42,
    100,
    1000,
    12321,
    false
  )
  await insuranceTxn.wait()

  const [_, randomPerson] = await hre.ethers.getSigners()
  insuranceTxn = await insuranceContract
    .connect(randomPerson)
    .insurance('ada', 42, 100, 1000, 12321, false)
  await insuranceTxn.wait()

  let allInsurances = await insuranceContract.getAllInsurances()
  console.log(allInsurances)
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
