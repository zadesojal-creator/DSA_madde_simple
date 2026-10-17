#include "../include/algorithms.hpp"
#include <iostream>
#include <cassert>
#include <vector>

void testArrayBasics() {
    std::cout << "Testing Array Basics..." << std::endl;
    // Empty array
    {
        TraceEmitter emitter;
        traceArrayBasics({}, emitter);
        assert(emitter.getEvents().size() == 1);
        assert(emitter.getEvents()[0].isCompleted == true);
        assert(emitter.getEvents()[0].arrayState.empty());
    }
    // Single element
    {
        TraceEmitter emitter;
        traceArrayBasics({42}, emitter);
        assert(emitter.getEvents().size() > 1);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().arrayState.size() == 1);
    }
    // Standard array with negatives and duplicates
    {
        TraceEmitter emitter;
        std::vector<int> arr = {-5, 10, 10, 25};
        traceArrayBasics(arr, emitter);
        assert(emitter.getEvents().size() > 5);
        for (const auto& ev : emitter.getEvents()) {
            assert(ev.sourceLine > 0);
            assert(!ev.title.empty());
        }
    }
}

void testArrayTraversal() {
    std::cout << "Testing Array Traversal..." << std::endl;
    // Empty array
    {
        TraceEmitter emitter;
        traceArrayTraversal({}, emitter);
        assert(emitter.getEvents().size() == 1);
        assert(emitter.getEvents()[0].isCompleted == true);
    }
    // Single element
    {
        TraceEmitter emitter;
        traceArrayTraversal({99}, emitter);
        assert(emitter.getEvents().size() >= 3);
        assert(emitter.getEvents().back().isCompleted == true);
    }
    // Multi-element
    {
        TraceEmitter emitter;
        std::vector<int> arr = {10, -20, 30};
        traceArrayTraversal(arr, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("totalVisited") == "3");
    }
}

void testAccessByIndex() {
    std::cout << "Testing Access By Index..." << std::endl;
    std::vector<int> arr = {100, -200, 300, 400};
    // First valid index (0)
    {
        TraceEmitter emitter;
        traceAccessByIndex(arr, 0, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("return") == "100");
    }
    // Last valid index (size - 1)
    {
        TraceEmitter emitter;
        traceAccessByIndex(arr, 3, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("return") == "400");
    }
    // Invalid index (negative)
    {
        TraceEmitter emitter;
        traceAccessByIndex(arr, -1, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("error") == "IndexOutOfBounds");
    }
    // Invalid index (out of range)
    {
        TraceEmitter emitter;
        traceAccessByIndex(arr, 10, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("error") == "IndexOutOfBounds");
    }
    // Empty array
    {
        TraceEmitter emitter;
        traceAccessByIndex({}, 0, emitter);
        assert(emitter.getEvents().back().variables.at("error") == "IndexOutOfBounds");
    }
}

