const materials = {
  "mat-receptacle-standard": 250,
  "mat-switch-standard": 200,
  "mat-gfci": 1800,
  "mat-wire-connectors": 500,
  "mat-breaker-20a": 1200,
  "mat-surge": 8500
};

const tasks = [
  ["task-outlet-standard","ELEC-OUTLET-STD","Replace standard receptacle","outlets-switches",0.5,["mat-receptacle-standard","mat-wire-connectors"]],
  ["task-outlet-gfci","ELEC-OUTLET-GFCI","Replace GFCI receptacle","outlets-switches",0.75,["mat-gfci","mat-wire-connectors"]],
  ["task-switch-standard","ELEC-SWITCH-STD","Replace standard switch","outlets-switches",0.5,["mat-switch-standard","mat-wire-connectors"]],
  ["task-breaker-20a","ELEC-BREAKER-20A","Replace single-pole breaker","panels",0.5,["mat-breaker-20a"]],
  ["task-surge-protector","ELEC-SURGE","Install whole-home surge protector","safety",1.5,["mat-surge","mat-wire-connectors"]],
  ["task-diagnostic-basic","ELEC-DIAG-BASIC","Electrical troubleshooting visit","diagnostics",1.0,["mat-wire-connectors"]],
  ["task-dedicated-circuit","ELEC-CIRCUIT-DEDICATED","Install dedicated branch circuit","circuits",3.0,["mat-wire-connectors"]],
  ["task-ceiling-fan","ELEC-FAN","Install customer-supplied ceiling fan","lighting",2.0,["mat-wire-connectors"]],
  ["task-ev-ready","ELEC-EV-READY","Install EV charger circuit allowance","ev",4.0,["mat-wire-connectors"]]
].map(([id,sku,name,categoryId,laborHours,includedMaterialIds]) => ({
  id, sku, name, categoryId, laborHours, includedMaterialIds,
  materialCostMinor: includedMaterialIds.reduce((sum, materialId) => sum + (materials[materialId] || 0), 0),
  status: "active"
}));

export function getCatalog() {
  return { currency: "USD", seedStatus: "illustrative-unvalidated", tasks };
}
