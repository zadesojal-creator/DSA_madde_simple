#include "../include/tree_heap_algorithms.hpp"
#include <iostream>
#include <cassert>
#include <vector>
#include <string>

void testBinaryTreeOperations() {
    std::cout << "Testing Binary Tree operations..." << std::endl;

    // 1. Level-order build
    {
        TraceEmitter emitter;
        std::vector<std::string> tokens = {"1", "2", "3", "null", "4"};
        traceBinaryTreeBuild(tokens, emitter);
        assert(emitter.getEvents().size() >= 3);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        assert(events.back().treeNodes.size() == 4);
    }

    // 2. Search found and not found
    {
        TraceEmitter emitter;
        std::vector<std::string> tokens = {"10", "5", "15", "null", "null", "12", "20"};
        traceBinaryTreeSearch(tokens, 12, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        assert(events.back().variables.at("found") == "true");

        TraceEmitter emitter2;
        traceBinaryTreeSearch(tokens, 999, emitter2);
        const auto& events2 = emitter2.getEvents();
        assert(events2.back().isCompleted);
        assert(events2.back().variables.at("found") == "false");
    }

    // 3. Node count, leaves, height
    {
        TraceEmitter emitter;
        std::vector<std::string> tokens = {"1", "2", "3", "4", "5"};
        traceBinaryTreeSize(tokens, emitter);
        assert(emitter.getEvents().back().variables.at("totalNodes") == "5");

        TraceEmitter emitterLeaves;
        traceBinaryTreeLeaves(tokens, emitterLeaves);
        assert(emitterLeaves.getEvents().back().variables.at("leafCount") == "3");

        TraceEmitter emitterHeight;
        traceBinaryTreeHeight(tokens, emitterHeight);
        assert(emitterHeight.getEvents().back().variables.at("height") == "3");
    }

    // 4. Binary tree level-order insertion (distinct from BST)
    {
        TraceEmitter emitter;
        std::vector<std::string> tokens = {"1", "2", "3"};
        traceBinaryTreeInsert(tokens, 4, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        assert(events.back().treeNodes.size() == 4);
    }

    std::cout << "  ✓ Binary Tree operations passed." << std::endl;
}

void testTreeTraversals() {
    std::cout << "Testing Tree Traversals..." << std::endl;
    // Tree:
    //       1
    //     /   \
    //    2     3
    //   / \
    //  4   5
    std::vector<std::string> tokens = {"1", "2", "3", "4", "5"};

    // Preorder: 1, 2, 4, 5, 3
    {
        TraceEmitter emitter;
        tracePreorder(tokens, emitter);
        const auto& events = emitter.getEvents();
        const auto& out = events.back().traversalOutput;
        std::vector<int> expected = {1, 2, 4, 5, 3};
        assert(out == expected);
    }

    // Inorder: 4, 2, 5, 1, 3
    {
        TraceEmitter emitter;
        traceInorder(tokens, emitter);
        const auto& events = emitter.getEvents();
        const auto& out = events.back().traversalOutput;
        std::vector<int> expected = {4, 2, 5, 1, 3};
        assert(out == expected);
    }

    // Postorder: 4, 5, 2, 3, 1
    {
        TraceEmitter emitter;
        tracePostorder(tokens, emitter);
        const auto& events = emitter.getEvents();
        const auto& out = events.back().traversalOutput;
        std::vector<int> expected = {4, 5, 2, 3, 1};
        assert(out == expected);
    }

    // Level-order: 1, 2, 3, 4, 5
    {
        TraceEmitter emitter;
        traceLevelOrder(tokens, emitter);
        const auto& events = emitter.getEvents();
        const auto& out = events.back().traversalOutput;
        std::vector<int> expected = {1, 2, 3, 4, 5};
        assert(out == expected);
    }

    std::cout << "  ✓ Tree Traversals passed." << std::endl;
}

void testBstOperations() {
    std::cout << "Testing BST operations..." << std::endl;

    // 1. Insert & Inorder sorted property
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 20, 40, 60, 80};
        traceBstInorder(vals, emitter);
        const auto& out = emitter.getEvents().back().traversalOutput;
        std::vector<int> expected = {20, 30, 40, 50, 60, 70, 80};
        assert(out == expected);
    }

    // 2. Duplicate rejection policy
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70};
        traceBstInsert(vals, 30, emitter);
        const auto& events = emitter.getEvents();
        bool rejected = false;
        for (const auto& ev : events) {
            if (ev.eventType == "duplicate_rejected") rejected = true;
        }
        assert(rejected);
        assert(events.back().treeNodes.size() == 3); // unchanged
    }

    // 3. Search found & not found
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 20, 40};
        traceBstSearch(vals, 40, emitter);
        assert(emitter.getEvents().back().variables.at("found") == "true");

        TraceEmitter emitter2;
        traceBstSearch(vals, 99, emitter2);
        assert(emitter2.getEvents().back().variables.at("found") == "false");
    }

    // 4. Min and Max
    {
        TraceEmitter emitterMin;
        std::vector<int> vals = {50, 30, 70, 20, 80};
        traceBstFindMin(vals, emitterMin);
        assert(emitterMin.getEvents().back().variables.at("minimum") == "20");

        TraceEmitter emitterMax;
        traceBstFindMax(vals, emitterMax);
        assert(emitterMax.getEvents().back().variables.at("maximum") == "80");
    }

    // 5. Predecessor and Successor
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 20, 40, 60, 80};
        traceBstPredSucc(vals, 50, emitter);
        assert(emitter.getEvents().back().isCompleted);
    }

    // 6. Delete Case 1: Leaf node (20)
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 20, 40};
        traceBstDelete(vals, 20, emitter);
        const auto& nodes = emitter.getEvents().back().treeNodes;
        assert(nodes.size() == 4);
        for (const auto& n : nodes) assert(n.value != 20);
    }

    // 7. Delete Case 2: One child (30 with only right child 40)
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 40};
        traceBstDelete(vals, 30, emitter);
        const auto& nodes = emitter.getEvents().back().treeNodes;
        assert(nodes.size() == 3);
        for (const auto& n : nodes) assert(n.value != 30);
    }

    // 8. Delete Case 3: Two children (50 root replaced by inorder successor 60)
    {
        TraceEmitter emitter;
        std::vector<int> vals = {50, 30, 70, 20, 40, 60, 80};
        traceBstDelete(vals, 50, emitter);
        const auto& nodes = emitter.getEvents().back().treeNodes;
        assert(nodes.size() == 6);
        for (const auto& n : nodes) assert(n.value != 50);
    }

    std::cout << "  ✓ BST operations passed." << std::endl;
}

