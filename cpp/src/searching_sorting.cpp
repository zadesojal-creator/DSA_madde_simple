#include "../include/searching_sorting.hpp"
#include <algorithm>
#include <sstream>

bool isSortedAscending(const std::vector<int>& arr) {
    for (size_t i = 1; i < arr.size(); ++i) {
        if (arr[i] < arr[i - 1]) {
            return false;
        }
    }
    return true;
}

// -------------------------------------------------------------
// 1. Linear Search
// -------------------------------------------------------------
int traceLinearSearchAlgorithm(const std::vector<int>& arr, int target, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    std::map<int, std::string> highlights;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "linearSearch(arr, target = " + std::to_string(target) + ")";
    ev.description = "Commencing linear search on array with " + std::to_string(n) + " elements.";
    ev.sourceLine = 4;
    ev.arrayState = arr;
    ev.variables["n"] = std::to_string(n);
    ev.variables["target"] = std::to_string(target);
    ev.comparisons = 0;
    ev.statusText = "Initialized";
    emitter.emit(ev);

    for (int i = 0; i < n; ++i) {
        // Loop step
        ev = TraceEvent();
        ev.eventType = "loop_start";
        ev.title = "Check Loop: i = " + std::to_string(i) + " < " + std::to_string(n);
        ev.description = "Inspecting element at index " + std::to_string(i) + " (value = " + std::to_string(arr[i]) + ").";
        ev.sourceLine = 5;
        ev.arrayState = arr;
        ev.activeIndices = {i};
        highlights[i] = "active";
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["arr[i]"] = std::to_string(arr[i]);
        ev.variables["target"] = std::to_string(target);
        ev.comparisons = comparisons;
        ev.statusText = "Inspecting index " + std::to_string(i);
        emitter.emit(ev);

        // Comparison
        comparisons++;
        bool isMatch = (arr[i] == target);

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: arr[" + std::to_string(i) + "] (" + std::to_string(arr[i]) + ") == target (" + std::to_string(target) + ")";
        ev.description = isMatch 
            ? "Match confirmed! arr[" + std::to_string(i) + "] equals target " + std::to_string(target) + "."
            : "No match (arr[" + std::to_string(i) + "] = " + std::to_string(arr[i]) + " != " + std::to_string(target) + "). Advancing pointer.";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        ev.activeIndices = {i};
        highlights[i] = isMatch ? "found" : "compare";
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"i", i, isMatch ? "emerald" : "amber"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["arr[i]"] = std::to_string(arr[i]);
        ev.variables["target"] = std::to_string(target);
        ev.comparisons = comparisons;
        ev.statusText = isMatch ? "Match found!" : "Not a match";
        emitter.emit(ev);

        if (isMatch) {
            ev = TraceEvent();
            ev.eventType = "found";
            ev.title = "Return Index " + std::to_string(i);
            ev.description = "First occurrence of target " + std::to_string(target) + " found at index " + std::to_string(i) + " after " + std::to_string(comparisons) + " comparison(s).";
            ev.sourceLine = 7;
            ev.arrayState = arr;
            ev.activeIndices = {i};
            highlights[i] = "found";
            ev.highlightedItems = highlights;
            ev.pointers.push_back({"found", i, "emerald"});
            ev.variables["return"] = std::to_string(i);
            ev.variables["foundIndex"] = std::to_string(i);
            ev.variables["totalComparisons"] = std::to_string(comparisons);
            ev.comparisons = comparisons;
            ev.statusText = "Found at index " + std::to_string(i);
            ev.isCompleted = true;
            emitter.emit(ev);
            return i;
        }

        highlights[i] = "visited";
    }

    // Return -1
    ev = TraceEvent();
    ev.eventType = "not_found";
    ev.title = "Return -1 (Target Not Found)";
    ev.description = "All " + std::to_string(n) + " elements inspected. Target " + std::to_string(target) + " is not present. Returning -1.";
    ev.sourceLine = 10;
    ev.arrayState = arr;
    ev.highlightedItems = highlights;
    ev.variables["return"] = "-1";
    ev.variables["target"] = std::to_string(target);
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.comparisons = comparisons;
    ev.statusText = "Target absent (-1)";
    ev.isCompleted = true;
    emitter.emit(ev);
    return -1;
}

