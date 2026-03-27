"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { formatAmount } from "@/lib/utils";

// Categories with their typical amount ranges
const CATEGORIES = {
	INCOME: [
		{ name: "salary", range: [5000, 8000] },
		{ name: "freelance", range: [1000, 3000] },
		{ name: "investments", range: [500, 2000] },
		{ name: "other-income", range: [100, 1000] },
	],
	EXPENSE: [
		{ name: "housing", range: [1000, 2000] },
		{ name: "transportation", range: [100, 500] },
		{ name: "groceries", range: [200, 600] },
		{ name: "utilities", range: [100, 300] },
		{ name: "entertainment", range: [50, 200] },
		{ name: "food", range: [50, 150] },
		{ name: "shopping", range: [100, 500] },
		{ name: "healthcare", range: [100, 1000] },
		{ name: "education", range: [200, 1000] },
		{ name: "travel", range: [500, 2000] },
	],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
	return formatAmount(Math.random() * (max - min) + min);
}

// Helper to get random category with amount
function getRandomCategory(type) {
	const categories = CATEGORIES[type];
	const category = categories[Math.floor(Math.random() * categories.length)];
	const amount = getRandomAmount(category.range[0], category.range[1]);
	return { category: category.name, amount };
}

function calculateNextRecurringDate(rawDate, interval) {
	const date = new Date(rawDate);
	switch (interval) {
		case "DAILY":
			date.setDate(date.getDate() + 1);
			break;
		case "WEEKLY":
			date.setDate(date.getDate() + 7);
			break;
		case "MONTHLY":
			date.setMonth(date.getMonth() + 1);
			break;
		case "YEARLY":
			date.setFullYear(date.getFullYear() + 1);
			break;
		default:
			return date;
	}
	return date;
}

function generateRecurrencesUntilNow(baseTransaction) {
	if (!baseTransaction.isRecurring || !baseTransaction.recurringInterval) {
		return { recurrences: [], nextRecurringDate: baseTransaction.nextRecurringDate };
	}

	const recurrences = [];
	let nextDate = baseTransaction.nextRecurringDate ?
				new Date(baseTransaction.nextRecurringDate) : 
				calculateNextRecurringDate(
					baseTransaction.date,
					baseTransaction.recurringInterval
				);
	const now = new Date();

	while (nextDate <= now) {
		recurrences.push({
			id: crypto.randomUUID(),
			type: baseTransaction.type,
			amount: baseTransaction.amount,
			description: `${baseTransaction.description} (Recurring)`,
			date: nextDate,
			category: baseTransaction.category,
			status: "COMPLETED",
			userId: baseTransaction.userId,
			accountId: baseTransaction.accountId,
			isRecurring: false,
			createdAt: nextDate,
			updatedAt: nextDate,
		});

		nextDate = calculateNextRecurringDate(nextDate, baseTransaction.recurringInterval);
		if (recurrences.length > 1000) break;
	}

	return { recurrences, nextRecurringDate: nextDate };
}

export async function seedTransactionsAction(ACCOUNT_ID, USER_ID) {
	try {
		if (!ACCOUNT_ID || !USER_ID)
			throw new Error("ACCOUNT_ID and USER_ID are required");
		const user = await db.user.findUnique({
			where: { id: USER_ID },
		});

		const account = await db.account.findUnique({
			where: { id: ACCOUNT_ID, userId: USER_ID },
		});

		if (!user) throw new Error("User not found");
		if (!account) throw new Error("Account not found");
		const transactions = [];
		let totalBalance = 0;

		// Generate 90 days of transactions
		for (let i = 90; i >= 0; i--) {
			const date = subDays(new Date(), i);

			// Generate 1-3 transactions per day
			const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

			for (let j = 0; j < transactionsPerDay; j++) {
				// 40% chance of income, 60% chance of expense
				const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
				const { category, amount } = getRandomCategory(type);

				// Randomly decide if the transaction is recurring
				const recurringInfo = {};
				if (Math.random() < 0.1) {
					// 10% chance of being recurring
					recurringInfo.isRecurring = true;
					const intervals = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
					recurringInfo.recurringInterval =
						intervals[Math.floor(Math.random() * intervals.length)];
					recurringInfo.nextRecurringDate =
						calculateNextRecurringDate(
							date,
							recurringInfo.recurringInterval
						);
				}

				const transaction = {
					id: crypto.randomUUID(),
					type,
					amount,
					description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
					date,
					category,
					status: "COMPLETED",
					userId: USER_ID,
					accountId: ACCOUNT_ID,
					isRecurring: recurringInfo.isRecurring || false,
					createdAt: date,
					updatedAt: date,
					...recurringInfo,
				};
				if (transaction.isRecurring) {
					const { recurrences, nextRecurringDate } = generateRecurrencesUntilNow(transaction);
					transaction.nextRecurringDate = nextRecurringDate;
					if (recurrences.length > 0) {
						for (const r of recurrences) {
							totalBalance += r.type === "INCOME" ? r.amount : -r.amount;
						}
						transactions.push(...recurrences);
					}
				}

				totalBalance += type === "INCOME" ? amount : -amount;
				transactions.push(transaction);
			}
		}

		// Insert transactions in batches and update account balance
		await db.$transaction(async (tx) => {
			// Clear existing transactions
			await tx.transaction.deleteMany({
				where: { accountId: ACCOUNT_ID },
			});

			// Insert new transactions
			await tx.transaction.createMany({
				data: transactions,
			});

			// Update account balance
			await tx.account.update({
				where: { id: ACCOUNT_ID },
				data: { balance: totalBalance },
			});
		});

		return {
			success: true,
			message: `Created ${transactions.length} transactions`,
		};
	} catch (error) {
		console.error("Error seeding transactions:", error);
		return { success: false, error: error.message };
	}
}
