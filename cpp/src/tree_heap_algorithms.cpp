#include "../include/tree_heap_algorithms.hpp"
#include <queue>
#include <sstream>
#include <algorithm>
#include <iostream>

void destroyTree(TreeNode* root) {
    if (!root) return;
    destroyTree(root->left);
    destroyTree(root->right);
    delete root;
}

void captureTreeSnapshot(TreeNode* root, std::vector<TreeNodeSnapshot>& nodes, int depth, int parentId) {
    if (!root) return;
    int leftId = root->left ? root->left->id : -1;
    int rightId = root->right ? root->right->id : -1;
    nodes.push_back(TreeNodeSnapshot(root->id, root->value, leftId, rightId, parentId, depth));
    captureTreeSnapshot(root->left, nodes, depth + 1, root->id);
    captureTreeSnapshot(root->right, nodes, depth + 1, root->id);
}

static TreeNode* parseTreeFromTokens(const std::vector<std::string>& tokens, int& nextId) {
    if (tokens.empty() || tokens[0] == "null" || tokens[0] == "-") return nullptr;
    TreeNode* root = new TreeNode(nextId++, std::stoi(tokens[0]));
    std::queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();

        // Left child
        if (i < tokens.size()) {
            if (tokens[i] != "null" && tokens[i] != "-") {
                curr->left = new TreeNode(nextId++, std::stoi(tokens[i]));
                q.push(curr->left);
            }
            i++;
        }

        // Right child
        if (i < tokens.size()) {
            if (tokens[i] != "null" && tokens[i] != "-") {
                curr->right = new TreeNode(nextId++, std::stoi(tokens[i]));
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}

// -------------------------------------------------------------
// 1. Binary Tree Operations
// -------------------------------------------------------------
void traceBinaryTreeBuild(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Level-Order Tree Construction";
    ev.description = "Beginning binary tree construction from level-order array tokens.";
    ev.sourceLine = 2;
    emitter.emit(ev);

    if (tokens.empty() || tokens[0] == "null" || tokens[0] == "-") {
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Empty Tree";
        ev.description = "No valid root token provided. Result is an empty tree.";
        ev.sourceLine = 3;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    int nextId = 1;
    TreeNode* root = new TreeNode(nextId++, std::stoi(tokens[0]));
    std::queue<TreeNode*> q;
    q.push(root);

    ev = TraceEvent();
    ev.eventType = "node_create";
    ev.title = "Created Root Node: " + std::to_string(root->value);
    ev.description = "Allocated root node (id=" + std::to_string(root->id) + ") with value " + std::to_string(root->value) + ".";
    ev.sourceLine = 5;
    ev.rootId = root->id;
    ev.activeNodeId = root->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes[root->id] = "active";
    emitter.emit(ev);

    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();

        // Left child
        if (i < tokens.size()) {
            if (tokens[i] != "null" && tokens[i] != "-") {
                curr->left = new TreeNode(nextId++, std::stoi(tokens[i]));
                q.push(curr->left);

                ev = TraceEvent();
                ev.eventType = "node_insert";
                ev.title = "Attach Left Child: " + std::to_string(curr->left->value);
                ev.description = "Attached left child with value " + std::to_string(curr->left->value) + " to parent node " + std::to_string(curr->value) + ".";
                ev.sourceLine = 9;
                ev.rootId = root->id;
                ev.activeNodeId = curr->left->id;
                captureTreeSnapshot(root, ev.treeNodes);
                ev.highlightedNodes[curr->left->id] = "found";
                ev.highlightedNodes[curr->id] = "active";
                emitter.emit(ev);
            } else {
                ev = TraceEvent();
                ev.eventType = "null_check";
                ev.title = "Null Left Child";
                ev.description = "Token '" + tokens[i] + "': Left child of node " + std::to_string(curr->value) + " is null.";
                ev.sourceLine = 8;
                ev.rootId = root->id;
                ev.activeNodeId = curr->id;
                captureTreeSnapshot(root, ev.treeNodes);
                emitter.emit(ev);
            }
            i++;
        }

        // Right child
        if (i < tokens.size()) {
            if (tokens[i] != "null" && tokens[i] != "-") {
                curr->right = new TreeNode(nextId++, std::stoi(tokens[i]));
                q.push(curr->right);

                ev = TraceEvent();
                ev.eventType = "node_insert";
                ev.title = "Attach Right Child: " + std::to_string(curr->right->value);
                ev.description = "Attached right child with value " + std::to_string(curr->right->value) + " to parent node " + std::to_string(curr->value) + ".";
                ev.sourceLine = 12;
                ev.rootId = root->id;
                ev.activeNodeId = curr->right->id;
                captureTreeSnapshot(root, ev.treeNodes);
                ev.highlightedNodes[curr->right->id] = "found";
                ev.highlightedNodes[curr->id] = "active";
                emitter.emit(ev);
            } else {
                ev = TraceEvent();
                ev.eventType = "null_check";
                ev.title = "Null Right Child";
                ev.description = "Token '" + tokens[i] + "': Right child of node " + std::to_string(curr->value) + " is null.";
                ev.sourceLine = 11;
                ev.rootId = root->id;
                ev.activeNodeId = curr->id;
                captureTreeSnapshot(root, ev.treeNodes);
                emitter.emit(ev);
            }
            i++;
        }
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Binary Tree Construction Complete";
    ev.description = "All level-order tokens processed. Tree successfully constructed.";
    ev.sourceLine = 15;
    ev.rootId = root->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["nodeCount"] = std::to_string(ev.treeNodes.size());
    ev.statusText = "Tree ready";
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBinaryTreeInsert(const std::vector<std::string>& tokens, int val, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Insert " + std::to_string(val) + " (Level-Order Strategy)";
    ev.description = "Starting breadth-first search for the first available child position.";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["insertValue"] = std::to_string(val);
    emitter.emit(ev);

    if (!root) {
        root = new TreeNode(nextId++, val);
        ev = TraceEvent();
        ev.eventType = "node_insert";
        ev.title = "Inserted as Root: " + std::to_string(val);
        ev.description = "Tree was empty. Created root node with value " + std::to_string(val) + ".";
        ev.sourceLine = 6;
        ev.rootId = root->id;
        ev.activeNodeId = root->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes[root->id] = "found";
        ev.isCompleted = true;
        emitter.emit(ev);
        destroyTree(root);
        return;
    }

    std::queue<TreeNode*> q;
    q.push(root);
    std::map<int, std::string> visitedMap;

    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();

        ev = TraceEvent();
        ev.eventType = "node_visit";
        ev.title = "Inspect Node " + std::to_string(curr->value);
        ev.description = "Checking child slots of node " + std::to_string(curr->value) + ".";
        ev.sourceLine = 10;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        visitedMap[curr->id] = "active";
        ev.highlightedNodes = visitedMap;
        emitter.emit(ev);

        // Check left slot
        if (!curr->left) {
            curr->left = new TreeNode(nextId++, val);
            ev = TraceEvent();
            ev.eventType = "node_insert";
            ev.title = "Inserted " + std::to_string(val) + " as Left Child of " + std::to_string(curr->value);
            ev.description = "First vacant slot found at left child of node " + std::to_string(curr->value) + ".";
            ev.sourceLine = 14;
            ev.rootId = root->id;
            ev.activeNodeId = curr->left->id;
            captureTreeSnapshot(root, ev.treeNodes);
            visitedMap[curr->id] = "visited";
            visitedMap[curr->left->id] = "found";
            ev.highlightedNodes = visitedMap;
            ev.isCompleted = true;
            emitter.emit(ev);
            break;
        } else {
            q.push(curr->left);
        }

        // Check right slot
        if (!curr->right) {
            curr->right = new TreeNode(nextId++, val);
            ev = TraceEvent();
            ev.eventType = "node_insert";
            ev.title = "Inserted " + std::to_string(val) + " as Right Child of " + std::to_string(curr->value);
            ev.description = "First vacant slot found at right child of node " + std::to_string(curr->value) + ".";
            ev.sourceLine = 18;
            ev.rootId = root->id;
            ev.activeNodeId = curr->right->id;
            captureTreeSnapshot(root, ev.treeNodes);
            visitedMap[curr->id] = "visited";
            visitedMap[curr->right->id] = "found";
            ev.highlightedNodes = visitedMap;
            ev.isCompleted = true;
            emitter.emit(ev);
            break;
        } else {
            q.push(curr->right);
        }

        visitedMap[curr->id] = "visited";
    }

    destroyTree(root);
}

void traceBinaryTreeSearch(const std::vector<std::string>& tokens, int target, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Search for " + std::to_string(target);
    ev.description = "Starting traversal to locate value " + std::to_string(target) + ".";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["target"] = std::to_string(target);
    emitter.emit(ev);

    if (!root) {
        ev = TraceEvent();
        ev.eventType = "not_found";
        ev.title = "Target Not Found (Tree Empty)";
        ev.description = "Binary tree is empty. Returning false.";
        ev.sourceLine = 6;
        ev.variables["found"] = "false";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    std::queue<TreeNode*> q;
    q.push(root);
    std::map<int, std::string> visitedMap;
    bool found = false;

    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: Node " + std::to_string(curr->value) + " == Target " + std::to_string(target);
        ev.sourceLine = 9;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);

        if (curr->value == target) {
            ev.description = "Match found! Node with value " + std::to_string(target) + " located.";
            visitedMap[curr->id] = "found";
            ev.highlightedNodes = visitedMap;
            ev.variables["found"] = "true";
            ev.isCompleted = true;
            emitter.emit(ev);
            found = true;
            break;
        } else {
            ev.description = "Value " + std::to_string(curr->value) + " != " + std::to_string(target) + ". Enqueueing children.";
            visitedMap[curr->id] = "visited";
            ev.highlightedNodes = visitedMap;
            emitter.emit(ev);
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
    }

    if (!found) {
        ev = TraceEvent();
        ev.eventType = "not_found";
        ev.title = "Target " + std::to_string(target) + " Not Found";
        ev.description = "All nodes inspected. Value is absent in tree.";
        ev.sourceLine = 15;
        ev.rootId = root->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visitedMap;
        ev.variables["found"] = "false";
        ev.isCompleted = true;
        emitter.emit(ev);
    }

    destroyTree(root);
}

static int internalTreeSize(TreeNode* node, int depth, int rootId, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) {
        TraceEvent ev;
        ev.eventType = "null_check";
        ev.title = "Size: Base Case (node == nullptr)";
        ev.description = "Null pointer encountered at depth " + std::to_string(depth) + ". Returns 0.";
        ev.sourceLine = 4;
        ev.rootId = rootId;
        ev.recursionDepth = depth;
        ev.callStack.push_back("countSize(nullptr) -> 0");
        emitter.emit(ev);
        return 0;
    }

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Size: Visit Node " + std::to_string(node->value);
    ev.description = "Counting 1 for current node, plus left and right subtrees.";
    ev.sourceLine = 6;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    visited[node->id] = "active";
    ev.highlightedNodes = visited;
    ev.callStack.push_back("countSize(" + std::to_string(node->value) + ")");
    emitter.emit(ev);

    int leftSize = internalTreeSize(node->left, depth + 1, rootId, visited, emitter);
    int rightSize = internalTreeSize(node->right, depth + 1, rootId, visited, emitter);
    int total = 1 + leftSize + rightSize;

    visited[node->id] = "visited";
    ev = TraceEvent();
    ev.eventType = "recursive_return";
    ev.title = "Size: Node " + std::to_string(node->value) + " Subtree Count = " + std::to_string(total);
    ev.description = "1 + left (" + std::to_string(leftSize) + ") + right (" + std::to_string(rightSize) + ") = " + std::to_string(total) + ".";
    ev.sourceLine = 8;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    ev.highlightedNodes = visited;
    ev.variables["subtreeSize"] = std::to_string(total);
    emitter.emit(ev);

    return total;
}

void traceBinaryTreeSize(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::map<int, std::string> visited;

    int totalSize = internalTreeSize(root, 0, root ? root->id : -1, visited, emitter);

    TraceEvent ev;
    ev.eventType = "complete";
    ev.title = "Calculation Complete: Total Nodes = " + std::to_string(totalSize);
    ev.description = "Full binary tree traversal complete. Node count is " + std::to_string(totalSize) + ".";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    for (auto& p : visited) p.second = "found";
    ev.highlightedNodes = visited;
    ev.variables["totalNodes"] = std::to_string(totalSize);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

static int internalTreeHeight(TreeNode* node, int depth, int rootId, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) {
        return 0;
    }

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Height: Inspect Node " + std::to_string(node->value);
    ev.description = "Evaluating height: 1 + max(leftHeight, rightHeight).";
    ev.sourceLine = 5;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    visited[node->id] = "active";
    ev.highlightedNodes = visited;
    emitter.emit(ev);

    int lh = internalTreeHeight(node->left, depth + 1, rootId, visited, emitter);
    int rh = internalTreeHeight(node->right, depth + 1, rootId, visited, emitter);
    int h = 1 + std::max(lh, rh);

    visited[node->id] = "visited";
    ev = TraceEvent();
    ev.eventType = "height_update";
    ev.title = "Height at Node " + std::to_string(node->value) + " = " + std::to_string(h);
    ev.description = "Max of left (" + std::to_string(lh) + ") and right (" + std::to_string(rh) + ") + 1 = " + std::to_string(h) + ".";
    ev.sourceLine = 8;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    ev.highlightedNodes = visited;
    ev.variables["height"] = std::to_string(h);
    emitter.emit(ev);

    return h;
}

void traceBinaryTreeHeight(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::map<int, std::string> visited;

    int height = internalTreeHeight(root, 0, root ? root->id : -1, visited, emitter);

    TraceEvent ev;
    ev.eventType = "complete";
    ev.title = "Calculation Complete: Tree Height = " + std::to_string(height);
    ev.description = "Height is the longest path from root to leaf: " + std::to_string(height) + ".";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["height"] = std::to_string(height);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

static int internalCountLeaves(TreeNode* node, int depth, int rootId, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) return 0;

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Check Leaf: Node " + std::to_string(node->value);
    ev.sourceLine = 5;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    visited[node->id] = "active";
    ev.highlightedNodes = visited;

    if (!node->left && !node->right) {
        ev.description = "Node " + std::to_string(node->value) + " has no children. It is a leaf node!";
        visited[node->id] = "found";
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        return 1;
    }

    ev.description = "Node " + std::to_string(node->value) + " is internal. Traversing children.";
    emitter.emit(ev);

    int l = internalCountLeaves(node->left, depth + 1, rootId, visited, emitter);
    int r = internalCountLeaves(node->right, depth + 1, rootId, visited, emitter);
    return l + r;
}

void traceBinaryTreeLeaves(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::map<int, std::string> visited;

    int leaves = internalCountLeaves(root, 0, root ? root->id : -1, visited, emitter);

    TraceEvent ev;
    ev.eventType = "complete";
    ev.title = "Calculation Complete: Total Leaves = " + std::to_string(leaves);
    ev.description = "Counted all nodes having neither left nor right children: " + std::to_string(leaves) + ".";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["leafCount"] = std::to_string(leaves);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

// -------------------------------------------------------------
// 2. Tree Traversals
// -------------------------------------------------------------
static void internalPreorder(TreeNode* node, int depth, int rootId, std::vector<int>& output, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) {
        TraceEvent ev;
        ev.eventType = "null_check";
        ev.title = "Preorder: Null Pointer";
        ev.description = "Encountered nullptr at depth " + std::to_string(depth) + ". Returning.";
        ev.sourceLine = 4;
        ev.rootId = rootId;
        ev.recursionDepth = depth;
        ev.traversalOutput = output;
        ev.callStack.push_back("preorder(nullptr)");
        emitter.emit(ev);
        return;
    }

    output.push_back(node->value);
    visited[node->id] = "found";

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Preorder: Visit Node " + std::to_string(node->value);
    ev.description = "Visiting root node " + std::to_string(node->value) + " before children (Root → Left → Right).";
    ev.sourceLine = 6;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.callStack.push_back("preorder(" + std::to_string(node->value) + ")");
    emitter.emit(ev);

    internalPreorder(node->left, depth + 1, rootId, output, visited, emitter);
    internalPreorder(node->right, depth + 1, rootId, output, visited, emitter);
}

void tracePreorder(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::vector<int> output;
    std::map<int, std::string> visited;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Preorder Traversal (Root → Left → Right)";
    ev.description = "Beginning recursive preorder traversal.";
    ev.sourceLine = 3;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    internalPreorder(root, 0, root ? root->id : -1, output, visited, emitter);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Preorder Traversal Complete";
    ev.description = "All nodes processed. Output sequence generated.";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

static void internalInorder(TreeNode* node, int depth, int rootId, std::vector<int>& output, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) {
        TraceEvent ev;
        ev.eventType = "null_check";
        ev.title = "Inorder: Null Pointer";
        ev.description = "Null pointer at depth " + std::to_string(depth) + ". Returning.";
        ev.sourceLine = 4;
        ev.rootId = rootId;
        ev.recursionDepth = depth;
        ev.traversalOutput = output;
        ev.callStack.push_back("inorder(nullptr)");
        emitter.emit(ev);
        return;
    }

    internalInorder(node->left, depth + 1, rootId, output, visited, emitter);

    output.push_back(node->value);
    visited[node->id] = "found";

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Inorder: Visit Node " + std::to_string(node->value);
    ev.description = "Left subtree complete. Visiting node " + std::to_string(node->value) + " (Left → Root → Right).";
    ev.sourceLine = 7;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.callStack.push_back("inorder(" + std::to_string(node->value) + ")");
    emitter.emit(ev);

    internalInorder(node->right, depth + 1, rootId, output, visited, emitter);
}

void traceInorder(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::vector<int> output;
    std::map<int, std::string> visited;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Inorder Traversal (Left → Root → Right)";
    ev.description = "Beginning recursive inorder traversal.";
    ev.sourceLine = 3;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    internalInorder(root, 0, root ? root->id : -1, output, visited, emitter);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Inorder Traversal Complete";
    ev.description = "All nodes processed. Output sequence generated.";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

static void internalPostorder(TreeNode* node, int depth, int rootId, std::vector<int>& output, std::map<int, std::string>& visited, TraceEmitter& emitter) {
    if (!node) {
        TraceEvent ev;
        ev.eventType = "null_check";
        ev.title = "Postorder: Null Pointer";
        ev.description = "Null pointer at depth " + std::to_string(depth) + ". Returning.";
        ev.sourceLine = 4;
        ev.rootId = rootId;
        ev.recursionDepth = depth;
        ev.traversalOutput = output;
        ev.callStack.push_back("postorder(nullptr)");
        emitter.emit(ev);
        return;
    }

    internalPostorder(node->left, depth + 1, rootId, output, visited, emitter);
    internalPostorder(node->right, depth + 1, rootId, output, visited, emitter);

    output.push_back(node->value);
    visited[node->id] = "found";

    TraceEvent ev;
    ev.eventType = "node_visit";
    ev.title = "Postorder: Visit Node " + std::to_string(node->value);
    ev.description = "Both subtrees complete. Visiting node " + std::to_string(node->value) + " (Left → Right → Root).";
    ev.sourceLine = 8;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.recursionDepth = depth;
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.callStack.push_back("postorder(" + std::to_string(node->value) + ")");
    emitter.emit(ev);
}

void tracePostorder(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::vector<int> output;
    std::map<int, std::string> visited;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Postorder Traversal (Left → Right → Root)";
    ev.description = "Beginning recursive postorder traversal.";
    ev.sourceLine = 3;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    internalPostorder(root, 0, root ? root->id : -1, output, visited, emitter);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Postorder Traversal Complete";
    ev.description = "All nodes processed. Output sequence generated.";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceLevelOrder(const std::vector<std::string>& tokens, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = parseTreeFromTokens(tokens, nextId);
    std::vector<int> output;
    std::map<int, std::string> visited;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Level-Order Traversal (Breadth-First Queue)";
    ev.description = "Breadth-first traversal inspecting nodes level-by-level from top to bottom.";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    if (!root) {
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Level-Order Complete: Tree Empty";
        ev.description = "0 nodes visited.";
        ev.sourceLine = 6;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    std::queue<TreeNode*> q;
    q.push(root);

    std::vector<std::string> queueContents;
    queueContents.push_back(std::to_string(root->value));

    ev = TraceEvent();
    ev.eventType = "queue_enqueue";
    ev.title = "Queue Enqueue: Root " + std::to_string(root->value);
    ev.description = "Pushed root node into queue.";
    ev.sourceLine = 8;
    ev.rootId = root->id;
    ev.activeNodeId = root->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.queueState = queueContents;
    emitter.emit(ev);

    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();

        if (!queueContents.empty()) queueContents.erase(queueContents.begin());

        output.push_back(curr->value);
        visited[curr->id] = "found";

        ev = TraceEvent();
        ev.eventType = "node_visit";
        ev.title = "Dequeue & Visit Node " + std::to_string(curr->value);
        ev.description = "Processed node " + std::to_string(curr->value) + " from queue front.";
        ev.sourceLine = 12;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;
        ev.traversalOutput = output;
        ev.queueState = queueContents;
        emitter.emit(ev);

        if (curr->left) {
            q.push(curr->left);
            queueContents.push_back(std::to_string(curr->left->value));
            ev = TraceEvent();
            ev.eventType = "queue_enqueue";
            ev.title = "Enqueue Left Child: " + std::to_string(curr->left->value);
            ev.description = "Appended left child to queue.";
            ev.sourceLine = 15;
            ev.rootId = root->id;
            ev.activeNodeId = curr->left->id;
            captureTreeSnapshot(root, ev.treeNodes);
            ev.highlightedNodes = visited;
            ev.traversalOutput = output;
            ev.queueState = queueContents;
            emitter.emit(ev);
        }

        if (curr->right) {
            q.push(curr->right);
            queueContents.push_back(std::to_string(curr->right->value));
            ev = TraceEvent();
            ev.eventType = "queue_enqueue";
            ev.title = "Enqueue Right Child: " + std::to_string(curr->right->value);
            ev.description = "Appended right child to queue.";
            ev.sourceLine = 18;
            ev.rootId = root->id;
            ev.activeNodeId = curr->right->id;
            captureTreeSnapshot(root, ev.treeNodes);
            ev.highlightedNodes = visited;
            ev.traversalOutput = output;
            ev.queueState = queueContents;
            emitter.emit(ev);
        }
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Level-Order Traversal Complete";
    ev.description = "All levels visited.";
    ev.sourceLine = 22;
    ev.rootId = root->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

// -------------------------------------------------------------
// 3. Binary Search Tree Operations
// -------------------------------------------------------------
static TreeNode* insertBstNode(TreeNode* root, int val, int& nextId) {
    if (!root) return new TreeNode(nextId++, val);
    if (val < root->value) {
        root->left = insertBstNode(root->left, val, nextId);
    } else if (val > root->value) {
        root->right = insertBstNode(root->right, val, nextId);
    }
    return root;
}

static TreeNode* buildBstFromList(const std::vector<int>& vals, int& nextId) {
    TreeNode* root = nullptr;
    for (int v : vals) {
        root = insertBstNode(root, v, nextId);
    }
    return root;
}

void traceBstInsert(const std::vector<int>& initialValues, int val, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "BST Insert: Value " + std::to_string(val);
    ev.description = "Inserting " + std::to_string(val) + " according to BST invariant (left < node < right).";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["insertVal"] = std::to_string(val);
    emitter.emit(ev);

    if (!root) {
        root = new TreeNode(nextId++, val);
        ev = TraceEvent();
        ev.eventType = "node_insert";
        ev.title = "Insert as Root: " + std::to_string(val);
        ev.description = "Tree was empty. Created root node " + std::to_string(val) + ".";
        ev.sourceLine = 6;
        ev.rootId = root->id;
        ev.activeNodeId = root->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes[root->id] = "found";
        ev.isCompleted = true;
        emitter.emit(ev);
        destroyTree(root);
        return;
    }

    TreeNode* curr = root;
    TreeNode* parent = nullptr;
    std::map<int, std::string> visited;

    while (curr) {
        parent = curr;
        visited[curr->id] = "active";

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: " + std::to_string(val) + " with Node " + std::to_string(curr->value);
        ev.sourceLine = 10;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;

        if (val == curr->value) {
            // Duplicate rejected policy
            ev.eventType = "duplicate_rejected";
            ev.title = "Duplicate Value Rejected: " + std::to_string(val);
            ev.description = "BST ordering policy rejects duplicate keys. Tree remains unchanged.";
            ev.sourceLine = 12;
            visited[curr->id] = "compare";
            ev.highlightedNodes = visited;
            ev.variables["error"] = "DuplicateKeyRejected";
            ev.isCompleted = true;
            emitter.emit(ev);
            destroyTree(root);
            return;
        }

        if (val < curr->value) {
            ev.description = std::to_string(val) + " < " + std::to_string(curr->value) + ". Branching left.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->left;
        } else {
            ev.description = std::to_string(val) + " > " + std::to_string(curr->value) + ". Branching right.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->right;
        }
    }

    // Attach new node
    TreeNode* newNode = new TreeNode(nextId++, val);
    if (val < parent->value) {
        parent->left = newNode;
        ev = TraceEvent();
        ev.eventType = "node_insert";
        ev.title = "Attached Left Child: " + std::to_string(val);
        ev.description = "Inserted " + std::to_string(val) + " as left child of parent " + std::to_string(parent->value) + ".";
        ev.sourceLine = 17;
    } else {
        parent->right = newNode;
        ev = TraceEvent();
        ev.eventType = "node_insert";
        ev.title = "Attached Right Child: " + std::to_string(val);
        ev.description = "Inserted " + std::to_string(val) + " as right child of parent " + std::to_string(parent->value) + ".";
        ev.sourceLine = 20;
    }

    ev.rootId = root->id;
    ev.activeNodeId = newNode->id;
    captureTreeSnapshot(root, ev.treeNodes);
    visited[newNode->id] = "found";
    ev.highlightedNodes = visited;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBstSearch(const std::vector<int>& initialValues, int target, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "BST Search: Target " + std::to_string(target);
    ev.description = "Initiating binary search tree lookup in O(h) time.";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["target"] = std::to_string(target);
    emitter.emit(ev);

    TreeNode* curr = root;
    std::map<int, std::string> visited;

    while (curr) {
        visited[curr->id] = "active";

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: Target " + std::to_string(target) + " with " + std::to_string(curr->value);
        ev.sourceLine = 8;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;

        if (target == curr->value) {
            ev.eventType = "found";
            ev.title = "Found: Target " + std::to_string(target);
            ev.description = "Target match found at node " + std::to_string(curr->value) + "!";
            ev.sourceLine = 10;
            visited[curr->id] = "found";
            ev.highlightedNodes = visited;
            ev.variables["found"] = "true";
            ev.isCompleted = true;
            emitter.emit(ev);
            destroyTree(root);
            return;
        }

        if (target < curr->value) {
            ev.description = std::to_string(target) + " < " + std::to_string(curr->value) + ". Branching left.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->left;
        } else {
            ev.description = std::to_string(target) + " > " + std::to_string(curr->value) + ". Branching right.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->right;
        }
    }

    ev = TraceEvent();
    ev.eventType = "not_found";
    ev.title = "Target " + std::to_string(target) + " Not Found";
    ev.description = "Reached null child pointer without match. Target is absent in BST.";
    ev.sourceLine = 16;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["found"] = "false";
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

static TreeNode* internalDeleteBst(TreeNode* node, int target, int rootId, std::map<int, std::string>& visited, TraceEmitter& emitter, bool& deleted) {
    if (!node) {
        TraceEvent ev;
        ev.eventType = "not_found";
        ev.title = "Delete: Target " + std::to_string(target) + " Not in Tree";
        ev.description = "Reached null without finding target. Tree unmodified.";
        ev.sourceLine = 4;
        ev.rootId = rootId;
        emitter.emit(ev);
        return nullptr;
    }

    visited[node->id] = "active";
    TraceEvent ev;
    ev.eventType = "compare";
    ev.title = "Compare: Target " + std::to_string(target) + " with Node " + std::to_string(node->value);
    ev.sourceLine = 7;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    ev.highlightedNodes = visited;

    if (target < node->value) {
        ev.description = std::to_string(target) + " < " + std::to_string(node->value) + ". Searching in left subtree.";
        emitter.emit(ev);
        visited[node->id] = "visited";
        node->left = internalDeleteBst(node->left, target, rootId, visited, emitter, deleted);
        return node;
    } else if (target > node->value) {
        ev.description = std::to_string(target) + " > " + std::to_string(node->value) + ". Searching in right subtree.";
        emitter.emit(ev);
        visited[node->id] = "visited";
        node->right = internalDeleteBst(node->right, target, rootId, visited, emitter, deleted);
        return node;
    }

    // Node to delete found!
    deleted = true;
    visited[node->id] = "swap";

    // Case 1: Leaf node
    if (!node->left && !node->right) {
        ev = TraceEvent();
        ev.eventType = "node_unlink";
        ev.title = "Case 1: Delete Leaf Node " + std::to_string(node->value);
        ev.description = "Node " + std::to_string(node->value) + " has 0 children. Unlinking and freeing node.";
        ev.sourceLine = 12;
        ev.rootId = rootId;
        ev.activeNodeId = node->id;
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        delete node;
        return nullptr;
    }

    // Case 2: One child (only right child)
    if (!node->left) {
        TreeNode* child = node->right;
        ev = TraceEvent();
        ev.eventType = "pointer_update";
        ev.title = "Case 2: Delete Node " + std::to_string(node->value) + " (Single Right Child)";
        ev.description = "Bypassing node: connecting parent directly to right child " + std::to_string(child->value) + ".";
        ev.sourceLine = 16;
        ev.rootId = rootId;
        ev.activeNodeId = node->id;
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        delete node;
        return child;
    }

    // Case 2: One child (only left child)
    if (!node->right) {
        TreeNode* child = node->left;
        ev = TraceEvent();
        ev.eventType = "pointer_update";
        ev.title = "Case 2: Delete Node " + std::to_string(node->value) + " (Single Left Child)";
        ev.description = "Bypassing node: connecting parent directly to left child " + std::to_string(child->value) + ".";
        ev.sourceLine = 20;
        ev.rootId = rootId;
        ev.activeNodeId = node->id;
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        delete node;
        return child;
    }

    // Case 3: Two children
    // Find inorder successor (minimum in right subtree)
    TreeNode* succ = node->right;
    while (succ->left) {
        succ = succ->left;
    }

    ev = TraceEvent();
    ev.eventType = "value_replace";
    ev.title = "Case 3: Replace with Inorder Successor (" + std::to_string(succ->value) + ")";
    ev.description = "Node has 2 children. Found inorder successor " + std::to_string(succ->value) + 
                     ". Copying value and deleting successor from right subtree.";
    ev.sourceLine = 25;
    ev.rootId = rootId;
    ev.activeNodeId = node->id;
    visited[succ->id] = "found";
    ev.highlightedNodes = visited;
    emitter.emit(ev);

    node->value = succ->value;
    bool succDel = false;
    node->right = internalDeleteBst(node->right, succ->value, rootId, visited, emitter, succDel);

    return node;
}

void traceBstDelete(const std::vector<int>& initialValues, int target, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "BST Delete: Value " + std::to_string(target);
    ev.description = "Locating and deleting node " + std::to_string(target) + " handling Leaf, 1-child, or 2-children cases.";
    ev.sourceLine = 3;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["target"] = std::to_string(target);
    emitter.emit(ev);

    std::map<int, std::string> visited;
    bool deleted = false;
    root = internalDeleteBst(root, target, root ? root->id : -1, visited, emitter, deleted);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = deleted ? "Delete Complete: " + std::to_string(target) + " Removed" : "Delete Halted: Target Not Present";
    ev.description = deleted ? "BST invariants preserved." : "Tree remains unmodified.";
    ev.sourceLine = 30;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBstFindMin(const std::vector<int>& initialValues, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Find Minimum Element in BST";
    ev.description = "Following left pointers to the leftmost leaf.";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    if (!root) {
        ev = TraceEvent();
        ev.eventType = "not_found";
        ev.title = "Empty Tree";
        ev.description = "Cannot find minimum in empty tree.";
        ev.sourceLine = 6;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    TreeNode* curr = root;
    std::map<int, std::string> visited;

    while (curr->left) {
        visited[curr->id] = "visited";
        ev = TraceEvent();
        ev.eventType = "branch_left";
        ev.title = "Branch Left: Node " + std::to_string(curr->value);
        ev.description = "Left child exists (" + std::to_string(curr->left->value) + "). Moving left.";
        ev.sourceLine = 9;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        curr = curr->left;
    }

    visited[curr->id] = "found";
    ev = TraceEvent();
    ev.eventType = "found";
    ev.title = "Minimum Found: " + std::to_string(curr->value);
    ev.description = "Node " + std::to_string(curr->value) + " has no left child. It is the minimum key.";
    ev.sourceLine = 12;
    ev.rootId = root->id;
    ev.activeNodeId = curr->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["minimum"] = std::to_string(curr->value);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBstFindMax(const std::vector<int>& initialValues, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Find Maximum Element in BST";
    ev.description = "Following right pointers to the rightmost leaf.";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    if (!root) {
        ev = TraceEvent();
        ev.eventType = "not_found";
        ev.title = "Empty Tree";
        ev.description = "Cannot find maximum in empty tree.";
        ev.sourceLine = 6;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    TreeNode* curr = root;
    std::map<int, std::string> visited;

    while (curr->right) {
        visited[curr->id] = "visited";
        ev = TraceEvent();
        ev.eventType = "branch_right";
        ev.title = "Branch Right: Node " + std::to_string(curr->value);
        ev.description = "Right child exists (" + std::to_string(curr->right->value) + "). Moving right.";
        ev.sourceLine = 9;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;
        emitter.emit(ev);
        curr = curr->right;
    }

    visited[curr->id] = "found";
    ev = TraceEvent();
    ev.eventType = "found";
    ev.title = "Maximum Found: " + std::to_string(curr->value);
    ev.description = "Node " + std::to_string(curr->value) + " has no right child. It is the maximum key.";
    ev.sourceLine = 12;
    ev.rootId = root->id;
    ev.activeNodeId = curr->id;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["maximum"] = std::to_string(curr->value);
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBstInorder(const std::vector<int>& initialValues, TraceEmitter& emitter) {
    std::vector<std::string> tokens;
    // Build tree and convert to tokens for traversal
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);
    std::vector<int> output;
    std::map<int, std::string> visited;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "BST Inorder Traversal";
    ev.description = "Inorder traversal of a BST visits keys in strictly ascending sorted order.";
    ev.sourceLine = 3;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    emitter.emit(ev);

    internalInorder(root, 0, root ? root->id : -1, output, visited, emitter);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "BST Inorder Complete (Sorted Output)";
    ev.description = "Inorder produces sorted sequence.";
    ev.sourceLine = 10;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.traversalOutput = output;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

void traceBstPredSucc(const std::vector<int>& initialValues, int target, TraceEmitter& emitter) {
    int nextId = 1;
    TreeNode* root = buildBstFromList(initialValues, nextId);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Find Inorder Predecessor & Successor of " + std::to_string(target);
    ev.description = "Traversing BST to locate predecessor (largest key < target) and successor (smallest key > target).";
    ev.sourceLine = 4;
    ev.rootId = root ? root->id : -1;
    captureTreeSnapshot(root, ev.treeNodes);
    ev.variables["target"] = std::to_string(target);
    emitter.emit(ev);

    TreeNode* curr = root;
    TreeNode* pred = nullptr;
    TreeNode* succ = nullptr;
    std::map<int, std::string> visited;

    while (curr) {
        visited[curr->id] = "active";
        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Inspect Node " + std::to_string(curr->value);
        ev.sourceLine = 8;
        ev.rootId = root->id;
        ev.activeNodeId = curr->id;
        captureTreeSnapshot(root, ev.treeNodes);
        ev.highlightedNodes = visited;

        if (curr->value == target) {
            ev.description = "Node " + std::to_string(target) + " found. Checking subtrees for predecessor and successor.";
            emitter.emit(ev);

            // Predecessor is max of left subtree
            if (curr->left) {
                TreeNode* t = curr->left;
                while (t->right) t = t->right;
                pred = t;
            }
            // Successor is min of right subtree
            if (curr->right) {
                TreeNode* t = curr->right;
                while (t->left) t = t->left;
                succ = t;
            }
            break;
        }

        if (target < curr->value) {
            succ = curr; // Ancestor with larger key is candidate successor
            ev.description = std::to_string(target) + " < " + std::to_string(curr->value) + ". Candidate successor = " + std::to_string(curr->value) + ". Branching left.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->left;
        } else {
            pred = curr; // Ancestor with smaller key is candidate predecessor
            ev.description = std::to_string(target) + " > " + std::to_string(curr->value) + ". Candidate predecessor = " + std::to_string(curr->value) + ". Branching right.";
            emitter.emit(ev);
            visited[curr->id] = "visited";
            curr = curr->right;
        }
    }

    if (pred) visited[pred->id] = "active";
    if (succ) visited[succ->id] = "found";

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Predecessor & Successor Result";
    std::string pStr = pred ? std::to_string(pred->value) : "None";
    std::string sStr = succ ? std::to_string(succ->value) : "None";
    ev.description = "Predecessor: " + pStr + ", Successor: " + sStr + ".";
    ev.sourceLine = 20;
    ev.rootId = root ? root->id : -1;
    if (root) captureTreeSnapshot(root, ev.treeNodes);
    ev.highlightedNodes = visited;
    ev.variables["predecessor"] = pStr;
    ev.variables["successor"] = sStr;
    ev.isCompleted = true;
    emitter.emit(ev);

    destroyTree(root);
}

// -------------------------------------------------------------
// 4. Binary Heaps Operations
// -------------------------------------------------------------
static void heapifyDown(std::vector<int>& arr, int n, int i, bool isMinHeap, int& comparisons, int& swaps, TraceEmitter& emitter, const std::string& phase) {
    int targetIdx = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    TraceEvent ev;
    ev.eventType = "heap_compare";
    ev.title = phase + ": Sift-Down at Index " + std::to_string(i) + " (" + std::to_string(arr[i]) + ")";
    ev.description = "Checking children of index " + std::to_string(i) + ": left=" + 
                     (left < n ? std::to_string(arr[left]) : "none") + ", right=" + 
                     (right < n ? std::to_string(arr[right]) : "none") + ".";
    ev.sourceLine = 7;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.activeParentIdx = i;
    ev.activeLeftIdx = left < n ? left : -1;
    ev.activeRightIdx = right < n ? right : -1;
    ev.activeIndices = {i};
    if (left < n) ev.activeIndices.push_back(left);
    if (right < n) ev.activeIndices.push_back(right);
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    emitter.emit(ev);

    // Left child comparison
    if (left < n) {
        comparisons++;
        if (isMinHeap ? (arr[left] < arr[targetIdx]) : (arr[left] > arr[targetIdx])) {
            targetIdx = left;
        }
    }

    // Right child comparison
    if (right < n) {
        comparisons++;
        if (isMinHeap ? (arr[right] < arr[targetIdx]) : (arr[right] > arr[targetIdx])) {
            targetIdx = right;
        }
    }

    if (targetIdx != i) {
        swaps++;
        std::swap(arr[i], arr[targetIdx]);

        ev = TraceEvent();
        ev.eventType = "heap_swap";
        ev.title = phase + ": Swap Parent arr[" + std::to_string(i) + "] with Child arr[" + std::to_string(targetIdx) + "]";
        ev.description = "Swapped to satisfy " + std::string(isMinHeap ? "Min-Heap" : "Max-Heap") + " property.";
        ev.sourceLine = 12;
        ev.arrayState = arr;
        ev.heapSize = n;
        ev.heapType = isMinHeap ? "min" : "max";
        ev.activeParentIdx = i;
        ev.activeLeftIdx = targetIdx;
        ev.activeIndices = {i, targetIdx};
        ev.highlightedItems[i] = "swap";
        ev.highlightedItems[targetIdx] = "swap";
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        emitter.emit(ev);

        heapifyDown(arr, n, targetIdx, isMinHeap, comparisons, swaps, emitter, phase);
    }
}

void traceHeapBuild(std::vector<int> arr, bool isMinHeap, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int swaps = 0;

    TraceEvent ev;
    ev.eventType = "heapify_start";
    ev.title = "Bottom-Up " + std::string(isMinHeap ? "Min-Heap" : "Max-Heap") + " Build";
    ev.description = "Starting bottom-up construction from last non-leaf node index (n/2 - 1) down to 0 in O(n) time.";
    ev.sourceLine = 4;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    emitter.emit(ev);

    for (int i = (n / 2) - 1; i >= 0; --i) {
        heapifyDown(arr, n, i, isMinHeap, comparisons, swaps, emitter, "Build-Heap");
    }

    ev = TraceEvent();
    ev.eventType = "heapify_complete";
    ev.title = "Build-Heap Complete";
    ev.description = "Every parent satisfies the " + std::string(isMinHeap ? "Min-Heap (parent <= children)" : "Max-Heap (parent >= children)") + " property.";
    ev.sourceLine = 16;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.isCompleted = true;
    emitter.emit(ev);
}

void traceHeapInsert(std::vector<int> arr, int val, bool isMinHeap, TraceEmitter& emitter) {
    int comparisons = 0;
    int swaps = 0;

    arr.push_back(val);
    int idx = static_cast<int>(arr.size()) - 1;
    int n = static_cast<int>(arr.size());

    TraceEvent ev;
    ev.eventType = "heap_append";
    ev.title = "Heap Insert: Appended " + std::to_string(val) + " at Index " + std::to_string(idx);
    ev.description = "Appended new element to end of array. Sifting up to restore heap invariant.";
    ev.sourceLine = 4;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.activeIndices = {idx};
    ev.highlightedItems[idx] = "insert";
    emitter.emit(ev);

    // Sift-up
    while (idx > 0) {
        int parent = (idx - 1) / 2;
        comparisons++;
        bool violates = isMinHeap ? (arr[idx] < arr[parent]) : (arr[idx] > arr[parent]);

        ev = TraceEvent();
        ev.eventType = "heap_compare";
        ev.title = "Compare: Child arr[" + std::to_string(idx) + "] (" + std::to_string(arr[idx]) + 
                   ") with Parent arr[" + std::to_string(parent) + "] (" + std::to_string(arr[parent]) + ")";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.heapSize = n;
        ev.heapType = isMinHeap ? "min" : "max";
        ev.activeParentIdx = parent;
        ev.activeIndices = {parent, idx};
        ev.highlightedItems[parent] = "compare";
        ev.highlightedItems[idx] = "compare";
        ev.comparisons = comparisons;
        ev.swaps = swaps;

        if (violates) {
            ev.description = "Heap invariant violated. Swapping child and parent.";
            emitter.emit(ev);

            swaps++;
            std::swap(arr[idx], arr[parent]);

            ev = TraceEvent();
            ev.eventType = "heap_swap";
            ev.title = "Swap arr[" + std::to_string(idx) + "] and arr[" + std::to_string(parent) + "]";
            ev.description = "Swapped elements.";
            ev.sourceLine = 10;
            ev.arrayState = arr;
            ev.heapSize = n;
            ev.heapType = isMinHeap ? "min" : "max";
            ev.activeIndices = {parent, idx};
            ev.highlightedItems[parent] = "swap";
            ev.highlightedItems[idx] = "swap";
            ev.comparisons = comparisons;
            ev.swaps = swaps;
            emitter.emit(ev);

            idx = parent;
        } else {
            ev.description = "Heap invariant satisfied. Insertion complete.";
            emitter.emit(ev);
            break;
        }
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Insertion Sift-Up Complete";
    ev.description = "Value " + std::to_string(val) + " is in its correct heap position.";
    ev.sourceLine = 14;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.isCompleted = true;
    emitter.emit(ev);
}

void traceHeapExtract(std::vector<int> arr, bool isMinHeap, TraceEmitter& emitter) {
    int comparisons = 0;
    int swaps = 0;
    int n = static_cast<int>(arr.size());

    if (n == 0) {
        TraceEvent ev;
        ev.eventType = "error";
        ev.title = "Extract Error: Heap is Empty";
        ev.description = "Cannot extract from an empty heap.";
        ev.sourceLine = 4;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    int extracted = arr[0];

    TraceEvent ev;
    ev.eventType = "heap_extract";
    ev.title = "Extract Root (" + std::to_string(extracted) + ")";
    ev.description = "Root " + std::to_string(extracted) + " is the " + 
                     (isMinHeap ? "minimum" : "maximum") + " element in the heap.";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.activeIndices = {0};
    ev.highlightedItems[0] = "found";
    ev.variables["extracted"] = std::to_string(extracted);
    emitter.emit(ev);

    if (n == 1) {
        arr.pop_back();
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Heap Now Empty";
        ev.description = "Sole element extracted.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.heapSize = 0;
        ev.heapType = isMinHeap ? "min" : "max";
        ev.variables["extracted"] = std::to_string(extracted);
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    // Replace root with last element
    arr[0] = arr[n - 1];
    arr.pop_back();
    n--;

    ev = TraceEvent();
    ev.eventType = "value_replace";
    ev.title = "Move Last Element arr[" + std::to_string(n) + "] (" + std::to_string(arr[0]) + ") to Root";
    ev.description = "Replaced root with the last leaf element. Now performing sift-down from root.";
    ev.sourceLine = 11;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.activeIndices = {0};
    ev.highlightedItems[0] = "swap";
    ev.variables["extracted"] = std::to_string(extracted);
    emitter.emit(ev);

    heapifyDown(arr, n, 0, isMinHeap, comparisons, swaps, emitter, "Extract Sift-Down");

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Extraction Complete";
    ev.description = "Heap invariant restored after extracting " + std::to_string(extracted) + ".";
    ev.sourceLine = 15;
    ev.arrayState = arr;
    ev.heapSize = n;
    ev.heapType = isMinHeap ? "min" : "max";
    ev.variables["extracted"] = std::to_string(extracted);
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.isCompleted = true;
    emitter.emit(ev);
}

void traceHeapPeek(const std::vector<int>& arr, bool isMinHeap, TraceEmitter& emitter) {
    TraceEvent ev;
    if (arr.empty()) {
        ev.eventType = "error";
        ev.title = "Peek Error: Heap is Empty";
        ev.description = "Cannot peek root of empty heap.";
        ev.sourceLine = 4;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    int rootVal = arr[0];
    ev.eventType = "found";
    ev.title = "Peek Root: " + std::to_string(rootVal);
    ev.description = "Direct O(1) array access: arr[0] = " + std::to_string(rootVal) + 
                     " is the " + (isMinHeap ? "minimum" : "maximum") + " element.";
    ev.sourceLine = 6;
    ev.arrayState = arr;
    ev.heapSize = static_cast<int>(arr.size());
    ev.heapType = isMinHeap ? "min" : "max";
    ev.activeIndices = {0};
    ev.highlightedItems[0] = "found";
    ev.variables["peekValue"] = std::to_string(rootVal);
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// Canonical C++ Source Codes
// -------------------------------------------------------------
std::string getTreeHeapSourceCode(const std::string& op) {
    if (op == "binary-tree" || op == "tree-insert") {
        return
            "#include <iostream>\n"
            "#include <queue>\n"
            "\n"
            "void insertLevelOrder(Node*& root, int val) {\n"
            "    if (!root) {\n"
            "        root = new Node(val);\n"
            "        return;\n"
            "    }\n"
            "    std::queue<Node*> q;\n"
            "    q.push(root);\n"
            "    while (!q.empty()) {\n"
            "        Node* curr = q.front(); q.pop();\n"
            "        if (!curr->left) {\n"
            "            curr->left = new Node(val);\n"
            "            return;\n"
            "        } else q.push(curr->left);\n"
            "        if (!curr->right) {\n"
            "            curr->right = new Node(val);\n"
            "            return;\n"
            "        } else q.push(curr->right);\n"
            "    }\n"
            "}";
    }
    if (op == "tree-search") {
        return
            "#include <iostream>\n"
            "#include <queue>\n"
            "\n"
            "bool searchBinaryTree(Node* root, int target) {\n"
            "    if (!root) return false;\n"
            "    std::queue<Node*> q;\n"
            "    q.push(root);\n"
            "    while (!q.empty()) {\n"
            "        Node* curr = q.front(); q.pop();\n"
            "        if (curr->value == target) return true;\n"
            "        if (curr->left) q.push(curr->left);\n"
            "        if (curr->right) q.push(curr->right);\n"
            "    }\n"
            "    return false;\n"
            "}";
    }
    if (op == "tree-size") {
        return
            "int countSize(Node* root) {\n"
            "    if (!root) {\n"
            "        return 0;\n"
            "    }\n"
            "    int leftSize = countSize(root->left);\n"
            "    int rightSize = countSize(root->right);\n"
            "    return 1 + leftSize + rightSize;\n"
            "}";
    }
    if (op == "tree-height") {
        return
            "#include <algorithm>\n"
            "\n"
            "int calculateHeight(Node* root) {\n"
            "    if (!root) return 0;\n"
            "    int leftH = calculateHeight(root->left);\n"
            "    int rightH = calculateHeight(root->right);\n"
            "    return 1 + std::max(leftH, rightH);\n"
            "}";
    }
    if (op == "tree-leaves") {
        return
            "int countLeaves(Node* root) {\n"
            "    if (!root) return 0;\n"
            "    if (!root->left && !root->right) return 1;\n"
            "    return countLeaves(root->left) + countLeaves(root->right);\n"
            "}";
    }
    if (op == "traversals-preorder" || op == "tree-preorder") {
        return
            "void preorder(Node* node) {\n"
            "    if (!node) {\n"
            "        return;\n"
            "    }\n"
            "    visit(node); // Root\n"
            "    preorder(node->left);  // Left subtree\n"
            "    preorder(node->right); // Right subtree\n"
            "}";
    }
    if (op == "traversals-inorder" || op == "tree-inorder") {
        return
            "void inorder(Node* node) {\n"
            "    if (!node) {\n"
            "        return;\n"
            "    }\n"
            "    inorder(node->left);   // Left subtree\n"
            "    visit(node); // Root\n"
            "    inorder(node->right);  // Right subtree\n"
            "}";
    }
    if (op == "traversals-postorder" || op == "tree-postorder") {
        return
            "void postorder(Node* node) {\n"
            "    if (!node) {\n"
            "        return;\n"
            "    }\n"
            "    postorder(node->left);  // Left subtree\n"
            "    postorder(node->right); // Right subtree\n"
            "    visit(node); // Root\n"
            "}";
    }
    if (op == "traversals-levelorder" || op == "tree-levelorder") {
        return
            "#include <queue>\n"
            "\n"
            "void levelOrder(Node* root) {\n"
            "    if (!root) return;\n"
            "    std::queue<Node*> q;\n"
            "    q.push(root);\n"
            "    while (!q.empty()) {\n"
            "        Node* curr = q.front(); q.pop();\n"
            "        visit(curr);\n"
            "        if (curr->left) q.push(curr->left);\n"
            "        if (curr->right) q.push(curr->right);\n"
            "    }\n"
            "}";
    }
    if (op == "bst-insert" || op == "binary-search-tree") {
        return
            "Node* insertBST(Node* root, int val) {\n"
            "    if (!root) return new Node(val);\n"
            "    if (val < root->value) {\n"
            "        root->left = insertBST(root->left, val);\n"
            "    } else if (val > root->value) {\n"
            "        root->right = insertBST(root->right, val);\n"
            "    }\n"
            "    // Duplicate keys rejected by policy\n"
            "    return root;\n"
            "}";
    }
    if (op == "bst-search") {
        return
            "Node* searchBST(Node* root, int target) {\n"
            "    if (!root || root->value == target) return root;\n"
            "    if (target < root->value) {\n"
            "        return searchBST(root->left, target);\n"
            "    }\n"
            "    return searchBST(root->right, target);\n"
            "}";
    }
    if (op == "bst-delete") {
        return
            "Node* deleteNode(Node* root, int target) {\n"
            "    if (!root) return nullptr;\n"
            "    if (target < root->value) root->left = deleteNode(root->left, target);\n"
            "    else if (target > root->value) root->right = deleteNode(root->right, target);\n"
            "    else {\n"
            "        // Case 1: Leaf node\n"
            "        if (!root->left && !root->right) { delete root; return nullptr; }\n"
            "        // Case 2: One child\n"
            "        if (!root->left) { Node* temp = root->right; delete root; return temp; }\n"
            "        if (!root->right) { Node* temp = root->left; delete root; return temp; }\n"
            "        // Case 3: Two children (Inorder Successor)\n"
            "        Node* succ = minValueNode(root->right);\n"
            "        root->value = succ->value;\n"
            "        root->right = deleteNode(root->right, succ->value);\n"
            "    }\n"
            "    return root;\n"
            "}";
    }
    if (op == "bst-min") {
        return
            "Node* findMin(Node* root) {\n"
            "    if (!root) return nullptr;\n"
            "    Node* curr = root;\n"
            "    while (curr->left) {\n"
            "        curr = curr->left;\n"
            "    }\n"
            "    return curr;\n"
            "}";
    }
    if (op == "bst-max") {
        return
            "Node* findMax(Node* root) {\n"
            "    if (!root) return nullptr;\n"
            "    Node* curr = root;\n"
            "    while (curr->right) {\n"
            "        curr = curr->right;\n"
            "    }\n"
            "    return curr;\n"
            "}";
    }
    if (op == "min-heap" || op == "min-heap-build" || op == "min-heap-insert") {
        return
            "#include <vector>\n"
            "#include <utility>\n"
            "\n"
            "void siftDown(std::vector<int>& heap, int n, int i) {\n"
            "    int smallest = i;\n"
            "    int left = 2 * i + 1, right = 2 * i + 2;\n"
            "    if (left < n && heap[left] < heap[smallest]) smallest = left;\n"
            "    if (right < n && heap[right] < heap[smallest]) smallest = right;\n"
            "    if (smallest != i) {\n"
            "        std::swap(heap[i], heap[smallest]);\n"
            "        siftDown(heap, n, smallest);\n"
            "    }\n"
            "}\n"
            "\n"
            "void buildMinHeap(std::vector<int>& heap) {\n"
            "    int n = heap.size();\n"
            "    for (int i = (n / 2) - 1; i >= 0; --i) {\n"
            "        siftDown(heap, n, i);\n"
            "    }\n"
            "}";
    }
    if (op == "max-heap" || op == "max-heap-build" || op == "max-heap-insert") {
        return
            "#include <vector>\n"
            "#include <utility>\n"
            "\n"
            "void siftDown(std::vector<int>& heap, int n, int i) {\n"
            "    int largest = i;\n"
            "    int left = 2 * i + 1, right = 2 * i + 2;\n"
            "    if (left < n && heap[left] > heap[largest]) largest = left;\n"
            "    if (right < n && heap[right] > heap[largest]) largest = right;\n"
            "    if (largest != i) {\n"
            "        std::swap(heap[i], heap[largest]);\n"
            "        siftDown(heap, n, largest);\n"
            "    }\n"
            "}\n"
            "\n"
            "void buildMaxHeap(std::vector<int>& heap) {\n"
            "    int n = heap.size();\n"
            "    for (int i = (n / 2) - 1; i >= 0; --i) {\n"
            "        siftDown(heap, n, i);\n"
            "    }\n"
            "}";
    }
    return "// C++ source code not available";
}