// -------------------------------------------------------------
// 2. Binary Search
// -------------------------------------------------------------
int traceBinarySearchAlgorithm(const std::vector<int>& arr, int target, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;

    // Validate sorted order precondition
    if (!isSortedAscending(arr)) {
        TraceEvent ev;
        ev.eventType = "error";
        ev.title = "Precondition Violation: Array Must Be Sorted";
        ev.description = "Binary Search requires array to be in non-decreasing sorted order. Provided input is unsorted.";
        ev.sourceLine = 4;
        ev.arrayState = arr;
        ev.variables["error"] = "UnsortedArray";
        ev.statusText = "Error: Unsorted array";
        ev.isCompleted = true;
        emitter.emit(ev);
        return -1;
    }

    int low = 0;
    int high = n - 1;
    std::map<int, std::string> highlights;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Initialize Bounds: low = 0, high = " + std::to_string(high);
    ev.description = "Search window initialized to full array range [0, " + std::to_string(high) + "]. Target = " + std::to_string(target) + ".";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    if (n > 0) {
        ev.activeIndices = {low, high};
        highlights[low] = "active";
        highlights[high] = "active";
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"high", high, "purple"});
    }
    ev.rangeLow = low;
    ev.rangeHigh = high;
    ev.variables["low"] = std::to_string(low);
    ev.variables["high"] = std::to_string(high);
    ev.variables["target"] = std::to_string(target);
    ev.comparisons = 0;
    ev.statusText = "Bounds initialized";
    emitter.emit(ev);

    while (low <= high) {
        // Condition check
        ev = TraceEvent();
        ev.eventType = "loop_start";
        ev.title = "Check Window: low (" + std::to_string(low) + ") <= high (" + std::to_string(high) + ")";
        ev.description = "Search window is valid (size = " + std::to_string(high - low + 1) + "). Proceeding to calculate midpoint.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"high", high, "purple"});
        ev.rangeLow = low;
        ev.rangeHigh = high;
        ev.variables["low"] = std::to_string(low);
        ev.variables["high"] = std::to_string(high);
        ev.variables["windowSize"] = std::to_string(high - low + 1);
        ev.comparisons = comparisons;
        ev.statusText = "Checking window bounds";
        emitter.emit(ev);

        // Midpoint calculation
        int mid = low + (high - low) / 2;
        int midVal = arr[mid];

        ev = TraceEvent();
        ev.eventType = "index_advance";
        ev.title = "Calculate mid = " + std::to_string(low) + " + (" + std::to_string(high) + " - " + std::to_string(low) + ") / 2 = " + std::to_string(mid);
        ev.description = "Midpoint index is " + std::to_string(mid) + " (arr[mid] = " + std::to_string(midVal) + ").";
        ev.sourceLine = 9;
        ev.arrayState = arr;
        highlights[mid] = "active";
        ev.highlightedItems = highlights;
        ev.activeIndices = {mid};
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"mid", mid, "amber"});
        ev.pointers.push_back({"high", high, "purple"});
        ev.rangeLow = low;
        ev.rangeHigh = high;
        ev.variables["mid"] = std::to_string(mid);
        ev.variables["arr[mid]"] = std::to_string(midVal);
        ev.comparisons = comparisons;
        ev.statusText = "Calculated mid = " + std::to_string(mid);
        emitter.emit(ev);

        // Comparison
        comparisons++;
        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: arr[" + std::to_string(mid) + "] (" + std::to_string(midVal) + ") == target (" + std::to_string(target) + ")";
        ev.sourceLine = 11;
        ev.arrayState = arr;
        highlights[mid] = (midVal == target) ? "found" : "compare";
        ev.highlightedItems = highlights;
        ev.activeIndices = {mid};
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"mid", mid, "amber"});
        ev.pointers.push_back({"high", high, "purple"});
        ev.rangeLow = low;
        ev.rangeHigh = high;
        ev.variables["arr[mid]"] = std::to_string(midVal);
        ev.variables["target"] = std::to_string(target);
        ev.comparisons = comparisons;

        if (midVal == target) {
            ev.description = "Match found! arr[" + std::to_string(mid) + "] equals target " + std::to_string(target) + ".";
            ev.statusText = "Target found at mid";
            emitter.emit(ev);

            // Return mid
            ev = TraceEvent();
            ev.eventType = "found";
            ev.title = "Return mid = " + std::to_string(mid);
            ev.description = "Target " + std::to_string(target) + " found at index " + std::to_string(mid) + " after " + std::to_string(comparisons) + " comparison(s).";
            ev.sourceLine = 12;
            ev.arrayState = arr;
            highlights[mid] = "found";
            ev.highlightedItems = highlights;
            ev.activeIndices = {mid};
            ev.pointers.push_back({"match", mid, "emerald"});
            ev.variables["return"] = std::to_string(mid);
            ev.variables["foundIndex"] = std::to_string(mid);
            ev.variables["totalComparisons"] = std::to_string(comparisons);
            ev.comparisons = comparisons;
            ev.statusText = "Found at index " + std::to_string(mid);
            ev.isCompleted = true;
            emitter.emit(ev);
            return mid;
        }

        ev.description = (midVal < target) 
            ? "arr[mid] (" + std::to_string(midVal) + ") < target (" + std::to_string(target) + "). Target must lie in the right half."
            : "arr[mid] (" + std::to_string(midVal) + ") > target (" + std::to_string(target) + "). Target must lie in the left half.";
        ev.statusText = "Comparison completed";
        emitter.emit(ev);

        if (midVal < target) {
            // Discard left half [low..mid]
            for (int k = low; k <= mid; ++k) {
                highlights[k] = "discarded";
            }
            ev = TraceEvent();
            ev.eventType = "index_advance";
            ev.title = "Update low = mid + 1 (" + std::to_string(mid + 1) + ")";
            ev.description = "Discarding left partition [" + std::to_string(low) + ".." + std::to_string(mid) + "]. New low = " + std::to_string(mid + 1) + ".";
            ev.sourceLine = 16;
            ev.arrayState = arr;
            ev.highlightedItems = highlights;
            low = mid + 1;
            if (low <= high) {
                ev.pointers.push_back({"low", low, "indigo"});
                ev.pointers.push_back({"high", high, "purple"});
            }
            ev.rangeLow = low;
            ev.rangeHigh = high;
            ev.variables["low"] = std::to_string(low);
            ev.variables["high"] = std::to_string(high);
            ev.comparisons = comparisons;
            ev.statusText = "Search space updated to right half";
            emitter.emit(ev);
        } else {
            // Discard right half [mid..high]
            for (int k = mid; k <= high; ++k) {
                highlights[k] = "discarded";
            }
            ev = TraceEvent();
            ev.eventType = "index_advance";
            ev.title = "Update high = mid - 1 (" + std::to_string(mid - 1) + ")";
            ev.description = "Discarding right partition [" + std::to_string(mid) + ".." + std::to_string(high) + "]. New high = " + std::to_string(mid - 1) + ".";
            ev.sourceLine = 18;
            ev.arrayState = arr;
            ev.highlightedItems = highlights;
            high = mid - 1;
            if (low <= high) {
                ev.pointers.push_back({"low", low, "indigo"});
                ev.pointers.push_back({"high", high, "purple"});
            }
            ev.rangeLow = low;
            ev.rangeHigh = high;
            ev.variables["low"] = std::to_string(low);
            ev.variables["high"] = std::to_string(high);
            ev.comparisons = comparisons;
            ev.statusText = "Search space updated to left half";
            emitter.emit(ev);
        }
    }

    // Not found
    ev = TraceEvent();
    ev.eventType = "not_found";
    ev.title = "Search Window Exhausted (low > high): Return -1";
    ev.description = "low (" + std::to_string(low) + ") has exceeded high (" + std::to_string(high) + "). Target " + std::to_string(target) + " not in array. Returning -1.";
    ev.sourceLine = 22;
    ev.arrayState = arr;
    ev.highlightedItems = highlights;
    ev.variables["return"] = "-1";
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.comparisons = comparisons;
    ev.statusText = "Target absent (-1)";
    ev.isCompleted = true;
    emitter.emit(ev);
    return -1;
}

