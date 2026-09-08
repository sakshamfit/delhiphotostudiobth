// Three.js Knowledge Graph Visualization for Obsidian Vault
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Knowledge Graph Visualization Class
 */
class KnowledgeGraphVisualization {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id ${containerId} not found`);
    }

    // Default options
    this.options = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      backgroundColor: 0xf0f0f0,
      nodeColor: 0x4a90e2,
      connectionColor: 0xcccccc,
      nodeSize: 10,
      connectionSize: 0.5,
      ...options
    };

    // Initialize Three.js components
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initLights();

    // Data structures
    this.nodes = [];
    this.connections = [];
    this.nodeMeshes = [];
    this.connectionLines = [];

    // Animation frame
    this.animate = this.animate.bind(this);
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.options.width / this.options.height,
      0.1,
      1000
    );
    this.camera.position.z = 50;
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.options.width, this.options.height);
    this.container.appendChild(this.renderer.domElement);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
  }

  /**
   * Add a node to the knowledge graph
   * @param {Object} data - Node data {id, label, position, group}
   */
  addNode(data) {
    const node = {
      id: data.id,
      label: data.label || `Node ${data.id}`,
      position: data.position || new THREE.Vector3(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      ),
      group: data.group || 'default',
      ...data
    };

    this.nodes.push(node);
    this.createNodeMesh(node);
  }

  /**
   * Create mesh for a node
   * @param {Object} node - Node data
   */
  createNodeMesh(node) {
    const geometry = new THREE.SphereGeometry(this.options.nodeSize, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: this.options.nodeColor,
      metalness: 0.1,
      roughness: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(node.position);
    mesh.userData = node; // Store node data for interaction
    this.scene.add(mesh);
    this.nodeMeshes.push(mesh);
  }

  /**
   * Add a connection between two nodes
   * @param {Object} data - Connection data {sourceId, targetId, label}
   */
  addConnection(data) {
    const connection = {
      id: `${data.sourceId}-${data.targetId}`,
      sourceId: data.sourceId,
      targetId: data.targetId,
      label: data.label || '',
      ...data
    };

    this.connections.push(connection);
    this.createConnectionLine(connection);
  }

  /**
   * Create line for a connection
   * @param {Object} connection - Connection data
   */
  createConnectionLine(connection) {
    const sourceNode = this.nodes.find(n => n.id === connection.sourceId);
    const targetNode = this.nodes.find(n => n.id === connection.targetId);

    if (!sourceNode || !targetNode) {
      console.warn('Source or target node not found for connection:', connection);
      return;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([
      sourceNode.position,
      targetNode.position
    ]);

    const material = new THREE.LineBasicMaterial({
      color: this.options.connectionColor,
      linewidth: this.options.connectionSize
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.connectionLines.push(line);
  }

  /**
   * Load knowledge data from Obsidian vault (simulated)
   * In real implementation, this would parse .md files and extract links
   */
  async loadKnowledgeData() {
    // Simulated knowledge data - in practice, this would come from parsing Obsidian vault
    const knowledgeData = {
      nodes: [
        { id: 'gsap', label: 'GSAP Animations', group: 'animation', position: new THREE.Vector3(-10, 5, 0) },
        { id: 'threejs', label: 'Three.js 3D Visualization', group: 'visualization', position: new THREE.Vector3(10, 5, 0) },
        { id: 'obsidian', label: 'Obsidian Knowledge Vault', group: 'knowledge', position: new THREE.Vector3(0, -5, 0) },
        { id: 'scroll', label: 'Scroll-Based Interactions', group: 'animation', position: new THREE.Vector3(-5, 0, 5) },
        { id: 'connections', label: 'Knowledge Connections', group: 'knowledge', position: new THREE.Vector3(5, 0, -5) },
        { id: 'ui-ux', label: 'UI/UX Pro Max Design', group: 'design', position: new THREE.Vector3(0, 10, 0) }
      ],
      connections: [
        { sourceId: 'gsap', targetId: 'scroll', label: 'triggers' },
        { sourceId: 'threejs', targetId: 'connections', label: 'visualizes' },
        { sourceId: 'obsidian', targetId: 'gsap', label: 'stores' },
        { sourceId: 'obsidian', targetId: 'threejs', label: 'stores' },
        { sourceId: 'ui-ux', targetId: 'obsidian', label: 'guides' },
        { sourceId: 'scroll', targetId: 'ui-ux', label: 'enhances' }
      ]
    };

    // Clear existing data
    this.clear();

    // Add nodes and connections
    knowledgeData.nodes.forEach(node => this.addNode(node));
    knowledgeData.connections.forEach(connection => this.addConnection(connection));
  }

  clear() {
    // Remove all meshes and lines from scene
    this.nodeMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.connectionLines.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });

    // Clear arrays
    this.nodes = [];
    this.connections = [];
    this.nodeMeshes = [];
    this.connectionLines = [];
  }

  /**
   * Update visualization on window resize
   */
  onWindowResize() {
    this.options.width = this.container.clientWidth;
    this.options.height = this.container.clientHeight;

    this.camera.aspect = this.options.width / this.options.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.options.width, this.options.height);
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(this.animate);

    // Gentle rotation for demonstration
    this.scene.rotation.y += 0.001;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Destroy visualization and clean up resources
   */
  dispose() {
    this.clear();

    // Dispose of remaining scene objects
    this.scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });

    // Remove renderer DOM element
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Cancel animation frame
    cancelAnimationFrame(this.animate);
  }
}

/**
 * Initialize knowledge graph visualization
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Visualization options
 * @returns {KnowledgeGraphVisualization} - Visualization instance
 */
export function initKnowledgeGraph(containerId, options = {}) {
  const visualization = new KnowledgeGraphVisualization(containerId, options);

  // Load initial knowledge data
  visualization.loadKnowledgeData().then(() => {
    console.log('Knowledge graph visualization initialized');
  }).catch(error => {
    console.error('Failed to load knowledge data:', error);
  });

  // Handle window resize
  window.addEventListener('resize', () => visualization.onWindowResize());

  return visualization;
}

// Export for use in other modules
export default KnowledgeGraphVisualization;