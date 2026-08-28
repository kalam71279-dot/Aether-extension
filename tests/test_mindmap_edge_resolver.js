// Verify edge resolving by ID (number/string) and by label
const nodes = [
  { id: 1, label: "Quantum Computing" },
  { id: "2", label: "Superposition" },
  { id: 3, label: "Entanglement" },
  { id: 4, label: "Qubits" }
];

const edges = [
  { from: 1, to: "2", label: "relates to" },
  { from: "Superposition", to: "Entanglement", label: "paired with" },
  { from: 1, to: 4, label: "built on" }
];

const nodeMap = new Map();
const nodeByLabel = new Map();

nodes.forEach((n, idx) => {
  const nodeObj = { id: n.id, label: n.label, idx };
  nodeMap.set(n.id, nodeObj);
  nodeMap.set(String(n.id), nodeObj);
  nodeByLabel.set(n.label.toLowerCase().trim(), nodeObj);
});

function resolveNode(ref) {
  if (ref === undefined || ref === null) return null;
  const str = String(ref).trim().toLowerCase();
  return nodeMap.get(ref) || nodeMap.get(str) || nodeByLabel.get(str);
}

edges.forEach(e => {
  const src = resolveNode(e.from);
  const tgt = resolveNode(e.to);
  console.log(`Edge: "${e.from}" -> "${e.to}" resolved to: [${src?.label}] -> [${tgt?.label}]`);
  if (!src || !tgt) throw new Error('Failed to resolve edge');
});

console.log('All edges resolved successfully!');