// -------------------------------------------------------------
// 3. Bubble Sort
// -------------------------------------------------------------
void traceBubbleSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int swaps = 0;
    int writes = 0;
    std::map<int, std::string> highlights;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "bubbleSort(arr) Initialized";
    ev.description = "Array initialized with " + std::to_string(n) + " elements. Starting bubble sort passes.";
    ev.sourceLine = 4;
    ev.arrayState = arr;
    ev.variables["n"] = std::to_string(n);
    ev.comparisons = 0;
    ev.swaps = 0;
    ev.writes = 0;
    ev.statusText = "Initialized";
    emitter.emit(ev);

    if (n <= 1) {
        if (n == 1) highlights[0] = "sorted";
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Array is Already Sorted";
        ev.description = "Array with length <= 1 requires 0 comparisons.";
        ev.sourceLine = 18;
        ev.arrayState = arr;
        ev.highlightedItems = highlights;
        ev.comparisons = 0;
        ev.swaps = 0;
        ev.writes = 0;
        ev.statusText = "Complete";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;

        // Outer pass start
        ev = TraceEvent();
        ev.eventType = "loop_start";
        ev.title = "Start Pass " + std::to_string(i + 1) + " (i = " + std::to_string(i) + ")";
        ev.description = "Beginning pass " + std::to_string(i + 1) + ". Scanning adjacent pairs from index 0 to " + std::to_string(n - i - 2) + ".";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"pass", i, "indigo"});
        ev.variables["pass"] = std::to_string(i + 1);
        ev.variables["i"] = std::to_string(i);
        ev.passNumber = i + 1;
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = "Pass " + std::to_string(i + 1) + " started";
        emitter.emit(ev);

        for (int j = 0; j < n - i - 1; ++j) {
            // Inner loop check
            comparisons++;
            bool needSwap = (arr[j] > arr[j + 1]);

            ev = TraceEvent();
            ev.eventType = "compare";
            ev.title = "Compare arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") > arr[" + std::to_string(j + 1) + "] (" + std::to_string(arr[j + 1]) + ")";
            ev.description = needSwap
                ? "Inversion detected: " + std::to_string(arr[j]) + " > " + std::to_string(arr[j + 1]) + ". Will swap elements."
                : "Elements in order: " + std::to_string(arr[j]) + " <= " + std::to_string(arr[j + 1]) + ". No swap needed.";
            ev.sourceLine = 9;
            ev.arrayState = arr;
            ev.activeIndices = {j, j + 1};
            auto tempH = highlights;
            tempH[j] = "compare";
            tempH[j + 1] = "compare";
            ev.highlightedItems = tempH;
            ev.pointers.push_back({"j", j, "amber"});
            ev.pointers.push_back({"j+1", j + 1, "amber"});
            ev.variables["j"] = std::to_string(j);
            ev.variables["arr[j]"] = std::to_string(arr[j]);
            ev.variables["arr[j+1]"] = std::to_string(arr[j + 1]);
            ev.passNumber = i + 1;
            ev.comparisons = comparisons;
            ev.swaps = swaps;
            ev.writes = writes;
            ev.statusText = needSwap ? "Swap required" : "In order";
            emitter.emit(ev);

            if (needSwap) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
                swaps++;
                writes += 2;

                ev = TraceEvent();
                ev.eventType = "swap";
                ev.title = "Swap arr[" + std::to_string(j) + "] and arr[" + std::to_string(j + 1) + "]";
                ev.description = "Swapped values: arr[" + std::to_string(j) + "] is now " + std::to_string(arr[j]) + 
                                 ", arr[" + std::to_string(j + 1) + "] is now " + std::to_string(arr[j + 1]) + ".";
                ev.sourceLine = 10;
                ev.arrayState = arr;
                ev.activeIndices = {j, j + 1};
                tempH = highlights;
                tempH[j] = "swap";
                tempH[j + 1] = "swap";
                ev.highlightedItems = tempH;
                ev.pointers.push_back({"j", j, "emerald"});
                ev.pointers.push_back({"j+1", j + 1, "emerald"});
                ev.passNumber = i + 1;
                ev.comparisons = comparisons;
                ev.swaps = swaps;
                ev.writes = writes;
                ev.statusText = "Swapped elements";
                emitter.emit(ev);
            }
        }

        // Element at n - 1 - i is now in final sorted position
        int fixedIdx = n - 1 - i;
        highlights[fixedIdx] = "sorted";

        ev = TraceEvent();
        ev.eventType = "pass_complete";
        ev.title = "Pass " + std::to_string(i + 1) + " Complete: arr[" + std::to_string(fixedIdx) + "] Fixed";
        ev.description = "Element " + std::to_string(arr[fixedIdx]) + " bubbled to its final sorted index " + std::to_string(fixedIdx) + ".";
        ev.sourceLine = 13;
        ev.arrayState = arr;
        ev.activeIndices = {fixedIdx};
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"sorted", fixedIdx, "emerald"});
        ev.passNumber = i + 1;
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = "Element fixed at index " + std::to_string(fixedIdx);
        emitter.emit(ev);

        // Early exit check
        if (!swapped) {
            ev = TraceEvent();
            ev.eventType = "complete";
            ev.title = "Early Exit: No Swaps in Pass " + std::to_string(i + 1);
            ev.description = "Zero swaps occurred during pass " + std::to_string(i + 1) + ". Entire array is verified sorted in O(n) best-case time.";
            ev.sourceLine = 15;
            ev.arrayState = arr;
            for (int k = 0; k < n; ++k) highlights[k] = "sorted";
            ev.highlightedItems = highlights;
            ev.passNumber = i + 1;
            ev.comparisons = comparisons;
            ev.swaps = swaps;
            ev.writes = writes;
            ev.variables["earlyExit"] = "true";
            ev.variables["totalPasses"] = std::to_string(i + 1);
            ev.statusText = "Sorted early!";
            ev.isCompleted = true;
            emitter.emit(ev);
            return;
        }
    }

    // All elements fixed
    for (int k = 0; k < n; ++k) highlights[k] = "sorted";
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Bubble Sort Complete";
    ev.description = "All passes finished. Array is fully sorted.";
    ev.sourceLine = 18;
    ev.arrayState = arr;
    ev.highlightedItems = highlights;
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.writes = writes;
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.variables["totalSwaps"] = std::to_string(swaps);
    ev.statusText = "Array fully sorted";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 4. Selection Sort
