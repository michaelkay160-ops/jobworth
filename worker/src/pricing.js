const roundUpToFive = (amountMinor) => Math.ceil(amountMinor / 500) * 500;

export function calculateQuote({ lines, tasksById, options = {} }) {
  const laborRateMinor = Number(options.laborRateMinor ?? 12500);
  const materialMarkup = Number(options.materialMarkup ?? 0.25);
  const overheadRate = Number(options.overheadRate ?? 0.10);
  const targetGrossMargin = Number(options.targetGrossMargin ?? 0.35);
  const taxRate = Number(options.taxRate ?? 0);
  const accessHours = options.difficultAccess ? 0.5 : 0;

  const pricedLines = lines.map((line) => {
    const task = tasksById[line.taskId];
    if (!task) throw new Error(`Unknown task: ${line.taskId}`);
    const quantity = Math.max(1, Number(line.quantity || 1));
    const laborHours = (task.laborHours + (accessHours && line === lines[0] ? accessHours : 0)) * quantity;
    const laborMinor = laborHours * laborRateMinor;
    const materialMinor = task.materialCostMinor * quantity * (1 + materialMarkup);
    const directCostMinor = laborMinor + materialMinor;
    const overheadMinor = directCostMinor * overheadRate;
    const rawPriceMinor = (directCostMinor + overheadMinor) / (1 - targetGrossMargin);
    const unitPriceMinor = roundUpToFive(rawPriceMinor / quantity);
    return {
      taskId: task.id, name: task.name, quantity, laborHours,
      unitPriceMinor, totalMinor: unitPriceMinor * quantity,
      materialCostMinor: Math.round(materialMinor)
    };
  });

  const subtotalMinor = pricedLines.reduce((sum, line) => sum + line.totalMinor, 0);
  const taxMinor = Math.round(subtotalMinor * taxRate);
  return {
    lines: pricedLines, subtotalMinor, taxMinor, totalMinor: subtotalMinor + taxMinor,
    assumptions: { laborRateMinor, materialMarkup, overheadRate, targetGrossMargin, taxRate, difficultAccess: Boolean(options.difficultAccess) }
  };
}
