#ifndef ALGORITHMS_HPP
#define ALGORITHMS_HPP

#include <vector>
#include <string>
#include "trace_event.hpp"

// Algorithm function prototypes
void traceArrayBasics(const std::vector<int>& arr, TraceEmitter& emitter);
void traceArrayTraversal(const std::vector<int>& arr, TraceEmitter& emitter);
void traceAccessByIndex(const std::vector<int>& arr, int index, TraceEmitter& emitter);
void traceUpdateElement(std::vector<int> arr, int index, int newValue, TraceEmitter& emitter);
void traceInsertElement(std::vector<int> arr, int index, int value, TraceEmitter& emitter);
void traceDeleteElement(std::vector<int> arr, int index, TraceEmitter& emitter);
int traceLinearSearch(const std::vector<int>& arr, int target, TraceEmitter& emitter);
int traceBinarySearch(const std::vector<int>& arr, int target, TraceEmitter& emitter);

bool isSorted(const std::vector<int>& arr);

// Canonical C++ source code for each operation
std::string getCppSourceCode(const std::string& operationId);

#endif // ALGORITHMS_HPP
