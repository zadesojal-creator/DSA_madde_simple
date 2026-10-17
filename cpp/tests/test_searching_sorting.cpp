#include "../include/searching_sorting.hpp"
#include <iostream>
#include <cassert>
#include <vector>
#include <algorithm>
#include <map>

// Helper to check multiset equivalence
static bool isMultisetEqual(const std::vector<int>& a, const std::vector<int>& b) {
    if (a.size() != b.size()) return false;
    std::vector<int> sortedA = a;
    std::vector<int> sortedB = b;
    std::sort(sortedA.begin(), sortedA.end());
    std::sort(sortedB.begin(), sortedB.end());
    return sortedA == sortedB;
}

// -------------------------------------------------------------------
// 1. Searching Tests
// -------------------------------------------------------------------
void testLinearSearch() {
    std::cout << "Testing C++ Linear Search..." << std::endl;

    // First element
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40};
        int idx = traceLinearSearchAlgorithm(arr, 10, emitter);
        assert(idx == 0);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().eventType == "found");
        assert(emitter.getEvents().back().variables.at("foundIndex") == "0");
    }

    // Last element
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40};
        int idx = traceLinearSearchAlgorithm(arr, 40, emitter);
        assert(idx == 3);
        assert(emitter.getEvents().back().variables.at("foundIndex") == "3");
    }

    // Absent element
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40};
        int idx = traceLinearSearchAlgorithm(arr, 99, emitter);
        assert(idx == -1);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().eventType == "not_found");
        assert(emitter.getEvents().back().variables.at("return") == "-1");
    }

    // Empty array
    {
        TraceEmitter emitter;
        int idx = traceLinearSearchAlgorithm({}, 42, emitter);
        assert(idx == -1);
        assert(emitter.getEvents().back().eventType == "not_found");
    }

    // Single-element array (found & absent)
    {
        TraceEmitter emitter1;
        int idx1 = traceLinearSearchAlgorithm({42}, 42, emitter1);
        assert(idx1 == 0);

        TraceEmitter emitter2;
        int idx2 = traceLinearSearchAlgorithm({42}, 99, emitter2);
        assert(idx2 == -1);
    }

    // Duplicates (must return first occurrence index)
    {
        TraceEmitter emitter;
        std::vector<int> arr = {5, 15, 25, 15, 35};
        int idx = traceLinearSearchAlgorithm(arr, 15, emitter);
        assert(idx == 1);
        assert(emitter.getEvents().back().variables.at("foundIndex") == "1");
    }

    // Negative values
    {
        TraceEmitter emitter;
        std::vector<int> arr = {-50, -20, 0, 30};
        int idx = traceLinearSearchAlgorithm(arr, -20, emitter);
        assert(idx == 1);
    }

    std::cout << "  ✓ Linear search tests passed." << std::endl;
}

void testBinarySearch() {
    std::cout << "Testing C++ Binary Search..." << std::endl;

    // Target at first index
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40, 50};
        int idx = traceBinarySearchAlgorithm(arr, 10, emitter);
        assert(idx == 0);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().eventType == "found");
    }

    // Target at last index
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40, 50};
        int idx = traceBinarySearchAlgorithm(arr, 50, emitter);
        assert(idx == 4);
        assert(emitter.getEvents().back().isCompleted == true);
    }

    // Target absent
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, 20, 30, 40, 50};
        int idx = traceBinarySearchAlgorithm(arr, 35, emitter);
        assert(idx == -1);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().eventType == "not_found");
    }

    // Empty array
    {
        TraceEmitter emitter;
        int idx = traceBinarySearchAlgorithm({}, 10, emitter);
        assert(idx == -1);
    }

    // Single element
    {
        TraceEmitter emitter1;
        int idx1 = traceBinarySearchAlgorithm({100}, 100, emitter1);
        assert(idx1 == 0);

        TraceEmitter emitter2;
        int idx2 = traceBinarySearchAlgorithm({100}, 50, emitter2);
        assert(idx2 == -1);
    }

    // Unsorted array must be rejected with error trace
    {
        TraceEmitter emitter;
        std::vector<int> arr = {50, 10, 40, 20};
        int idx = traceBinarySearchAlgorithm(arr, 20, emitter);
        assert(idx == -1);
        assert(emitter.getEvents().back().eventType == "error");
        assert(emitter.getEvents().back().variables.at("error") == "UnsortedArray");
    }

    // Negative numbers and duplicates in sorted array
    {
        TraceEmitter emitter;
        std::vector<int> arr = {-30, -10, 0, 20, 20, 50};
        int idx = traceBinarySearchAlgorithm(arr, -10, emitter);
        assert(idx == 1);

        TraceEmitter emitterDup;
        int idxDup = traceBinarySearchAlgorithm(arr, 20, emitterDup);
        assert(idxDup >= 3 && idxDup <= 4);
    }

    std::cout << "  ✓ Binary search tests passed." << std::endl;
}