// -------------------------------------------------------------
void traceSelectionSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int swaps = 0;
    int writes = 0;
    std::map<int, std::string> highlights;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "selectionSort(arr) Initialized";
    ev.description = "Array initialized with " + std::to_string(n) + " elements. Starting selection sort passes.";
    ev.sourceLine = 4;
    ev.arrayState = arr;
    ev.variables["n"] = std::to_string(n);
    ev.comparisons = 0;
    ev.swaps = 0;
    ev.writes = 0;
    ev.statusText = "Initialized";
    emitter.emit(ev);

    if (n <= 1) {
        if (n == 1) highlights[0] = "sorted";
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Array is Already Sorted";
        ev.description = "Array length <= 1 requires no selection.";
        ev.sourceLine = 17;
        ev.arrayState = arr;
        ev.highlightedItems = highlights;
        ev.statusText = "Complete";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;

        // Pass start
        ev = TraceEvent();
        ev.eventType = "loop_start";
        ev.title = "Pass " + std::to_string(i + 1) + ": Filling Position " + std::to_string(i);
        ev.description = "Target position is " + std::to_string(i) + ". Initializing minIdx = " + std::to_string(i) + " (value = " + std::to_string(arr[i]) + ").";
        ev.sourceLine = 7;
        ev.arrayState = arr;
        auto tempH = highlights;
        tempH[i] = "active";
        ev.highlightedItems = tempH;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.pointers.push_back({"min", minIdx, "amber"});
        ev.passNumber = i + 1;
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = "Pass " + std::to_string(i + 1);
        emitter.emit(ev);

        for (int j = i + 1; j < n; ++j) {
            comparisons++;
            bool newMin = (arr[j] < arr[minIdx]);

            ev = TraceEvent();
            ev.eventType = "compare";
            ev.title = "Compare: arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") < arr[" + std::to_string(minIdx) + "] (" + std::to_string(arr[minIdx]) + ")";
            ev.description = newMin
                ? "New minimum found! " + std::to_string(arr[j]) + " < " + std::to_string(arr[minIdx]) + ". Updating minIdx to " + std::to_string(j) + "."
                : "Current minimum (" + std::to_string(arr[minIdx]) + ") is <= arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ").";
            ev.sourceLine = 9;
            ev.arrayState = arr;
            ev.activeIndices = {j, minIdx};
            tempH = highlights;
            tempH[i] = "active";
            tempH[j] = "compare";
            tempH[minIdx] = "active";
            ev.highlightedItems = tempH;
            ev.pointers.push_back({"i", i, "indigo"});
            ev.pointers.push_back({"j", j, "purple"});
            ev.pointers.push_back({"min", minIdx, "amber"});
            ev.passNumber = i + 1;
            ev.comparisons = comparisons;
            ev.swaps = swaps;
            ev.writes = writes;
            ev.statusText = newMin ? "New minimum candidate" : "Scan element";
            emitter.emit(ev);

            if (newMin) {
                minIdx = j;

                ev = TraceEvent();
                ev.eventType = "index_advance";
                ev.title = "Updated minIdx = " + std::to_string(minIdx) + " (val = " + std::to_string(arr[minIdx]) + ")";
                ev.description = "Candidate minimum updated to index " + std::to_string(minIdx) + ".";
                ev.sourceLine = 10;
                ev.arrayState = arr;
                tempH = highlights;
                tempH[i] = "active";
                tempH[minIdx] = "active";
                ev.highlightedItems = tempH;
                ev.pointers.push_back({"i", i, "indigo"});
                ev.pointers.push_back({"min", minIdx, "amber"});
                ev.passNumber = i + 1;
                ev.comparisons = comparisons;
                ev.swaps = swaps;
                ev.writes = writes;
                ev.statusText = "minIdx updated";
                emitter.emit(ev);
            }
        }

        // Swap if minIdx != i
        if (minIdx != i) {
            std::swap(arr[i], arr[minIdx]);
            swaps++;
            writes += 2;

            ev = TraceEvent();
            ev.eventType = "swap";
            ev.title = "Swap arr[" + std::to_string(i) + "] with arr[" + std::to_string(minIdx) + "]";
            ev.description = "Placing minimum element (" + std::to_string(arr[i]) + ") into target slot " + std::to_string(i) + ".";
            ev.sourceLine = 14;
            ev.arrayState = arr;
            ev.activeIndices = {i, minIdx};
            tempH = highlights;
            tempH[i] = "swap";
            tempH[minIdx] = "swap";
            ev.highlightedItems = tempH;
            ev.pointers.push_back({"i", i, "emerald"});
            ev.pointers.push_back({"min", minIdx, "amber"});
            ev.passNumber = i + 1;
            ev.comparisons = comparisons;
            ev.swaps = swaps;
            ev.writes = writes;
            ev.statusText = "Swapped to position " + std::to_string(i);
            emitter.emit(ev);
        }

        highlights[i] = "sorted";

        ev = TraceEvent();
        ev.eventType = "pass_complete";
        ev.title = "arr[" + std::to_string(i) + "] Confirmed in Sorted Position";
        ev.description = "Slot " + std::to_string(i) + " now holds its correct sorted element (" + std::to_string(arr[i]) + ").";
        ev.sourceLine = 16;
        ev.arrayState = arr;
        ev.activeIndices = {i};
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"sorted", i, "emerald"});
        ev.passNumber = i + 1;
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = "Position " + std::to_string(i) + " sorted";
        emitter.emit(ev);
    }

    highlights[n - 1] = "sorted";
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Selection Sort Complete";
    ev.description = "All passes completed. All elements are in sorted order.";
    ev.sourceLine = 17;
    ev.arrayState = arr;
    ev.highlightedItems = highlights;
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.writes = writes;
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.variables["totalSwaps"] = std::to_string(swaps);
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 5. Insertion Sort
// -------------------------------------------------------------
void traceInsertionSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int writes = 0;
    std::map<int, std::string> highlights;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "insertionSort(arr) Initialized";
    ev.description = "Array initialized with " + std::to_string(n) + " elements. Prefix [0..0] is trivially sorted.";
    ev.sourceLine = 3;
    ev.arrayState = arr;
    if (n > 0) highlights[0] = "sorted";
    ev.highlightedItems = highlights;
    ev.variables["n"] = std::to_string(n);
    ev.comparisons = 0;
    ev.swaps = 0;
    ev.writes = 0;
    ev.statusText = "Initialized";
    emitter.emit(ev);

    if (n <= 1) {
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Array is Already Sorted";
        ev.description = "Array length <= 1 requires no insertions.";
        ev.sourceLine = 14;
        ev.arrayState = arr;
        ev.highlightedItems = highlights;
        ev.statusText = "Complete";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;

        // Select key
        ev = TraceEvent();
        ev.eventType = "loop_start";
        ev.title = "Select Key = arr[" + std::to_string(i) + "] (" + std::to_string(key) + ")";
        ev.description = "Inserting key " + std::to_string(key) + " into sorted prefix [0.." + std::to_string(i - 1) + "].";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        auto tempH = highlights;
        tempH[i] = "active";
        ev.highlightedItems = tempH;
        ev.activeIndices = {i};
        ev.pointers.push_back({"key", i, "amber"});
        ev.passNumber = i;
        ev.comparisons = comparisons;
        ev.writes = writes;
        ev.statusText = "Selected key = " + std::to_string(key);
        emitter.emit(ev);

        while (j >= 0) {
            comparisons++;
            bool shiftNeeded = (arr[j] > key);

            ev = TraceEvent();
            ev.eventType = "compare";
            ev.title = "Compare: arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") > key (" + std::to_string(key) + ")";
            ev.description = shiftNeeded
                ? "arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") > key (" + std::to_string(key) + "). Shift arr[" + std::to_string(j) + "] right."
                : "arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") <= key (" + std::to_string(key) + "). Insertion position found at index " + std::to_string(j + 1) + ".";
            ev.sourceLine = 8;
            ev.arrayState = arr;
            ev.activeIndices = {j, j + 1};
            tempH = highlights;
            tempH[j] = "compare";
            tempH[j + 1] = "active";
            ev.highlightedItems = tempH;
            ev.pointers.push_back({"j", j, "indigo"});
            ev.passNumber = i;
            ev.comparisons = comparisons;
            ev.writes = writes;
            ev.statusText = shiftNeeded ? "Shift needed" : "Insertion slot located";
            emitter.emit(ev);

            if (!shiftNeeded) {
                break;
            }

            // Shift right
            arr[j + 1] = arr[j];
            writes++;

            ev = TraceEvent();
            ev.eventType = "shift";
            ev.title = "Shift arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") -> arr[" + std::to_string(j + 1) + "]";
            ev.description = "Shifted value " + std::to_string(arr[j]) + " one slot to the right into index " + std::to_string(j + 1) + ".";
            ev.sourceLine = 9;
            ev.arrayState = arr;
            ev.activeIndices = {j + 1};
            tempH = highlights;
            tempH[j + 1] = "shifting";
            ev.highlightedItems = tempH;
            ev.pointers.push_back({"shifted", j + 1, "purple"});
            ev.passNumber = i;
            ev.comparisons = comparisons;
            ev.writes = writes;
            ev.statusText = "Shifted right";
            emitter.emit(ev);

            j = j - 1;
        }

        // Insert key
        arr[j + 1] = key;
        writes++;

        ev = TraceEvent();
        ev.eventType = "write";
        ev.title = "Insert key (" + std::to_string(key) + ") at Index " + std::to_string(j + 1);
        ev.description = "Key " + std::to_string(key) + " placed into its sorted position at index " + std::to_string(j + 1) + ".";
        ev.sourceLine = 12;
        ev.arrayState = arr;
        ev.activeIndices = {j + 1};
        for (int k = 0; k <= i; ++k) highlights[k] = "sorted";
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"inserted", j + 1, "emerald"});
        ev.passNumber = i;
        ev.comparisons = comparisons;
        ev.writes = writes;
        ev.statusText = "Inserted key at index " + std::to_string(j + 1);
        emitter.emit(ev);
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Insertion Sort Complete";
    ev.description = "All elements inserted. Array is fully sorted.";
    ev.sourceLine = 14;
    ev.arrayState = arr;
    ev.highlightedItems = highlights;
    ev.comparisons = comparisons;
    ev.writes = writes;
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.variables["totalWrites"] = std::to_string(writes);
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 6. Merge Sort
// -------------------------------------------------------------
static void internalMerge(std::vector<int>& arr, int left, int mid, int right, int depth, int& comparisons, int& writes, TraceEmitter& emitter) {
    TraceEvent ev;
    ev.eventType = "merge_start";
    ev.title = "Merge Subarrays: [" + std::to_string(left) + ".." + std::to_string(mid) + "] and [" + std::to_string(mid + 1) + ".." + std::to_string(right) + "]";
    ev.description = "Merging left segment and right segment into sorted combined segment [" + std::to_string(left) + ".." + std::to_string(right) + "].";
    ev.sourceLine = 3;
    ev.arrayState = arr;
    ev.rangeLow = left;
    ev.rangeHigh = right;
    ev.recursionDepth = depth;
    std::map<int, std::string> highlights;
    for (int k = left; k <= right; ++k) highlights[k] = "active";
    ev.highlightedItems = highlights;
    ev.pointers.push_back({"left", left, "indigo"});
    ev.pointers.push_back({"mid", mid, "amber"});
    ev.pointers.push_back({"right", right, "purple"});
    ev.comparisons = comparisons;
    ev.writes = writes;
    ev.statusText = "Merging segments";
    emitter.emit(ev);

    std::vector<int> temp(right - left + 1);
    int i = left;
    int j = mid + 1;
    int k = 0;

    while (i <= mid && j <= right) {
        comparisons++;
        bool takeLeft = (arr[i] <= arr[j]);

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: arr[" + std::to_string(i) + "] (" + std::to_string(arr[i]) + ") <= arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ")";
        ev.description = takeLeft
            ? "Left item " + std::to_string(arr[i]) + " <= " + std::to_string(arr[j]) + " (preserves stability). Selecting from left half."
            : "Right item " + std::to_string(arr[j]) + " < " + std::to_string(arr[i]) + ". Selecting from right half.";
        ev.sourceLine = 7;
        ev.arrayState = arr;
        ev.rangeLow = left;
        ev.rangeHigh = right;
        ev.recursionDepth = depth;
        ev.activeIndices = {i, j};
        auto tempH = highlights;
        tempH[i] = "compare";
        tempH[j] = "compare";
        ev.highlightedItems = tempH;
        ev.pointers.push_back({"i", i, "indigo"});
        ev.pointers.push_back({"j", j, "purple"});
        ev.comparisons = comparisons;
        ev.writes = writes;
        ev.statusText = "Comparing halves";
        emitter.emit(ev);

        if (takeLeft) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }

    while (i <= mid) {
        temp[k++] = arr[i++];
    }
    while (j <= right) {
        temp[k++] = arr[j++];
    }

    // Write back
    for (int p = 0; p < k; ++p) {
        arr[left + p] = temp[p];
        writes++;

        ev = TraceEvent();
        ev.eventType = "write";
        ev.title = "Write Back: arr[" + std::to_string(left + p) + "] = " + std::to_string(temp[p]);
        ev.description = "Copied merged value " + std::to_string(temp[p]) + " back into original array at offset " + std::to_string(left + p) + ".";
        ev.sourceLine = 16;
        ev.arrayState = arr;
        ev.rangeLow = left;
        ev.rangeHigh = right;
        ev.recursionDepth = depth;
        ev.activeIndices = {left + p};
        highlights[left + p] = "sorted";
        ev.highlightedItems = highlights;
        ev.pointers.push_back({"write", left + p, "emerald"});
        ev.comparisons = comparisons;
        ev.writes = writes;
        ev.statusText = "Writing back merged segment";
        emitter.emit(ev);
    }

    ev = TraceEvent();
    ev.eventType = "merge_complete";
    ev.title = "Merged Segment [" + std::to_string(left) + ".." + std::to_string(right) + "] Complete";
    ev.description = "Segment [" + std::to_string(left) + ".." + std::to_string(right) + "] is now internally sorted.";
    ev.sourceLine = 18;
    ev.arrayState = arr;
    ev.rangeLow = left;
    ev.rangeHigh = right;
    ev.recursionDepth = depth;
    ev.highlightedItems = highlights;
    ev.comparisons = comparisons;
    ev.writes = writes;
    ev.statusText = "Segment merged";
    emitter.emit(ev);
}

