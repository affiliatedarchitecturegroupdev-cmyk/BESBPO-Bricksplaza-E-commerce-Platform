export function eftDetails() {
  return {
    accountName: "Besbpo Group (Pty) Ltd t/a Bricksplaza",
    bank: process.env.EFT_BANK?.trim() || "",
    accountNumber: process.env.EFT_ACCOUNT_NUMBER?.trim() || "",
    branchCode: process.env.EFT_BRANCH_CODE?.trim() || "",
  };
}

export function eftInstructions(orderId: string) {
  const account = eftDetails();
  const lines = [
    `Order ${orderId} is saved. Stock on hand is reserved. Nothing has been captured.`,
    `Pay by EFT and use this reference: ${orderId}`,
  ];
  if (account.accountNumber) {
    lines.push(
      `Account name: ${account.accountName}`,
      account.bank ? `Bank: ${account.bank}` : "",
      `Account number: ${account.accountNumber}`,
      account.branchCode ? `Branch code: ${account.branchCode}` : "",
    );
  } else {
    lines.push("The yard account number is not published in this environment yet. The reference above is still the one to use.");
  }
  lines.push("Then open the order and submit the reference your bank shows, so the yard can match the funds. The load does not leave until that match is recorded.");
  return lines.filter(Boolean).join("\n");
}
