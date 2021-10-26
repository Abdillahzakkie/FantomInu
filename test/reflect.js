const { ethers } = require("hardhat");
const { expect } = require("chai");

const toWei = (_amount) => ethers.utils.parseEther(_amount.toString());
const fromWei = (_amount) => ethers.utils.formatEther(_amount.toString());

describe("REFLECT", () => {
	let deployer, marketingWallet, user1, user2, user3;
	beforeEach(async () => {
		[deployer, marketingWallet, user1, user2, user3] =
			await ethers.getSigners();
		const REFLECT = await ethers.getContractFactory("REFLECT");
		this.reflect = await REFLECT.deploy(marketingWallet.address);
	});

	describe("deployment", () => {
		it("should deploy contract properly", () => {
			expect(this.reflect.address).not.null;
			expect(this.reflect.address).not.undefined;
		});
	});

	describe("transfer()", () => {
		describe("_transferStandard", () => {
			it("should _transferStandard token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(deployer).transfer(user1.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[deployer, user1, marketingWallet],
					[
						"-950004750023750118751",
						"950004750023750118750",
						"25000125000625003125",
					]
				);
			});
		});

		describe("_transferToExcluded", () => {
			beforeEach(async () => {
				await this.reflect
					.connect(deployer)
					.transfer(user1.address, toWei(10_000));

				await this.reflect.connect(deployer).excludeAccount(user2.address);
			});

			it("should _transferToExcluded token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(user1).transfer(user2.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[user1, user2, marketingWallet],
					[
						"-999957493374218665928",
						"950000000000000000000",
						"25001375200023127469",
					]
				);
			});
		});

		describe("_transferFromExcluded", () => {
			beforeEach(async () => {
				await this.reflect
					.connect(deployer)
					.transfer(user1.address, toWei(10_000));

				await this.reflect.connect(deployer).excludeAccount(user1.address);
			});

			it("should transfer token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(user1).transfer(user2.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[user1, user2, marketingWallet],
					[
						"-1000000000000000000000",
						"950004754064951362791",
						"25001376239253061157",
					]
				);
			});
		});

		describe("_transferBothExcluded", () => {
			beforeEach(async () => {
				await this.reflect
					.connect(deployer)
					.transfer(user1.address, toWei(10_000));

				await this.reflect.connect(deployer).excludeAccount(user1.address);
				await this.reflect.connect(deployer).excludeAccount(user2.address);
			});

			it("should transfer token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(user1).transfer(user2.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[user1, user2, marketingWallet],
					[
						"-1000000000000000000000",
						"950000000000000000000",
						"25001376370120120120",
					]
				);
			});
		});
	});
});
