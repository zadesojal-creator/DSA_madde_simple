#ifndef TREE_HEAP_ALGORITHMS_HPP
#define TREE_HEAP_ALGORITHMS_HPP

#include <vector>
#include <string>
#include "trace_event.hpp"

// Binary Tree Node representation
struct TreeNode {
    int id;
    int value;
    TreeNode* left;
    TreeNode* right;

    explicit TreeNode(int id, int val)
        : id(id), value(val), left(nullptr), right(nullptr) {}
};

// Memory clean up
void destroyTree(TreeNode* root);

// Snapshot converter
void captureTreeSnapshot(TreeNode* root, std::vector<TreeNodeSnapshot>& nodes, int depth = 0, int parentId = -1);

// 1. Binary Tree Operations
void traceBinaryTreeBuild(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void traceBinaryTreeInsert(const std::vector<std::string>& tokens, int val, TraceEmitter& emitter);
void traceBinaryTreeSearch(const std::vector<std::string>& tokens, int target, TraceEmitter& emitter);
void traceBinaryTreeSize(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void traceBinaryTreeHeight(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void traceBinaryTreeLeaves(const std::vector<std::string>& tokens, TraceEmitter& emitter);

// 2. Tree Traversals
void tracePreorder(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void traceInorder(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void tracePostorder(const std::vector<std::string>& tokens, TraceEmitter& emitter);
void traceLevelOrder(const std::vector<std::string>& tokens, TraceEmitter& emitter);

// 3. Binary Search Tree Operations
void traceBstInsert(const std::vector<int>& initialValues, int val, TraceEmitter& emitter);
void traceBstSearch(const std::vector<int>& initialValues, int target, TraceEmitter& emitter);
void traceBstDelete(const std::vector<int>& initialValues, int target, TraceEmitter& emitter);
void traceBstFindMin(const std::vector<int>& initialValues, TraceEmitter& emitter);
void traceBstFindMax(const std::vector<int>& initialValues, TraceEmitter& emitter);
void traceBstInorder(const std::vector<int>& initialValues, TraceEmitter& emitter);
void traceBstPredSucc(const std::vector<int>& initialValues, int target, TraceEmitter& emitter);

// 4. Binary Heaps Operations
void traceHeapBuild(std::vector<int> arr, bool isMinHeap, TraceEmitter& emitter);
void traceHeapInsert(std::vector<int> arr, int val, bool isMinHeap, TraceEmitter& emitter);
void traceHeapExtract(std::vector<int> arr, bool isMinHeap, TraceEmitter& emitter);
void traceHeapPeek(const std::vector<int>& arr, bool isMinHeap, TraceEmitter& emitter);

// Canonical C++ source codes
std::string getTreeHeapSourceCode(const std::string& op);

#endif // TREE_HEAP_ALGORITHMS_HPP