void testHeapOperations() {
    std::cout << "Testing Heap operations..." << std::endl;

    // 1. Min-Heap bottom-up build
    {
        TraceEmitter emitter;
        std::vector<int> arr = {9, 5, 2, 7, 1, 8};
        traceHeapBuild(arr, true, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        const auto& heap = events.back().arrayState;
        assert(heap[0] == 1); // min element at root
        for (size_t i = 0; i < heap.size(); ++i) {
            size_t left = 2 * i + 1;
            size_t right = 2 * i + 2;
            if (left < heap.size()) assert(heap[i] <= heap[left]);
            if (right < heap.size()) assert(heap[i] <= heap[right]);
        }
    }

    // 2. Max-Heap bottom-up build
    {
        TraceEmitter emitter;
        std::vector<int> arr = {3, 10, 1, 14, 8, 20, 7};
        traceHeapBuild(arr, false, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        const auto& heap = events.back().arrayState;
        assert(heap[0] == 20); // max element at root
        for (size_t i = 0; i < heap.size(); ++i) {
            size_t left = 2 * i + 1;
            size_t right = 2 * i + 2;
            if (left < heap.size()) assert(heap[i] >= heap[left]);
            if (right < heap.size()) assert(heap[i] >= heap[right]);
        }
    }

    // 3. Min-Heap Insert with sift-up
    {
        TraceEmitter emitter;
        std::vector<int> arr = {3, 5, 8, 10};
        traceHeapInsert(arr, 1, true, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        const auto& heap = events.back().arrayState;
        assert(heap[0] == 1);
    }

    // 4. Max-Heap Extract with sift-down
    {
        TraceEmitter emitter;
        std::vector<int> arr = {50, 30, 40, 10, 20};
        traceHeapExtract(arr, false, emitter);
        const auto& events = emitter.getEvents();
        assert(events.back().isCompleted);
        assert(events.back().variables.at("extracted") == "50");
        const auto& heap = events.back().arrayState;
        assert(heap.size() == 4);
        assert(heap[0] == 40);
    }

    std::cout << "  ✓ Heap operations passed." << std::endl;
}

int main() {
    std::cout << "Running Tree and Heap C++ Test Suite..." << std::endl;
    testBinaryTreeOperations();
    testTreeTraversals();
    testBstOperations();
    testHeapOperations();
    std::cout << "ALL TREE AND HEAP C++ TESTS PASSED SUCCESSFULLY!" << std::endl;
    return 0;
}
