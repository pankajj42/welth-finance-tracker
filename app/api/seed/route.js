import { seedTransactions } from "@/actions/seed";

export async function GET(request) {
	const searchParams = request.nextUrl.searchParams;
	const ACCOUNT_ID = searchParams.get("accountId");
	const USER_ID = searchParams.get("userId");
	const result = await seedTransactions(ACCOUNT_ID, USER_ID);
	return Response.json(result);
}