static void internalMergeSort(std::vector<int>& arr, int left, int right, int depth, int& comparisons, int& writes, TraceEmitter& emitter) {
    if (left < right) {
        int mid = left + (right - left) / 2;

        TraceEvent ev;
        ev.eventType = "recursive_call";
        ev.title = "Divide: Subarray [" + std::to_string(left) + ".." + std::to_string(right) + "] at mid = " + std::to_string(mid);
        ev.description = "Dividing into left [" + std::to_string(left) + ".." + std::to_string(mid) + "] and right [" + std::to_string(mid + 1) + ".." + std::to_string(right) + "] (depth = " + std::to_string(depth) + ").";
        ev.sourceLine = 22;
        ev.arrayState = arr;
        ev.rangeLow = left;
        ev.rangeHigh = right;
        ev.recursionDepth = depth;
        std::map<int, std::string> h;
        for (int k = left; k <= right; ++k) h[k] = "active";
        ev.highlightedItems = h;
        ev.pointers.push_back({"left", left, "indigo"});
        ev.pointers.push_back({"mid", mid, "amber"});
        ev.pointers.push_back({"right", right, "purple"});
        ev.comparisons = comparisons;
        ev.writes = writes;
        ev.statusText = "Dividing range";
        emitter.emit(ev);

        internalMergeSort(arr, left, mid, depth + 1, comparisons, writes, emitter);
        internalMergeSort(arr, mid + 1, right, depth + 1, comparisons, writes, emitter);
        internalMerge(arr, left, mid, right, depth, comparisons, writes, emitter);
    }
}

void traceMergeSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int writes = 0;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "mergeSort(arr, 0, " + std::to_string(n - 1) + ") Initialized";
    ev.description = "Beginning divide-and-conquer merge sort on " + std::to_string(n) + " elements.";
    ev.sourceLine = 20;
    ev.arrayState = arr;
    ev.rangeLow = 0;
    ev.rangeHigh = n - 1;
    ev.variables["n"] = std::to_string(n);
    ev.statusText = "Initialized";
    emitter.emit(ev);

    if (n > 1) {
        internalMergeSort(arr, 0, n - 1, 1, comparisons, writes, emitter);
    }

    std::map<int, std::string> h;
    for (int k = 0; k < n; ++k) h[k] = "sorted";

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Merge Sort Complete";
    ev.description = "All recursive divisions merged. Array is fully sorted.";
    ev.sourceLine = 27;
    ev.arrayState = arr;
    ev.highlightedItems = h;
    ev.rangeLow = 0;
    ev.rangeHigh = n - 1;
    ev.comparisons = comparisons;
    ev.writes = writes;
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.variables["totalWrites"] = std::to_string(writes);
    ev.statusText = "Fully sorted";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 7. Quick Sort
// -------------------------------------------------------------
static int internalPartition(std::vector<int>& arr, int low, int high, int depth, int& comparisons, int& swaps, int& writes, TraceEmitter& emitter) {
    int pivot = arr[high];
    int i = low - 1;

    TraceEvent ev;
    ev.eventType = "partition_start";
    ev.title = "Partition Range [" + std::to_string(low) + ".." + std::to_string(high) + "] with Pivot = arr[" + std::to_string(high) + "] (" + std::to_string(pivot) + ")";
    ev.description = "Lomuto partition scheme: Pivot is last element " + std::to_string(pivot) + ". Initializing i = low - 1 (" + std::to_string(i) + ").";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    ev.rangeLow = low;
    ev.rangeHigh = high;
    ev.pivotIndex = high;
    ev.recursionDepth = depth;
    std::map<int, std::string> h;
    for (int k = low; k <= high; ++k) h[k] = "active";
    h[high] = "target"; // pivot highlight
    ev.highlightedItems = h;
    ev.pointers.push_back({"pivot", high, "amber"});
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.writes = writes;
    ev.statusText = "Partition started";
    emitter.emit(ev);

    for (int j = low; j < high; ++j) {
        comparisons++;
        bool isSmallerOrEqual = (arr[j] <= pivot);

        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") <= pivot (" + std::to_string(pivot) + ")";
        ev.description = isSmallerOrEqual
            ? "arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") <= pivot (" + std::to_string(pivot) + "). Increment i and swap arr[i] with arr[j]."
            : "arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") > pivot (" + std::to_string(pivot) + "). Leave element in place.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.rangeLow = low;
        ev.rangeHigh = high;
        ev.pivotIndex = high;
        ev.recursionDepth = depth;
        ev.activeIndices = {j, high};
        auto tempH = h;
        tempH[j] = "compare";
        tempH[high] = "target";
        ev.highlightedItems = tempH;
        ev.pointers.push_back({"j", j, "indigo"});
        if (i >= low) ev.pointers.push_back({"i", i, "purple"});
        ev.pointers.push_back({"pivot", high, "amber"});
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = isSmallerOrEqual ? "Element <= pivot" : "Element > pivot";
        emitter.emit(ev);

        if (isSmallerOrEqual) {
            ++i;
            if (i != j) {
                std::swap(arr[i], arr[j]);
                swaps++;
                writes += 2;

                ev = TraceEvent();
                ev.eventType = "swap";
                ev.title = "Swap arr[" + std::to_string(i) + "] with arr[" + std::to_string(j) + "]";
                ev.description = "Swapped arr[" + std::to_string(i) + "] (" + std::to_string(arr[i]) + ") and arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ").";
                ev.sourceLine = 10;
                ev.arrayState = arr;
                ev.rangeLow = low;
                ev.rangeHigh = high;
                ev.pivotIndex = high;
                ev.recursionDepth = depth;
                ev.activeIndices = {i, j};
                tempH = h;
                tempH[i] = "swap";
                tempH[j] = "swap";
                tempH[high] = "target";
                ev.highlightedItems = tempH;
                ev.pointers.push_back({"i", i, "emerald"});
                ev.pointers.push_back({"j", j, "indigo"});
                ev.pointers.push_back({"pivot", high, "amber"});
                ev.comparisons = comparisons;
                ev.swaps = swaps;
                ev.writes = writes;
                ev.statusText = "Swapped into left partition";
                emitter.emit(ev);
            }
        }
    }

    // Place pivot at i + 1
    std::swap(arr[i + 1], arr[high]);
    swaps++;
    writes += 2;
    int pi = i + 1;

    ev = TraceEvent();
    ev.eventType = "partition_complete";
    ev.title = "Place Pivot at Partition Index " + std::to_string(pi);
    ev.description = "Swapped pivot " + std::to_string(arr[pi]) + " into final position index " + std::to_string(pi) + 
                     ". All elements in [" + std::to_string(low) + ".." + std::to_string(pi - 1) + "] are <= pivot, and [" + 
                     std::to_string(pi + 1) + ".." + std::to_string(high) + "] are > pivot.";
    ev.sourceLine = 13;
    ev.arrayState = arr;
    ev.rangeLow = low;
    ev.rangeHigh = high;
    ev.pivotIndex = pi;
    ev.recursionDepth = depth;
    ev.activeIndices = {pi};
    h[pi] = "sorted";
    ev.highlightedItems = h;
    ev.pointers.push_back({"pivotFinal", pi, "emerald"});
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.writes = writes;
    ev.statusText = "Pivot in final position";
    emitter.emit(ev);

    return pi;
}

