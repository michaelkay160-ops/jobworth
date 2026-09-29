const DEFAULT_PROFILE = Object.freeze({
  currency: "USD",
  loadedLaborRateMinor: 9500,
  overheadPercent: 0.12,
  targetGrossMargin: 0.35,
  roundingIncrementMinor: 500
});

function roundMoney(minor, increment = DEFAULT_PROFILE.roundingIncrementMinor) {
  return Math.round(minor / increment) * increment;
}

function taskFor(tasksById, id) {
  return typeof tasksById.get === "function" ? tasksById.get(id) : tasksById[id];
}

function calculateLine(task, quantity, access = "standard", profile = DEFAULT_PROFILE) {
  if (!task) throw new Error("Unknown task");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be a positive integer");
  if (!["standard", "difficult"].includes(access)) throw new Error("Access must be standard or difficult");
  const accessHours = access === "difficult" ? 0.5 : 0;
  const laborHours = (Number(task.laborHours) + accessHours) * quantity;
  const laborCostMinor = laborHours * profile.loadedLaborRateMinor;
  const materialCostMinor = Number(task.materialCostMinor || 0) * quantity;
  const directCostMinor = laborCostMinor + materialCostMinor;
  const overheadMinor = directCostMinor * profile.overheadPercent;
  const costBasisMinor = directCostMinor + overheadMinor;
  const targetPriceMinor = costBasisMinor / (1 - profile.targetGrossMargin);
  const sellPriceMinor = roundMoney(targetPriceMinor, profile.roundingIncrementMinor);
  return { taskId: task.id, quantity, access, laborHours, laborCostMinor, materialCostMinor, directCostMinor, overheadMinor, costBasisMinor, targetPriceMinor, sellPriceMinor };
}

function calculateQuote(items, tasksById, profile = DEFAULT_PROFILE) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("A quote requires at least one task");
  const lines = items.map(item => calculateLine(taskFor(tasksById, item.taskId), item.quantity, item.access, profile));
  const totals = lines.reduce((sum, line) => { sum.laborHours += line.laborHours; sum.laborCostMinor += line.laborCostMinor; sum.materialCostMinor += line.materialCostMinor; sum.directCostMinor += line.directCostMinor; sum.overheadMinor += line.overheadMinor; sum.costBasisMinor += line.costBasisMinor; sum.totalMinor += line.sellPriceMinor; return sum; }, { laborHours: 0, laborCostMinor: 0, materialCostMinor: 0, directCostMinor: 0, overheadMinor: 0, costBasisMinor: 0, totalMinor: 0 });
  return { currency: profile.currency, lines, totals };
}

module.exports = { DEFAULT_PROFILE, calculateLine, calculateQuote, roundMoney };
