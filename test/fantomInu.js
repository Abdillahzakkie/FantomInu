const { ethers } = require("hardhat");
const { expect } = require("chai");

const toWei = (_amount) => ethers.utils.parseEther(_amount.toString());
const fromWei = (_amount) => ethers.utils.formatEther(_amount.toString());

describe("FantomInu", () => {
	let deployer, marketingWallet, user1, user2, user3;
	beforeEach(async () => {
		[deployer, marketingWallet, user1, user2, user3] =
			await ethers.getSigners();
		const FantomInu = await ethers.getContractFactory("FantomInu");
		this.reflect = await FantomInu.deploy(marketingWallet.address);
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
						"-950000047500002375001",
						"950000047500002375000",
						"25000001250000062500",
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
						"-999999574999337499219",
						"950000000000000000000",
						"25000013750020000023",
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

			it("should _transferFromExcluded token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(user1).transfer(user2.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[user1, user2, marketingWallet],
					[
						"-1000000000000000000000",
						"950000047500406128698",
						"25000013750123813627",
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

			it("should _transferBothExcluded token properly", async () => {
				const _amount = 1000;
				await expect(() =>
					this.reflect.connect(user1).transfer(user2.address, toWei(_amount))
				).to.changeTokenBalances(
					this.reflect,
					[user1, user2, marketingWallet],
					[
						"-1000000000000000000000",
						"950000000000000000000",
						"25000013750136876369",
					]
				);
			});
		});
	});
});
