#ifndef SEARCHING_SORTING_HPP
#define SEARCHING_SORTING_HPP

#include <vector>
#include <string>
#include "trace_event.hpp"

// Searching Algorithms
int traceLinearSearchAlgorithm(const std::vector<int>& arr, int target, TraceEmitter& emitter);
int traceBinarySearchAlgorithm(const std::vector<int>& arr, int target, TraceEmitter& emitter);

// Sorting Algorithms
void traceBubbleSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter);
void traceSelectionSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter);
void traceInsertionSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter);
void traceMergeSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter);
void traceQuickSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter);

// Utility
bool isSortedAscending(const std::vector<int>& arr);

// Canonical C++ source code display
std::string getSearchingSortingSourceCode(const std::string& op);

#endif // SEARCHING_SORTING_HPP
