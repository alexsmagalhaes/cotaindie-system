export const calculateProjectValue = (
  piecesCost: number,
  otherCosts: number,
  profitRate: number,
  monthlyExpenseRate: number,
  commissionRate: number,
) => {
  const baseCost = piecesCost + otherCosts;
  const costWithExpenses = baseCost * (1 + monthlyExpenseRate);

  const profitBeforeCommission = costWithExpenses * profitRate;

  const priceWithProfit = costWithExpenses + profitBeforeCommission;
  const commission = priceWithProfit * commissionRate;

  const finalValue = priceWithProfit + commission;
  const profit = profitBeforeCommission;

  return {
    baseCost,
    costWithExpenses,
    profitBeforeCommission,
    commission,
    profit,
    priceWithProfit,
    finalValue,
  };
};
