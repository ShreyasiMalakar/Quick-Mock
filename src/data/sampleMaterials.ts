export interface SampleMaterial {
  id: string;
  title: string;
  category: string;
  estimatedQuestions: number;
  description: string;
  content: string;
}

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'cs-dsa',
    title: 'Data Structures & Algorithmic Complexity',
    category: 'Computer Science',
    estimatedQuestions: 10,
    description: 'Binary Search Trees, AVL Trees, Red-Black Trees, Hash Maps, Time/Space Big-O Complexity, and Graph Traversals.',
    content: `CHAPTER 4: ADVANCED DATA STRUCTURES AND ALGORITHM COMPLEXITY

1. Asymptotic Complexity and Big-O Notation:
- Big-O describes the upper bound of an algorithm's growth rate in terms of input size n.
- Time complexities: O(1) Constant, O(log n) Logarithmic, O(n) Linear, O(n log n) Linearithmic, O(n^2) Quadratic, O(2^n) Exponential.
- Binary search operates in O(log n) time on sorted arrays because each comparison halves the search space.
- QuickSort has average-case O(n log n) time complexity, but worst-case O(n^2) when poor pivots are repeatedly chosen (e.g., already sorted array with first element as pivot). Randomized pivot selection mitigates this.
- MergeSort guarantees O(n log n) worst-case time complexity, but requires O(n) auxiliary space due to temporary arrays during merge operations.

2. Balanced Binary Search Trees:
- In an unbalanced BST, worst-case operations (search, insert, delete) degenerate to O(n) when elements are inserted in monotonic order, forming a linked list structure.
- AVL Tree: Strictly height-balanced binary search tree where the balance factor (height of left subtree minus height of right subtree) must be -1, 0, or +1 for every node. Rebalancing requires single or double rotations (LL, RR, LR, RL).
- Red-Black Tree: Self-balancing BST with properties:
  1. Every node is either red or black.
  2. The root is always black.
  3. No two consecutive red nodes are permitted (a red node cannot have a red child).
  4. Every path from a node to any of its descendant NIL leaves contains the same number of black nodes (black-height).
  5. Leaves (NIL nodes) are considered black.
- Red-Black trees require fewer rotations during insertions and deletions than AVL trees, making them preferred for write-heavy systems (e.g., C++ std::map, Java TreeMap).

3. Hash Tables and Collision Resolution:
- Hash tables achieve average O(1) time for search, insertion, and deletion under Simple Uniform Hashing assumption.
- Load factor alpha = n / m (where n is the number of keys and m is the table size).
- Chaining: Colliding elements stored in linked lists (or balanced trees if bucket size exceeds threshold like in Java 8+ HashMap).
- Open Addressing: All elements stored in the hash table array directly. Methods include:
  * Linear Probing: Subject to primary clustering where filled slots coalesce into long contiguous runs.
  * Quadratic Probing: Solves primary clustering but suffers from secondary clustering.
  * Double Hashing: Uses a secondary hash function h2(k) which must be relatively prime to m; effectively eliminates clustering.

4. Graph Traversal Algorithms:
- Breadth-First Search (BFS): Uses a FIFO Queue. Finds the shortest path in unweighted graphs. Time complexity: O(V + E). Space complexity: O(V).
- Depth-First Search (DFS): Uses a LIFO Stack or recursion. Used for cycle detection, topological sorting of DAGs, and strongly connected components (Kosaraju's or Tarjan's algorithm). Time complexity: O(V + E).
- Dijkstra's Algorithm: Computes single-source shortest path on graphs with non-negative edge weights. Using a min-priority heap, it runs in O((V + E) log V). If negative edge weights exist, Dijkstra fails; Bellman-Ford algorithm must be used instead (O(V * E)).`,
  },
  {
    id: 'med-cardio',
    title: 'Cardiovascular Physiology & Pathophysiology',
    category: 'Medicine & Biology',
    estimatedQuestions: 10,
    description: 'Cardiac cycle, Wiggers diagram, Frank-Starling mechanism, murmurs, myocardial infarction, and arrhythmias.',
    content: `CARDIOVASCULAR PHYSIOLOGY & CLINICAL PATHOLOGY REVIEW

1. The Cardiac Cycle & Pressure-Volume Relationships:
- Ventricular Systole comprises:
  a) Isovolumetric Contraction: Mitral and tricuspid valves close (producing the S1 heart sound). Ventricular pressure increases precipitously while ventricular volume remains constant because all valves are closed.
  b) Rapid Ventricular Ejection: Left ventricular pressure exceeds aortic pressure (~80 mmHg), causing the aortic valve to open. Blood is rapidly ejected into the systemic circulation.
- Ventricular Diastole comprises:
  a) Isovolumetric Relaxation: Aortic and pulmonic valves close (producing the S2 heart sound, with A2 preceding P2). Ventricular pressure falls rapidly at constant end-systolic volume.
  b) Rapid Ventricular Filling: Left ventricular pressure drops below left atrial pressure, causing the atrioventricular (mitral) valve to open.
- S3 Heart Sound: Heard in early diastole during rapid ventricular filling; associated with increased filling pressures (e.g., dilated cardiomyopathy, systolic heart failure) or normal in young athletes and pregnancy.
- S4 Heart Sound: Heard in late diastole during active atrial contraction ("atrial kick"); indicates decreased ventricular compliance (stiff ventricle) seen in left ventricular hypertrophy and chronic hypertension.

2. Hemodynamics & Frank-Starling Mechanism:
- Cardiac Output (CO) = Stroke Volume (SV) x Heart Rate (HR).
- Stroke Volume = End-Diastolic Volume (EDV) - End-Systolic Volume (ESV).
- Ejection Fraction (EF) = (SV / EDV) x 100%. Normal resting EF is 55% - 70%.
- Frank-Starling Law: The force of ventricular contraction is directly proportional to the initial muscle fiber length (preload). Up to a physiological limit, increased end-diastolic volume leads to increased cardiac contractile force and stroke volume.
- Afterload represents the resistance the heart must pump against to eject blood. Systemic vascular resistance (SVR) and aortic pressure determine left ventricular afterload. Increased afterload decreases stroke volume and increases myocardial oxygen demand.

3. Valvular Pathologies & Auscultation:
- Aortic Stenosis: Crescendo-decrescendo systolic ejection murmur best heard at the right second intercostal space, radiating to the carotids. Associated with parvus et tardus (weak, delayed carotid pulse) and syncope, angina, dyspnea.
- Mitral Regurgitation: Holosystolic, blowing murmur heard loudest at the apex, radiating to the axilla. Worsens with maneuvers that increase afterload (handgrip).
- Aortic Regurgitation: Early diastolic, decrescendo high-pitched murmur heard along the left sternal border. Wide pulse pressure and bounding pulses (Water-hammer pulse).
- Mitral Stenosis: Opening snap followed by a mid-diastolic low-pitched rumbling murmur heard at the apex with the patient in the left lateral decubitus position. Primarily caused by rheumatic heart disease.

4. Coronary Artery Disease & Myocardial Infarction:
- STEMI (ST-Elevation Myocardial Infarction): Transmural ischemia due to complete acute occlusion of an epicardial coronary artery. EKG shows ST segment elevation in contiguous leads.
- Biomarkers: Cardiac Troponin I and T are the most sensitive and specific biomarkers. They rise 2-4 hours post-infarction, peak at 24-48 hours, and remain elevated for up to 7-10 days. CK-MB peaks at 24 hours and normalizes within 48-72 hours, making it valuable for detecting recurrent re-infarction.`,
  },
  {
    id: 'ai-ml',
    title: 'Machine Learning & Neural Network Architectures',
    category: 'Artificial Intelligence',
    estimatedQuestions: 10,
    description: 'Loss functions, Regularization, Transformers, Attention Mechanism, Vanishing Gradients, and Evaluation Metrics.',
    content: `DEEP LEARNING AND MACHINE LEARNING COMPREHENSIVE STUDY NOTES

1. Optimization and Loss Functions:
- Gradient Descent: Updates weights in the opposite direction of the gradient of the loss function with respect to weights: W = W - eta * grad(L).
- Stochastic Gradient Descent (SGD) computes gradients on a single training example; mini-batch SGD balances computational vectorization and gradient variance.
- Adam (Adaptive Moment Estimation): Combines momentum (first moment, exponentially decaying average of past gradients) and RMSprop (second moment, exponentially decaying average of squared gradients).
- Vanishing Gradient Problem: In deep networks with saturating activation functions (like Sigmoid or Tanh), derivatives approach zero for large positive or negative inputs. Backpropagation through multiple layers causes gradients to multiply and exponentially decay towards zero, halting weight updates in earlier layers. Solutions include ReLU, Leaky ReLU, residual skip connections (ResNets), and Layer Normalization.

2. Regularization and Generalization:
- Overfitting: Model learns training noise and fails to generalize to unseen test distributions (high variance, low bias).
- L2 Regularization (Ridge / Weight Decay): Adds sum of squared weights to the loss: L_reg = L + lambda * sum(w_i^2). Drives weights continuously toward small values, penalizing extreme parameter magnitudes.
- L1 Regularization (Lasso): Adds sum of absolute weights to the loss: L_reg = L + lambda * sum(|w_i|). Induces parameter sparsity by setting non-informative feature weights strictly to zero, acting as automatic feature selection.
- Dropout: Randomly deactivates a fraction p of neurons during each training forward pass, preventing co-adaptation of feature representations. During inference, all neurons are active with activations scaled by (1 - p).

3. Transformer Architecture & Self-Attention:
- Introduced by Vaswani et al. (2017) "Attention Is All You Need".
- Scaled Dot-Product Attention:
  Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
  where Q (Queries), K (Keys), and V (Values) are linear projections of token representations. The factor sqrt(d_k) prevents the dot products from growing excessively large, which would push softmax into regions with vanishingly small gradients.
- Multi-Head Attention: Projects Q, K, and V into h different representation subspaces, allowing the model to jointly attend to information at different positions from different aspects (syntactic, semantic).
- Positional Encoding: Since self-attention is permutation-invariant (order-agnostic), sinusoidal functions or learned embeddings are added to input embeddings to preserve token sequential order.

4. Evaluation Metrics in Classification:
- Precision = TP / (TP + FP) : Ratio of correctly predicted positive observations to total predicted positives. Critical when false positives are costly (e.g., spam detection).
- Recall (Sensitivity) = TP / (TP + FN) : Ratio of correctly predicted positive observations to all observations in actual class. Critical when false negatives are dangerous (e.g., medical cancer diagnosis).
- F1-Score = 2 * (Precision * Recall) / (Precision + Recall) : Harmonic mean of precision and recall.
- ROC-AUC: Plots True Positive Rate vs False Positive Rate across all classification thresholds. AUC of 0.5 indicates random guessing, while 1.0 indicates perfect separation.`,
  },
  {
    id: 'econ-micro',
    title: 'Principles of Microeconomics & Market Structures',
    category: 'Economics',
    estimatedQuestions: 10,
    description: 'Elasticity, Consumer Surplus, Perfect Competition, Monopoly, Oligopoly, and Game Theory.',
    content: `MICROECONOMIC PRINCIPLES & MARKET THEORY

1. Demand, Supply, and Elasticities:
- Law of Demand: Other factors held constant (ceteris paribus), an increase in price results in a decrease in the quantity demanded.
- Price Elasticity of Demand (PED) = (% change in Quantity Demanded) / (% change in Price).
  * If |PED| > 1: Elastic demand (consumers are sensitive to price changes; total revenue increases when price falls).
  * If |PED| < 1: Inelastic demand (consumers are relatively insensitive; total revenue increases when price rises).
  * If |PED| = 1: Unit elastic.
- Income Elasticity of Demand (YED):
  * Positive YED: Normal goods (demand increases as consumer income rises). Luxury goods have YED > 1.
  * Negative YED: Inferior goods (demand falls as consumer income rises, e.g., instant noodles).
- Cross-Price Elasticity of Demand (XED):
  * Positive XED: Substitutes (an increase in the price of Good A increases the demand for Good B).
  * Negative XED: Complements (an increase in the price of Good A decreases the demand for Good B, e.g., printers and ink).

2. Market Structures:
- Perfect Competition:
  * Infinite number of buyers and sellers, homogeneous/identical products, perfect information, zero barriers to entry and exit.
  * Firms are strict "price takers" facing a horizontal (perfectly elastic) individual demand curve where P = MR = AR.
  * Profit-maximizing output occurs where Marginal Revenue equals Marginal Cost (MR = MC).
  * In the long run, economic profits are driven to zero (normal profit) because new entrants eliminate supernormal profits.
- Monopoly:
  * Single seller, unique product with no close substitutes, extremely high barriers to entry (patents, natural monopolies with high fixed costs like utility grids).
  * Downward-sloping demand curve. Marginal revenue lies below the demand curve (MR < P).
  * Causes deadweight loss because the monopolist produces less output and charges a higher price than under perfect competition, reducing allocative efficiency.
- Oligopoly and Game Theory:
  * Dominated by a few large interdependent firms.
  * Prisoner's Dilemma illustrates why cooperation is difficult to maintain even when mutually beneficial.
  * Nash Equilibrium: A state in which neither player has an incentive to unilaterally deviate from their chosen strategy given the other player's strategy.`,
  },
];