// -------------------------------------------------------------------
// 2. Generic Sorting Test Suite Runner
// -------------------------------------------------------------------
typedef void (*SortFunc)(std::vector<int>, TraceEmitter&);

void runSortingTestSuite(const std::string& name, SortFunc sortFunc) {
    std::cout << "Testing C++ " << name << "..." << std::endl;

    std::vector<std::vector<int>> testCases = {
        {},                                         // Empty
        {42},                                       // Single element
        {1, 2, 3, 4, 5},                            // Already sorted
        {5, 4, 3, 2, 1},                            // Reverse sorted
        {7, 7, 7, 7},                               // All values equal
        {3, -5, 8, -2, 0, 14, -12},                 // Negative values
        {5, 2, 8, 2, 5, 1, 8, 3},                   // Duplicate values
        {29, 10, 14, 37, 13},                       // Random small
        {18, 5, 100, -3, 22, 0, 77, 45, 12, -9, 8}  // Multi-element
    };

    for (const auto& original : testCases) {
        TraceEmitter emitter;
        sortFunc(original, emitter);

        const auto& events = emitter.getEvents();
        assert(!events.empty());
        const auto& lastEvent = events.back();
        assert(lastEvent.isCompleted == true);

        // Verification 1: Final array is sorted in nondecreasing order
        const auto& finalArr = lastEvent.arrayState;
        assert(isSortedAscending(finalArr));

        // Verification 2: Output contains exactly the same multiset of values
        assert(isMultisetEqual(original, finalArr));

        // Verification 3: Every event has valid line and metadata
        for (const auto& ev : events) {
            assert(ev.sourceLine > 0);
            assert(!ev.title.empty());
            assert(ev.comparisons >= 0);
            assert(ev.swaps >= 0);
            assert(ev.writes >= 0);
        }

        // Verification 4: Deterministic replay
        TraceEmitter emitter2;
        sortFunc(original, emitter2);
        assert(emitter.getEvents().size() == emitter2.getEvents().size());
        for (size_t s = 0; s < emitter.getEvents().size(); ++s) {
            assert(emitter.getEvents()[s].arrayState == emitter2.getEvents()[s].arrayState);
            assert(emitter.getEvents()[s].sourceLine == emitter2.getEvents()[s].sourceLine);
        }
    }

    std::cout << "  ✓ " << name << " tests passed." << std::endl;
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "Running Searching & Sorting C++ Tests" << std::endl;
    std::cout << "========================================" << std::endl;

    testLinearSearch();
    testBinarySearch();
    runSortingTestSuite("Bubble Sort", traceBubbleSortAlgorithm);
    runSortingTestSuite("Selection Sort", traceSelectionSortAlgorithm);
    runSortingTestSuite("Insertion Sort", traceInsertionSortAlgorithm);
    runSortingTestSuite("Merge Sort", traceMergeSortAlgorithm);
    runSortingTestSuite("Quick Sort", traceQuickSortAlgorithm);

    std::cout << "========================================" << std::endl;
    std::cout << "All C++ Searching & Sorting Tests Passed!" << std::endl;
    std::cout << "========================================" << std::endl;

    return 0;
}