static void internalQuickSort(std::vector<int>& arr, int low, int high, int depth, int& comparisons, int& swaps, int& writes, TraceEmitter& emitter) {
    if (low < high) {
        int pi = internalPartition(arr, low, high, depth, comparisons, swaps, writes, emitter);
        internalQuickSort(arr, low, pi - 1, depth + 1, comparisons, swaps, writes, emitter);
        internalQuickSort(arr, pi + 1, high, depth + 1, comparisons, swaps, writes, emitter);
    } else if (low == high) {
        // Single element is trivially sorted
        TraceEvent ev;
        ev.eventType = "index_advance";
        ev.title = "Single Element Range [" + std::to_string(low) + "] Trivially Sorted";
        ev.description = "Subarray of size 1 at index " + std::to_string(low) + " is already in sorted position.";
        ev.sourceLine = 18;
        ev.arrayState = arr;
        ev.rangeLow = low;
        ev.rangeHigh = high;
        ev.recursionDepth = depth;
        std::map<int, std::string> h;
        h[low] = "sorted";
        ev.highlightedItems = h;
        ev.pointers.push_back({"sorted", low, "emerald"});
        ev.comparisons = comparisons;
        ev.swaps = swaps;
        ev.writes = writes;
        ev.statusText = "Single element sorted";
        emitter.emit(ev);
    }
}

