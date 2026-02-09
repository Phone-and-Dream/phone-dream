import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, type Address } from "viem";

describe("ImpactSBT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function createSBT() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, feeReciever, authorizedAccount] = await hre.viem.getWalletClients();

    const FEE_RECIPIENT: Address = feeReciever?.account.address as Address;
    const AUTHROIZED_ADDRESS: Address = authorizedAccount?.account.address as Address;

    const impactSBT = await hre.viem.deployContract("ImpactSBT", [FEE_RECIPIENT, AUTHROIZED_ADDRESS]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      impactSBT,
      owner,
      otherAccount,
      authorizedAccount,
      feeReciever,
      publicClient,
    };
  }

  describe("Deployment", function () {
    const userId = "test-id";
    const deviceId = "test-id";

    const values = [deviceId, userId] as readonly [string, string];
    const mintValues = [deviceId, userId, "string", "string", "string", "string", "string", "string", "string"] as readonly [string, string, string, string, string, string, string, string, string];

    it("Should add user to mint", async function () {
      const { impactSBT, authorizedAccount, publicClient } = await loadFixture(createSBT);

      const SBTContract = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: authorizedAccount } },
      );

      await SBTContract?.write?.allowUserToMint(values);

      expect(await SBTContract.read.hasUserBeenAllowedToMint(values)).to.be.true;
    });

    it("Should allow user to mint", async function () {
      const { impactSBT, authorizedAccount, otherAccount, publicClient } = await loadFixture(createSBT);

      const SBTContractAuthorized = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: authorizedAccount } },
      );

      const SBTContract = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: otherAccount } },
      );

      await SBTContractAuthorized?.write?.allowUserToMint(values);

      await SBTContract.write.mintRecipientBadge(mintValues);

      expect(await SBTContract.read.hasUserMintedForDevice(values)).to.be.true;
    });

    it("Should reject if non authoized address tries to alow user to mint", async function () {
      const { impactSBT, otherAccount, publicClient } = await loadFixture(createSBT);

      const SBTContract = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: otherAccount } },
      );

      // replace the selection with:
      await expect(
        SBTContract.write.allowUserToMint(values),
      ).to.be.rejectedWith(/OnlyAuthorizedAddressCanCallThis/);
    });

    it("Should reject transfers to non-zero address", async function () {
      const { impactSBT, otherAccount, publicClient, authorizedAccount } = await loadFixture(createSBT);

      const SBTContract = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: authorizedAccount } },
      );

      const SBTContractAuthroizedAccount = await hre.viem.getContractAt(
        "ImpactSBT",
        impactSBT.address,
        { client: { public: publicClient, wallet: otherAccount } },
      );


      expect(await lock.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });

  //   it("Should receive and store the funds to lock", async function () {
  //     const { lock, lockedAmount, publicClient } = await loadFixture(
  //       createSBT,
  //     );

  //     expect(
  //       await publicClient.getBalance({
  //         address: lock.address,
  //       }),
  //     ).to.equal(lockedAmount);
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = BigInt(await time.latest());
  //     await expect(
  //       hre.viem.deployContract("Lock", [latestTime], {
  //         value: 1n,
  //       }),
  //     ).to.be.rejectedWith("Unlock time should be in the future");
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(createSBT);

  //       await expect(lock.write.withdraw()).to.be.rejectedWith(
  //         "You can't withdraw yet",
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         createSBT,
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We retrieve the contract with a different account to send a transaction
  //       const lockAsOtherAccount = await hre.viem.getContractAt(
  //         "Lock",
  //         lock.address,
  //         { client: { wallet: otherAccount } },
  //       );
  //       await expect(lockAsOtherAccount.write.withdraw()).to.be.rejectedWith(
  //         "You aren't the owner",
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         createSBT,
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.write.withdraw()).to.be.fulfilled;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount, publicClient } =
  //         await loadFixture(createSBT);

  //       await time.increaseTo(unlockTime);

  //       const hash = await lock.write.withdraw();
  //       await publicClient.waitForTransactionReceipt({ hash });

  //       // get the withdrawal events in the latest block
  //       const withdrawalEvents = await lock.getEvents.Withdrawal();
  //       expect(withdrawalEvents).to.have.lengthOf(1);
  //       expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
  //     });
  //   });
  });
});
