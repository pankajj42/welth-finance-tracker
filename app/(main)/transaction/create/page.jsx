import { getUserAccountsAction } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransactionAction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
	const accounts = await getUserAccountsAction();
	const resolvedParams = await searchParams;
	const editId = resolvedParams?.edit;

	let initialData = null;
	if (editId) {
		const transaction = await getTransactionAction(editId);
		initialData = transaction;
	}

	return (
		<div className="max-w-3xl mx-auto px-5">
			<div className="flex justify-center md:justify-normal mb-8">
				<h1 className="text-5xl gradient-title ">
					{editId ? "Edit" : "Add"} Transaction
				</h1>
			</div>
			<AddTransactionForm
				accounts={accounts}
				categories={defaultCategories}
				editMode={!!editId}
				initialData={initialData}
			/>
		</div>
	);
}