void traceQuickSortAlgorithm(std::vector<int> arr, TraceEmitter& emitter) {
    int n = static_cast<int>(arr.size());
    int comparisons = 0;
    int swaps = 0;
    int writes = 0;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "quickSort(arr, 0, " + std::to_string(n - 1) + ") Initialized";
    ev.description = "Beginning Lomuto partition quicksort on " + std::to_string(n) + " elements.";
    ev.sourceLine = 17;
    ev.arrayState = arr;
    ev.rangeLow = 0;
    ev.rangeHigh = n - 1;
    ev.variables["n"] = std::to_string(n);
    ev.statusText = "Initialized";
    emitter.emit(ev);

    if (n > 1) {
        internalQuickSort(arr, 0, n - 1, 1, comparisons, swaps, writes, emitter);
    }

    std::map<int, std::string> h;
    for (int k = 0; k < n; ++k) h[k] = "sorted";

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Quick Sort Complete";
    ev.description = "All partitions resolved. Array is fully sorted.";
    ev.sourceLine = 23;
    ev.arrayState = arr;
    ev.highlightedItems = h;
    ev.rangeLow = 0;
    ev.rangeHigh = n - 1;
    ev.comparisons = comparisons;
    ev.swaps = swaps;
    ev.writes = writes;
    ev.variables["totalComparisons"] = std::to_string(comparisons);
    ev.variables["totalSwaps"] = std::to_string(swaps);
    ev.variables["totalWrites"] = std::to_string(writes);
    ev.statusText = "Fully sorted";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// Canonical C++ Source Code Display
// -------------------------------------------------------------
std::string getSearchingSortingSourceCode(const std::string& op) {
    if (op == "linear-search") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "\n"
            "int linearSearch(const std::vector<int>& arr, int target) {\n"
            "    for (int i = 0; i < static_cast<int>(arr.size()); ++i) {\n"
            "        if (arr[i] == target) {\n"
            "            return i;\n"
            "        }\n"
            "    }\n"
            "    return -1;\n"
            "}";
    }
    if (op == "binary-search") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "\n"
            "int binarySearch(const std::vector<int>& arr, int target) {\n"
            "    int low = 0;\n"
            "    int high = static_cast<int>(arr.size()) - 1;\n"
            "\n"
            "    while (low <= high) {\n"
            "        int mid = low + (high - low) / 2;\n"
            "\n"
            "        if (arr[mid] == target) {\n"
            "            return mid;\n"
            "        }\n"
            "\n"
            "        if (arr[mid] < target) {\n"
            "            low = mid + 1;\n"
            "        } else {\n"
            "            high = mid - 1;\n"
            "        }\n"
            "    }\n"
            "\n"
            "    return -1;\n"
            "}";
    }
    if (op == "bubble-sort") {
        return
            "#include <vector>\n"
            "#include <utility>\n"
            "\n"
            "void bubbleSort(std::vector<int>& arr) {\n"
            "    int n = static_cast<int>(arr.size());\n"
            "    for (int i = 0; i < n - 1; ++i) {\n"
            "        bool swapped = false;\n"
            "        for (int j = 0; j < n - i - 1; ++j) {\n"
            "            if (arr[j] > arr[j + 1]) {\n"
            "                std::swap(arr[j], arr[j + 1]);\n"
            "                swapped = true;\n"
            "            }\n"
            "        }\n"
            "        if (!swapped) {\n"
            "            break;\n"
            "        }\n"
            "    }\n"
            "}";
    }
    if (op == "selection-sort") {
        return
            "#include <vector>\n"
            "#include <utility>\n"
            "\n"
            "void selectionSort(std::vector<int>& arr) {\n"
            "    int n = static_cast<int>(arr.size());\n"
            "    for (int i = 0; i < n - 1; ++i) {\n"
            "        int minIdx = i;\n"
            "        for (int j = i + 1; j < n; ++j) {\n"
            "            if (arr[j] < arr[minIdx]) {\n"
            "                minIdx = j;\n"
            "            }\n"
            "        }\n"
            "        if (minIdx != i) {\n"
            "            std::swap(arr[i], arr[minIdx]);\n"
            "        }\n"
            "    }\n"
            "}";
    }
    if (op == "insertion-sort") {
        return
            "#include <vector>\n"
            "\n"
            "void insertionSort(std::vector<int>& arr) {\n"
            "    int n = static_cast<int>(arr.size());\n"
            "    for (int i = 1; i < n; ++i) {\n"
            "        int key = arr[i];\n"
            "        int j = i - 1;\n"
            "        while (j >= 0 && arr[j] > key) {\n"
            "            arr[j + 1] = arr[j];\n"
            "            j = j - 1;\n"
            "        }\n"
            "        arr[j + 1] = key;\n"
            "    }\n"
            "}";
    }
    if (op == "merge-sort") {
        return
            "#include <vector>\n"
            "\n"
            "void merge(std::vector<int>& arr, int left, int mid, int right) {\n"
            "    std::vector<int> temp(right - left + 1);\n"
            "    int i = left, j = mid + 1, k = 0;\n"
            "    while (i <= mid && j <= right) {\n"
            "        if (arr[i] <= arr[j]) {\n"
            "            temp[k++] = arr[i++];\n"
            "        } else {\n"
            "            temp[k++] = arr[j++];\n"
            "        }\n"
            "    }\n"
            "    while (i <= mid) temp[k++] = arr[i++];\n"
            "    while (j <= right) temp[k++] = arr[j++];\n"
            "    for (int p = 0; p < k; ++p) {\n"
            "        arr[left + p] = temp[p];\n"
            "    }\n"
            "}\n"
            "\n"
            "void mergeSort(std::vector<int>& arr, int left, int right) {\n"
            "    if (left < right) {\n"
            "        int mid = left + (right - left) / 2;\n"
            "        mergeSort(arr, left, mid);\n"
            "        mergeSort(arr, mid + 1, right);\n"
            "        merge(arr, left, mid, right);\n"
            "    }\n"
            "}";
    }
    if (op == "quick-sort") {
        return
            "#include <vector>\n"
            "#include <utility>\n"
            "\n"
            "int partition(std::vector<int>& arr, int low, int high) {\n"
            "    int pivot = arr[high];\n"
            "    int i = low - 1;\n"
            "    for (int j = low; j < high; ++j) {\n"
            "        if (arr[j] <= pivot) {\n"
            "            ++i;\n"
            "            std::swap(arr[i], arr[j]);\n"
            "        }\n"
            "    }\n"
            "    std::swap(arr[i + 1], arr[high]);\n"
            "    return i + 1;\n"
            "}\n"
            "\n"
            "void quickSort(std::vector<int>& arr, int low, int high) {\n"
            "    if (low < high) {\n"
            "        int pi = partition(arr, low, high);\n"
            "        quickSort(arr, low, pi - 1);\n"
            "        quickSort(arr, pi + 1, high);\n"
            "    }\n"
            "}";
    }
    return "// C++ source code not available";
}