void testUpdateElement() {
    std::cout << "Testing Update Element..." << std::endl;
    std::vector<int> arr = {10, 20, 30};
    // Update first (0)
    {
        TraceEmitter emitter;
        traceUpdateElement(arr, 0, 999, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
        assert(emitter.getEvents().back().variables.at("result") == "true");
        // Verify final array state
        const auto& evs = emitter.getEvents();
        assert(evs[evs.size() - 2].arrayState[0] == 999);
    }
    // Update middle (1)
    {
        TraceEmitter emitter;
        traceUpdateElement(arr, 1, -50, emitter);
        assert(emitter.getEvents().back().variables.at("result") == "true");
    }
    // Update last (2)
    {
        TraceEmitter emitter;
        traceUpdateElement(arr, 2, 777, emitter);
        assert(emitter.getEvents().back().variables.at("result") == "true");
    }
    // Invalid index
    {
        TraceEmitter emitter;
        traceUpdateElement(arr, 5, 123, emitter);
        assert(emitter.getEvents().back().variables.at("result") == "false");
    }
}

void testInsertElement() {
    std::cout << "Testing Insert Element..." << std::endl;
    std::vector<int> arr = {10, 20, 30};
    // Insert at beginning (0)
    {
        TraceEmitter emitter;
        traceInsertElement(arr, 0, 99, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.size() == 4);
        assert(last.arrayState[0] == 99);
        assert(last.arrayState[1] == 10);
    }
    // Insert at middle (1)
    {
        TraceEmitter emitter;
        traceInsertElement(arr, 1, 55, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState[1] == 55);
        assert(last.arrayState[2] == 20);
    }
    // Insert at end (size)
    {
        TraceEmitter emitter;
        traceInsertElement(arr, 3, 100, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState[3] == 100);
    }
    // Insert into empty array at 0
    {
        TraceEmitter emitter;
        traceInsertElement({}, 0, 42, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.size() == 1);
        assert(last.arrayState[0] == 42);
    }
    // Invalid index
    {
        TraceEmitter emitter;
        traceInsertElement(arr, -1, 42, emitter);
        assert(emitter.getEvents().back().variables.at("error") == "IndexOutOfBounds");
    }
}

void testDeleteElement() {
    std::cout << "Testing Delete Element..." << std::endl;
    std::vector<int> arr = {10, 20, 30, 40};
    // Delete from beginning (0)
    {
        TraceEmitter emitter;
        traceDeleteElement(arr, 0, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.size() == 3);
        assert(last.arrayState[0] == 20);
    }
    // Delete from middle (1)
    {
        TraceEmitter emitter;
        traceDeleteElement(arr, 1, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.size() == 3);
        assert(last.arrayState[0] == 10);
        assert(last.arrayState[1] == 30);
    }
    // Delete from end (size - 1)
    {
        TraceEmitter emitter;
        traceDeleteElement(arr, 3, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.size() == 3);
        assert(last.arrayState[2] == 30);
    }
    // Delete from single-element
    {
        TraceEmitter emitter;
        traceDeleteElement({99}, 0, emitter);
        const auto& last = emitter.getEvents().back();
        assert(last.isCompleted == true);
        assert(last.arrayState.empty());
    }
    // Invalid index
    {
        TraceEmitter emitter;
        traceDeleteElement(arr, 10, emitter);
        assert(emitter.getEvents().back().variables.at("error") == "IndexOutOfBounds");
    }
}

void testLinearSearch() {
    std::cout << "Testing Linear Search..." << std::endl;
    std::vector<int> arr = {10, 20, 20, 30, -5};
    // Success: first element
    {
        TraceEmitter emitter;
        int res = traceLinearSearch(arr, 10, emitter);
        assert(res == 0);
        assert(emitter.getEvents().back().variables.at("foundIndex") == "0");
    }
    // Success: duplicates (must return first occurrence index 1)
    {
        TraceEmitter emitter;
        int res = traceLinearSearch(arr, 20, emitter);
        assert(res == 1);
        assert(emitter.getEvents().back().variables.at("foundIndex") == "1");
    }
    // Success: negative number
    {
        TraceEmitter emitter;
        int res = traceLinearSearch(arr, -5, emitter);
        assert(res == 4);
    }
    // Failure: missing target
    {
        TraceEmitter emitter;
        int res = traceLinearSearch(arr, 999, emitter);
        assert(res == -1);
        assert(emitter.getEvents().back().variables.at("return") == "-1");
    }
    // Empty array
    {
        TraceEmitter emitter;
        int res = traceLinearSearch({}, 10, emitter);
        assert(res == -1);
    }
}

void testBinarySearch() {
    std::cout << "Testing Binary Search..." << std::endl;
    std::vector<int> arr = {-10, 0, 15, 30, 45, 60, 75};
    // Success: middle
    {
        TraceEmitter emitter;
        int res = traceBinarySearch(arr, 30, emitter);
        assert(res == 3);
        assert(emitter.getEvents().back().isCompleted == true);
    }
    // Success: first element
    {
        TraceEmitter emitter;
        int res = traceBinarySearch(arr, -10, emitter);
        assert(res == 0);
    }
    // Success: last element
    {
        TraceEmitter emitter;
        int res = traceBinarySearch(arr, 75, emitter);
        assert(res == 6);
    }
    // Failure: absent value
    {
        TraceEmitter emitter;
        int res = traceBinarySearch(arr, 25, emitter);
        assert(res == -1);
        assert(emitter.getEvents().back().variables.at("return") == "-1");
    }
    // Empty array
    {
        TraceEmitter emitter;
        int res = traceBinarySearch({}, 10, emitter);
        assert(res == -1);
    }
    // Unsorted array: must be rejected with error
    {
        TraceEmitter emitter;
        int res = traceBinarySearch({30, 10, 20}, 10, emitter);
        assert(res == -1);
        assert(emitter.getEvents().back().variables.at("error") == "ArrayNotSorted");
    }
    // Duplicates in sorted array
    {
        TraceEmitter emitter;
        std::vector<int> dup = {10, 20, 20, 20, 30};
        int res = traceBinarySearch(dup, 20, emitter);
        assert(res >= 1 && res <= 3); // Valid index of a duplicate match
        assert(dup[res] == 20);
    }
}

int main() {
    std::cout << "=== Running C++ Array Algorithm Test Suite ===" << std::endl;
    testArrayBasics();
    testArrayTraversal();
    testAccessByIndex();
    testUpdateElement();
    testInsertElement();
    testDeleteElement();
    testLinearSearch();
    testBinarySearch();
    std::cout << "=== All C++ Algorithm Tests Passed Successfully! ===" << std::endl;
    return 0;
}
