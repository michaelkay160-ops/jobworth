const fs = require("node:fs");
const path = require("node:path");

function loadCatalog(projectRoot = path.resolve(__dirname, "../..")) {
  const seedPath = path.join(projectRoot, "data", "electrician-price-book.seed.json");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const materials = new Map(seed.materials.map(material => [material.id, material]));
  const tasks = seed.tasks.map(task => ({
    ...task,
    description: task.description || "Standard scope from the JobWorth electrician price book.",
    materialCostMinor: task.includedMaterialIds.reduce((sum, id) => sum + Number(materials.get(id)?.unitCostMinor || 0), 0)
  }));
  return { ...seed, tasks, tasksById: new Map(tasks.map(task => [task.id, task])) };
}

module.exports = { loadCatalog };
