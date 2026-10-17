#include "../include/algorithms.hpp"
#include <iostream>
#include <sstream>

bool isSorted(const std::vector<int>& arr) {
    for (size_t i = 1; i < arr.size(); ++i) {
        if (arr[i] < arr[i - 1]) {
            return false;
        }
    }
    return true;
}

// 1. Array Basics
void traceArrayBasics(const std::vector<int>& arr, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    if (n == 0) {
        ev.eventType = "init";
        ev.title = "Empty Array Initialized";
        ev.description = "std::vector<int> arr is empty (size = 0). No index offsets exist in memory.";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        ev.variables["arr.size()"] = "0";
        ev.variables["n"] = "0";
        ev.statusText = "Empty vector";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    // Line 6: Vector allocation
    ev.eventType = "init";
    ev.title = "std::vector<int> Allocated in Contiguous Memory";
    ev.description = "vector<int> allocated with " + std::to_string(n) + " contiguous integer elements.";
    ev.sourceLine = 6;
    ev.arrayState = arr;
    for (int i = 0; i < n; ++i) {
        ev.activeIndices.push_back(i);
        ev.highlightedItems[i] = "active";
    }
    ev.variables["arr.size()"] = std::to_string(n);
    ev.variables["n"] = std::to_string(n);
    ev.statusText = "Allocated";
    emitter.emit(ev);

    // Iterating elements
    for (int i = 0; i < n; ++i) {
        // Line 7: Loop condition
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "Loop Condition: i < static_cast<int>(arr.size())";
        ev.description = "Evaluating i (" + std::to_string(i) + ") < " + std::to_string(n) + ": Condition is true.";
        ev.sourceLine = 7;
        ev.arrayState = arr;
        ev.activeIndices = {i};
        ev.highlightedItems[i] = "active";
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["arr.size()"] = std::to_string(n);
        ev.variables["arr[i]"] = std::to_string(arr[i]);
        ev.statusText = "Loop check";
        emitter.emit(ev);

        // Line 8: Access & print element
        ev = TraceEvent();
        ev.eventType = "access";
        ev.title = "Output arr[" + std::to_string(i) + "] = " + std::to_string(arr[i]);
        ev.description = "Reading memory offset " + std::to_string(i) + ". Index identifies position; " + std::to_string(arr[i]) + " is stored value.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.activeIndices = {i};
        ev.highlightedItems[i] = "found";
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["Index"] = std::to_string(i);
        ev.variables["Value"] = std::to_string(arr[i]);
        ev.statusText = "Printing element";
        emitter.emit(ev);
    }

    // Line 10: Complete
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Loop Terminated & Program Returned 0";
    ev.description = "All " + std::to_string(n) + " elements visited. Indices span [0, " + std::to_string(n - 1) + "]. Return 0.";
    ev.sourceLine = 10;
    ev.arrayState = arr;
    for (int i = 0; i < n; ++i) {
        ev.highlightedItems[i] = "visited";
    }
    ev.variables["i"] = std::to_string(n);
    ev.variables["status"] = "Success (Exit code 0)";
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 2. Array Traversal
void traceArrayTraversal(const std::vector<int>& arr, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    if (n == 0) {
        ev.eventType = "init";
        ev.title = "Empty Vector Traversal";
        ev.description = "Loop condition i < static_cast<int>(arr.size()) is false immediately (0 < 0 is false). Loop terminates.";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        ev.variables["i"] = "0";
        ev.variables["arr.size()"] = "0";
        ev.statusText = "Empty vector";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    // Line 6: Init loop
    ev.eventType = "init";
    ev.title = "Initialize Loop Counter: i = 0";
    ev.description = "Initialized loop variable int i = 0. Range: [0, " + std::to_string(n - 1) + "].";
    ev.sourceLine = 6;
    ev.arrayState = arr;
    ev.activeIndices = {0};
    ev.highlightedItems[0] = "active";
    ev.pointers.push_back({"i", 0, "indigo"});
    ev.variables["i"] = "0";
    ev.variables["n"] = std::to_string(n);
    ev.statusText = "Loop start";
    emitter.emit(ev);

    std::map<int, std::string> visitedMap;

    for (int i = 0; i < n; ++i) {
        // Line 6: Condition
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "Evaluate Condition: i < " + std::to_string(n);
        ev.description = "Evaluating i (" + std::to_string(i) + ") < " + std::to_string(n) + ": True. Advancing to loop body.";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        visitedMap[i] = "active";
        ev.highlightedItems = visitedMap;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["n"] = std::to_string(n);
        ev.statusText = "Checking condition";
        emitter.emit(ev);

        // Line 7: Read value
        int value = arr[i];
        ev = TraceEvent();
        ev.eventType = "access";
        ev.title = "Read Element: int value = arr[" + std::to_string(i) + "] (" + std::to_string(value) + ")";
        ev.description = "Accessing arr[" + std::to_string(i) + "] via pointer offset: value = " + std::to_string(value) + ".";
        ev.sourceLine = 7;
        ev.arrayState = arr;
        visitedMap[i] = "active";
        ev.highlightedItems = visitedMap;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["value"] = std::to_string(value);
        ev.variables["n"] = std::to_string(n);
        ev.statusText = "Reading element";
        emitter.emit(ev);

        // Line 8: Process value
        ev = TraceEvent();
        ev.eventType = "process";
        ev.title = "Processed Index " + std::to_string(i) + " (Value: " + std::to_string(value) + ")";
        ev.description = "Completed inspection of element at index " + std::to_string(i) + ". Next: increment i++.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        visitedMap[i] = "visited";
        ev.highlightedItems = visitedMap;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["value"] = std::to_string(value);
        ev.variables["status"] = "Visited";
        ev.statusText = "Processed";
        emitter.emit(ev);
    }

    // Line 10: Complete
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Traversal Finished (i == " + std::to_string(n) + ")";
    ev.description = "Loop counter reached i = " + std::to_string(n) + ". Condition i < " + std::to_string(n) + " is false. Function returns.";
    ev.sourceLine = 10;
    ev.arrayState = arr;
    ev.highlightedItems = visitedMap;
    ev.variables["i"] = std::to_string(n);
    ev.variables["totalVisited"] = std::to_string(n);
    ev.variables["timeComplexity"] = "O(n)";
    ev.statusText = "Traversal complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 3. Access by Index
void traceAccessByIndex(const std::vector<int>& arr, int index, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    // Line 6: Bounds check
    bool isValid = (index >= 0 && index < n);
    ev.eventType = "condition";
    ev.title = "Evaluate Bounds: index >= 0 && index < " + std::to_string(n);
    ev.description = "Verifying index bounds: 0 <= " + std::to_string(index) + " < " + std::to_string(n) + 
                     (isValid ? " -> Valid index." : " -> OUT OF BOUNDS!");
    ev.sourceLine = 6;
    ev.arrayState = arr;
    if (isValid) {
        ev.activeIndices = {index};
        ev.highlightedItems[index] = "active";
        ev.pointers.push_back({"index", index, "indigo"});
    }
    ev.variables["index"] = std::to_string(index);
    ev.variables["arr.size()"] = std::to_string(n);
    ev.variables["isValid"] = isValid ? "true" : "false";
    ev.statusText = isValid ? "Valid bounds" : "Out of bounds";
    emitter.emit(ev);

    if (!isValid) {
        ev = TraceEvent();
        ev.eventType = "error";
        ev.title = "Return -1 (Out of Bounds Error)";
        ev.description = "Index " + std::to_string(index) + " is outside the valid range [0, " + 
                         std::to_string(std::max(0, n - 1)) + "]. Returning -1.";
        ev.sourceLine = 10;
        ev.arrayState = arr;
        ev.variables["index"] = std::to_string(index);
        ev.variables["result"] = "-1";
        ev.variables["error"] = "IndexOutOfBounds";
        ev.statusText = "Error";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    // Line 7: Direct read
    int value = arr[index];
    ev = TraceEvent();
    ev.eventType = "access";
    ev.title = "int value = arr[" + std::to_string(index) + "] (" + std::to_string(value) + ")";
    ev.description = "Calculated memory address offset directly in O(1) time. Retrieved value: " + std::to_string(value) + ".";
    ev.sourceLine = 7;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "found";
    ev.pointers.push_back({"index", index, "indigo"});
    ev.variables["index"] = std::to_string(index);
    ev.variables["value"] = std::to_string(value);
    ev.variables["timeComplexity"] = "O(1)";
    ev.statusText = "Retrieved";
    emitter.emit(ev);

    // Line 8: Return value
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Return value (" + std::to_string(value) + ")";
    ev.description = "Function returns " + std::to_string(value) + ". Constant time access O(1) completed.";
    ev.sourceLine = 8;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "found";
    ev.pointers.push_back({"result", index, "indigo"});
    ev.variables["index"] = std::to_string(index);
    ev.variables["return"] = std::to_string(value);
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 4. Update an Element
void traceUpdateElement(std::vector<int> arr, int index, int newValue, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    // Line 6: Bounds check
    bool isValid = (index >= 0 && index < n);
    ev.eventType = "condition";
    ev.title = "Evaluate Bounds: index >= 0 && index < " + std::to_string(n);
    ev.description = "Checking bounds for index " + std::to_string(index) + " before in-place write: " +
                     (isValid ? "Valid." : "Invalid!");
    ev.sourceLine = 6;
    ev.arrayState = arr;
    if (isValid) {
        ev.activeIndices = {index};
        ev.highlightedItems[index] = "target";
        ev.pointers.push_back({"index", index, "indigo"});
    }
    ev.variables["index"] = std::to_string(index);
    ev.variables["newValue"] = std::to_string(newValue);
    ev.variables["arr.size()"] = std::to_string(n);
    ev.statusText = isValid ? "Bounds valid" : "Bounds invalid";
    emitter.emit(ev);

    if (!isValid) {
        ev = TraceEvent();
        ev.eventType = "error";
        ev.title = "Return false (Update Failed: Out of Bounds)";
        ev.description = "Cannot update index " + std::to_string(index) + ". Vector size is " + std::to_string(n) + ".";
        ev.sourceLine = 10;
        ev.arrayState = arr;
        ev.variables["index"] = std::to_string(index);
        ev.variables["result"] = "false";
        ev.variables["error"] = "IndexOutOfBounds";
        ev.statusText = "Error";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    int oldValue = arr[index];

    // Line 7: Overwrite
    arr[index] = newValue;
    ev = TraceEvent();
    ev.eventType = "update";
    ev.title = "arr[" + std::to_string(index) + "] = " + std::to_string(newValue);
    ev.description = "Updated element at index " + std::to_string(index) + " from original value " + 
                     std::to_string(oldValue) + " to new value " + std::to_string(newValue) + " in-place.";
    ev.sourceLine = 7;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "updated";
    ev.pointers.push_back({"index", index, "indigo"});
    ev.variables["index"] = std::to_string(index);
    ev.variables["oldValue"] = std::to_string(oldValue);
    ev.variables["newValue"] = std::to_string(newValue);
    ev.statusText = "Element updated";
    emitter.emit(ev);

    // Line 8: Return true
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Return true (Update Succeeded)";
    ev.description = "In-place modification finished in O(1) time and O(1) auxiliary space.";
    ev.sourceLine = 8;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "found";
    ev.variables["result"] = "true";
    ev.variables["updatedIndex"] = std::to_string(index);
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 5. Insert an Element
void traceInsertElement(std::vector<int> arr, int index, int value, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    if (index < 0 || index > n) {
        ev.eventType = "error";
        ev.title = "Invalid Insertion Index";
        ev.description = "Cannot insert at index " + std::to_string(index) + ". Valid index range: [0, " + std::to_string(n) + "].";
        ev.sourceLine = 5;
        ev.arrayState = arr;
        ev.variables["index"] = std::to_string(index);
        ev.variables["validRange"] = "0.." + std::to_string(n);
        ev.variables["error"] = "IndexOutOfBounds";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    // Line 5: Function entry
    ev.eventType = "init";
    ev.title = "Initiate Insert: insertAt(arr, " + std::to_string(index) + ", " + std::to_string(value) + ")";
    ev.description = "Preparing insertion of value " + std::to_string(value) + " at index " + std::to_string(index) + ". Current size: " + std::to_string(n) + ".";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    if (index < n) {
        ev.activeIndices = {index};
        ev.highlightedItems[index] = "insert";
        ev.pointers.push_back({"insertAt", index, "teal"});
    }
    ev.variables["index"] = std::to_string(index);
    ev.variables["value"] = std::to_string(value);
    ev.variables["n"] = std::to_string(n);
    emitter.emit(ev);

    // Line 7: arr.push_back(0) - Expand vector
    arr.push_back(0);
    ev = TraceEvent();
    ev.eventType = "allocate";
    ev.title = "arr.push_back(0): Expand Vector Size";
    ev.description = "Allocating slot at end. Vector size expands from " + std::to_string(n) + " to " + std::to_string(arr.size()) + ".";
    ev.sourceLine = 7;
    ev.arrayState = arr;
    ev.activeIndices = {static_cast<int>(arr.size()) - 1};
    ev.highlightedItems[static_cast<int>(arr.size()) - 1] = "insert";
    ev.variables["newSize"] = std::to_string(arr.size());
    emitter.emit(ev);

    // Line 8-10: Shift elements right from n - 1 down to index
    if (index < n) {
        for (int j = n - 1; j >= index; --j) {
            // Line 8: loop condition
            ev = TraceEvent();
            ev.eventType = "shift";
            ev.title = "Shift Loop: j = " + std::to_string(j) + " >= " + std::to_string(index);
            ev.description = "Shifting element arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ") right to arr[" + std::to_string(j + 1) + "].";
            ev.sourceLine = 8;
            ev.arrayState = arr;
            ev.activeIndices = {j, j + 1};
            ev.highlightedItems[j] = "shifting";
            ev.highlightedItems[j + 1] = "shifting";
            ev.pointers.push_back({"j", j, "indigo"});
            ev.variables["j"] = std::to_string(j);
            ev.variables["shiftingValue"] = std::to_string(arr[j]);
            emitter.emit(ev);

            // Line 9: assignment
            arr[j + 1] = arr[j];
            ev = TraceEvent();
            ev.eventType = "shift";
            ev.title = "arr[" + std::to_string(j + 1) + "] = arr[" + std::to_string(j) + "] (" + std::to_string(arr[j]) + ")";
            ev.description = "Element shifted right into position " + std::to_string(j + 1) + ".";
            ev.sourceLine = 9;
            ev.arrayState = arr;
            ev.activeIndices = {j + 1};
            ev.highlightedItems[j + 1] = "shifting";
            ev.pointers.push_back({"shifted", j + 1, "indigo"});
            ev.variables["j"] = std::to_string(j);
            emitter.emit(ev);
        }
    }

    // Line 11: arr[index] = value
    arr[index] = value;
    ev = TraceEvent();
    ev.eventType = "insert";
    ev.title = "arr[" + std::to_string(index) + "] = " + std::to_string(value) + " (Place Value)";
    ev.description = "Placed inserted value " + std::to_string(value) + " into opened slot at index " + std::to_string(index) + ".";
    ev.sourceLine = 11;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "found";
    ev.pointers.push_back({"newVal", index, "teal"});
    ev.variables["index"] = std::to_string(index);
    ev.variables["value"] = std::to_string(value);
    ev.variables["finalSize"] = std::to_string(arr.size());
    ev.statusText = "Inserted";
    emitter.emit(ev);

    // Line 12: Complete
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Insertion Complete";
    ev.description = "Element " + std::to_string(value) + " successfully inserted. Total shifts: " + 
                     std::to_string(std::max(0, n - index)) + ". Worst-case time: O(n).";
    ev.sourceLine = 12;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "found";
    ev.variables["totalShifts"] = std::to_string(std::max(0, n - index));
    ev.variables["timeComplexity"] = "O(n)";
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 6. Delete an Element
void traceDeleteElement(std::vector<int> arr, int index, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    if (n == 0 || index < 0 || index >= n) {
        ev.eventType = "error";
        ev.title = "Invalid Deletion Index";
        ev.description = "Cannot delete index " + std::to_string(index) + ". Vector size is " + std::to_string(n) + ".";
        ev.sourceLine = 5;
        ev.arrayState = arr;
        ev.variables["index"] = std::to_string(index);
        ev.variables["error"] = "IndexOutOfBounds";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    int targetValue = arr[index];

    // Line 5: Function entry
    ev.eventType = "init";
    ev.title = "Initiate Deletion at Index " + std::to_string(index) + " (Value: " + std::to_string(targetValue) + ")";
    ev.description = "Preparing removal of element at index " + std::to_string(index) + ". Current size: " + std::to_string(n) + ".";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "delete";
    ev.pointers.push_back({"delete", index, "rose"});
    ev.variables["index"] = std::to_string(index);
    ev.variables["targetValue"] = std::to_string(targetValue);
    ev.variables["n"] = std::to_string(n);
    emitter.emit(ev);

    // Line 7: int n = arr.size()
    ev = TraceEvent();
    ev.eventType = "statement";
    ev.title = "int n = static_cast<int>(arr.size()) (" + std::to_string(n) + ")";
    ev.description = "Evaluating array bounds before shifting elements left.";
    ev.sourceLine = 7;
    ev.arrayState = arr;
    ev.activeIndices = {index};
    ev.highlightedItems[index] = "delete";
    ev.variables["n"] = std::to_string(n);
    emitter.emit(ev);

    // Line 8-10: Shift left
    for (int j = index; j < n - 1; ++j) {
        // Line 8: loop condition
        ev = TraceEvent();
        ev.eventType = "shift";
        ev.title = "Shift Loop: j = " + std::to_string(j) + " < " + std::to_string(n - 1);
        ev.description = "Copying arr[" + std::to_string(j + 1) + "] (" + std::to_string(arr[j + 1]) + ") left into arr[" + std::to_string(j) + "].";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.activeIndices = {j, j + 1};
        ev.highlightedItems[j] = "shifting";
        ev.highlightedItems[j + 1] = "shifting";
        ev.pointers.push_back({"j", j, "indigo"});
        ev.pointers.push_back({"←", j + 1, "indigo"});
        ev.variables["j"] = std::to_string(j);
        ev.variables["shiftVal"] = std::to_string(arr[j + 1]);
        emitter.emit(ev);

        // Line 9: arr[j] = arr[j + 1]
        arr[j] = arr[j + 1];
        ev = TraceEvent();
        ev.eventType = "shift";
        ev.title = "arr[" + std::to_string(j) + "] = arr[" + std::to_string(j + 1) + "] (" + std::to_string(arr[j]) + ")";
        ev.description = "Element shifted left into position " + std::to_string(j) + ".";
        ev.sourceLine = 9;
        ev.arrayState = arr;
        ev.activeIndices = {j};
        ev.highlightedItems[j] = "shifting";
        ev.pointers.push_back({"shifted", j, "indigo"});
        ev.variables["j"] = std::to_string(j);
        emitter.emit(ev);
    }

    // Line 11: arr.pop_back()
    arr.pop_back();
    ev = TraceEvent();
    ev.eventType = "truncate";
    ev.title = "arr.pop_back(): Truncate Redundant Trailing Element";
    ev.description = "Removed redundant trailing slot. New vector size: " + std::to_string(arr.size()) + ".";
    ev.sourceLine = 11;
    ev.arrayState = arr;
    ev.variables["newSize"] = std::to_string(arr.size());
    emitter.emit(ev);

    // Line 12: Complete
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Deletion Complete";
    ev.description = "Element " + std::to_string(targetValue) + " deleted. Left-shifted " + 
                     std::to_string(std::max(0, n - 1 - index)) + " elements. Time complexity: O(n).";
    ev.sourceLine = 12;
    ev.arrayState = arr;
    ev.variables["deletedValue"] = std::to_string(targetValue);
    ev.variables["totalShifts"] = std::to_string(std::max(0, n - 1 - index));
    ev.variables["timeComplexity"] = "O(n)";
    ev.statusText = "Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 7. Linear Search
int traceLinearSearch(const std::vector<int>& arr, int target, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    // Line 5: Function entry
    ev.eventType = "init";
    ev.title = "linearSearch(arr, target = " + std::to_string(target) + ")";
    ev.description = "Starting sequential scan from index 0 across " + std::to_string(n) + " elements.";
    ev.sourceLine = 5;
    ev.arrayState = arr;
    ev.variables["target"] = std::to_string(target);
    ev.variables["n"] = std::to_string(n);
    emitter.emit(ev);

    if (n == 0) {
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "Return -1 (Empty Vector)";
        ev.description = "Vector is empty. Loop does not execute. Target " + std::to_string(target) + " not found.";
        ev.sourceLine = 11;
        ev.arrayState = arr;
        ev.variables["target"] = std::to_string(target);
        ev.variables["return"] = "-1";
        ev.isCompleted = true;
        emitter.emit(ev);
        return -1;
    }

    std::map<int, std::string> visitedMap;

    for (int i = 0; i < n; ++i) {
        // Line 6: Loop condition
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "Loop Check: i (" + std::to_string(i) + ") < " + std::to_string(n);
        ev.description = "Evaluating loop counter i = " + std::to_string(i) + ".";
        ev.sourceLine = 6;
        ev.arrayState = arr;
        visitedMap[i] = "active";
        ev.highlightedItems = visitedMap;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["target"] = std::to_string(target);
        emitter.emit(ev);

        // Line 7: Compare arr[i] == target
        bool isMatch = (arr[i] == target);
        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "Compare: arr[" + std::to_string(i) + "] (" + std::to_string(arr[i]) + ") == target (" + std::to_string(target) + ")";
        ev.description = isMatch ? "MATCH FOUND! arr[" + std::to_string(i) + "] equals target " + std::to_string(target) + "."
                                : "No match (" + std::to_string(arr[i]) + " != " + std::to_string(target) + "). Continuing.";
        ev.sourceLine = 7;
        ev.arrayState = arr;
        visitedMap[i] = isMatch ? "found" : "compare";
        ev.highlightedItems = visitedMap;
        ev.activeIndices = {i};
        ev.pointers.push_back({"i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["arr[i]"] = std::to_string(arr[i]);
        ev.variables["target"] = std::to_string(target);
        ev.variables["match"] = isMatch ? "true" : "false";
        emitter.emit(ev);

        if (isMatch) {
            // Line 8: Return i
            ev = TraceEvent();
            ev.eventType = "complete";
            ev.title = "Return i = " + std::to_string(i) + " (Target Found)";
            ev.description = "Target " + std::to_string(target) + " found at index " + std::to_string(i) + 
                             " after " + std::to_string(i + 1) + " comparison(s). Halting at first match.";
            ev.sourceLine = 8;
            ev.arrayState = arr;
            visitedMap[i] = "found";
            ev.highlightedItems = visitedMap;
            ev.activeIndices = {i};
            ev.pointers.push_back({"match", i, "emerald"});
            ev.variables["return"] = std::to_string(i);
            ev.variables["foundIndex"] = std::to_string(i);
            ev.variables["comparisons"] = std::to_string(i + 1);
            ev.statusText = "Match found";
            ev.isCompleted = true;
            emitter.emit(ev);
            return i;
        }

        visitedMap[i] = "visited";
    }

    // Line 11: Return -1
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Return -1 (Target Not Found)";
    ev.description = "All " + std::to_string(n) + " elements compared without match. Returning -1.";
    ev.sourceLine = 11;
    ev.arrayState = arr;
    ev.highlightedItems = visitedMap;
    ev.variables["target"] = std::to_string(target);
    ev.variables["return"] = "-1";
    ev.variables["totalComparisons"] = std::to_string(n);
    ev.variables["timeComplexity"] = "O(n)";
    ev.statusText = "Not found";
    ev.isCompleted = true;
    emitter.emit(ev);
    return -1;
}

// 8. Binary Search
int traceBinarySearch(const std::vector<int>& arr, int target, TraceEmitter& emitter) {
    TraceEvent ev;
    int n = static_cast<int>(arr.size());

    // Check sorted requirement
    if (!isSorted(arr)) {
        ev.eventType = "error";
        ev.title = "Error: Input Array Must Be Sorted in Ascending Order";
        ev.description = "Binary search requires array elements to be non-decreasing. The provided vector is unsorted.";
        ev.sourceLine = 5;
        ev.arrayState = arr;
        ev.variables["error"] = "ArrayNotSorted";
        ev.isCompleted = true;
        emitter.emit(ev);
        return -1;
    }

    // Line 6-7: Initialize low and high
    int low = 0;
    int high = n - 1;

    ev.eventType = "init";
    ev.title = "Initialize Search Bounds: low = 0, high = " + std::to_string(high);
    ev.description = "Setting binary search boundaries: low = 0, high = " + std::to_string(high) + ". Target = " + std::to_string(target) + ".";
    ev.sourceLine = 6;
    ev.arrayState = arr;
    if (n > 0) {
        ev.activeIndices = {low, high};
        ev.highlightedItems[low] = "active";
        ev.highlightedItems[high] = "active";
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"high", high, "purple"});
    }
    ev.variables["low"] = std::to_string(low);
    ev.variables["high"] = std::to_string(high);
    ev.variables["target"] = std::to_string(target);
    ev.variables["n"] = std::to_string(n);
    emitter.emit(ev);

    std::map<int, std::string> discardedMap;
    int iteration = 0;

    // Line 8: while (low <= high)
    while (low <= high) {
        iteration++;

        // Line 8: Condition
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "Iteration " + std::to_string(iteration) + ": Evaluate low (" + std::to_string(low) + ") <= high (" + std::to_string(high) + ")";
        ev.description = "Search window has size " + std::to_string(high - low + 1) + ". Condition low <= high is true.";
        ev.sourceLine = 8;
        ev.arrayState = arr;
        ev.highlightedItems = discardedMap;
        ev.highlightedItems[low] = "active";
        ev.highlightedItems[high] = "active";
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"high", high, "purple"});
        ev.variables["low"] = std::to_string(low);
        ev.variables["high"] = std::to_string(high);
        ev.variables["windowSize"] = std::to_string(high - low + 1);
        emitter.emit(ev);

        // Line 9: Calculate mid
        int mid = low + (high - low) / 2;
        int midVal = arr[mid];

        ev = TraceEvent();
        ev.eventType = "mid";
        ev.title = "Calculate mid = low + (high - low) / 2 = " + std::to_string(mid);
        ev.description = "Midpoint index is " + std::to_string(mid) + " (arr[mid] = " + std::to_string(midVal) + ").";
        ev.sourceLine = 9;
        ev.arrayState = arr;
        ev.highlightedItems = discardedMap;
        ev.highlightedItems[mid] = "compare";
        ev.activeIndices = {mid};
        ev.pointers.push_back({"low", low, "indigo"});
        ev.pointers.push_back({"mid", mid, "amber"});
        ev.pointers.push_back({"high", high, "purple"});
        ev.variables["low"] = std::to_string(low);
        ev.variables["mid"] = std::to_string(mid);
        ev.variables["high"] = std::to_string(high);
        ev.variables["arr[mid]"] = std::to_string(midVal);
        emitter.emit(ev);

        // Line 10: Check match
        if (midVal == target) {
            // Line 11: Return mid
            ev = TraceEvent();
            ev.eventType = "complete";
            ev.title = "arr[mid] == target: Return mid = " + std::to_string(mid);
            ev.description = "Match found! arr[" + std::to_string(mid) + "] == " + std::to_string(target) + 
                             ". Found in " + std::to_string(iteration) + " step(s) in O(log n) time.";
            ev.sourceLine = 11;
            ev.arrayState = arr;
            ev.highlightedItems = discardedMap;
            ev.highlightedItems[mid] = "found";
            ev.activeIndices = {mid};
            ev.pointers.push_back({"match", mid, "emerald"});
            ev.variables["return"] = std::to_string(mid);
            ev.variables["mid"] = std::to_string(mid);
            ev.variables["target"] = std::to_string(target);
            ev.variables["iterations"] = std::to_string(iteration);
            ev.statusText = "Target found";
            ev.isCompleted = true;
            emitter.emit(ev);
            return mid;
        }

        // Line 13: if (arr[mid] < target)
        if (midVal < target) {
            // Discard left half [low ... mid]
            for (int k = low; k <= mid; ++k) {
                discardedMap[k] = "discarded";
            }

            ev = TraceEvent();
            ev.eventType = "branch";
            ev.title = "arr[mid] (" + std::to_string(midVal) + ") < target (" + std::to_string(target) + "): Discard Left Half";
            ev.description = "Target is greater than arr[mid]. Discarding range [" + std::to_string(low) + ", " + 
                             std::to_string(mid) + "] and updating low = mid + 1 (" + std::to_string(mid + 1) + ").";
            ev.sourceLine = 14;
            ev.arrayState = arr;
            ev.highlightedItems = discardedMap;
            ev.pointers.push_back({"low", mid + 1, "indigo"});
            ev.pointers.push_back({"high", high, "purple"});
            ev.variables["low"] = std::to_string(mid + 1);
            ev.variables["high"] = std::to_string(high);
            ev.variables["action"] = "low = mid + 1";
            emitter.emit(ev);

            low = mid + 1;
        } else {
            // Line 16: arr[mid] > target: Discard right half [mid ... high]
            for (int k = mid; k <= high; ++k) {
                discardedMap[k] = "discarded";
            }

            ev = TraceEvent();
            ev.eventType = "branch";
            ev.title = "arr[mid] (" + std::to_string(midVal) + ") > target (" + std::to_string(target) + "): Discard Right Half";
            ev.description = "Target is smaller than arr[mid]. Discarding range [" + std::to_string(mid) + ", " + 
                             std::to_string(high) + "] and updating high = mid - 1 (" + std::to_string(mid - 1) + ").";
            ev.sourceLine = 16;
            ev.arrayState = arr;
            ev.highlightedItems = discardedMap;
            ev.pointers.push_back({"low", low, "indigo"});
            ev.pointers.push_back({"high", mid - 1, "purple"});
            ev.variables["low"] = std::to_string(low);
            ev.variables["high"] = std::to_string(mid - 1);
            ev.variables["action"] = "high = mid - 1";
            emitter.emit(ev);

            high = mid - 1;
        }
    }

    // Line 19: Return -1
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Search Window Exhausted (low > high): Return -1";
    ev.description = "low (" + std::to_string(low) + ") > high (" + std::to_string(high) + "). Target " + 
                     std::to_string(target) + " is not present in vector. Returning -1.";
    ev.sourceLine = 19;
    ev.arrayState = arr;
    ev.highlightedItems = discardedMap;
    ev.variables["low"] = std::to_string(low);
    ev.variables["high"] = std::to_string(high);
    ev.variables["target"] = std::to_string(target);
    ev.variables["return"] = "-1";
    ev.variables["timeComplexity"] = "O(log n)";
    ev.statusText = "Target not found";
    ev.isCompleted = true;
    emitter.emit(ev);
    return -1;
}

// Canonical displayed C++ source code
std::string getCppSourceCode(const std::string& operationId) {
    if (operationId == "array-basics") {
        return 
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "int main() {\n"
            "    vector<int> arr = {10, 20, 30, 40, 50};\n"
            "    for (int i = 0; i < static_cast<int>(arr.size()); i++) {\n"
            "        cout << \"Index: \" << i << \", Value: \" << arr[i] << '\\n';\n"
            "    }\n"
            "    return 0;\n"
            "}";
    }
    if (operationId == "traversal") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "void traverse(const vector<int>& arr) {\n"
            "    for (int i = 0; i < static_cast<int>(arr.size()); i++) {\n"
            "        int value = arr[i]; // Visit arr[i]\n"
            "        cout << \"Visiting: \" << value << '\\n';\n"
            "    }\n"
            "}";
    }
    if (operationId == "access") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "int accessAtIndex(const vector<int>& arr, int index) {\n"
            "    if (index >= 0 && index < static_cast<int>(arr.size())) {\n"
            "        int value = arr[index];\n"
            "        return value;\n"
            "    }\n"
            "    return -1; // Out of bounds\n"
            "}";
    }
    if (operationId == "update") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "bool updateElement(vector<int>& arr, int index, int newValue) {\n"
            "    if (index >= 0 && index < static_cast<int>(arr.size())) {\n"
            "        arr[index] = newValue;\n"
            "        return true;\n"
            "    }\n"
            "    return false; // Out of bounds\n"
            "}";
    }
    if (operationId == "insert") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "void insertAt(vector<int>& arr, int index, int value) {\n"
            "    // Shift elements right starting from the end\n"
            "    arr.push_back(0); // Expand vector size\n"
            "    for (int j = static_cast<int>(arr.size()) - 2; j >= index; j--) {\n"
            "        arr[j + 1] = arr[j]; // Shift element right\n"
            "    }\n"
            "    arr[index] = value; // Place new element\n"
            "}";
    }
    if (operationId == "delete") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "void deleteAt(vector<int>& arr, int index) {\n"
            "    // Shift subsequent elements left\n"
            "    int n = static_cast<int>(arr.size());\n"
            "    for (int j = index; j < n - 1; j++) {\n"
            "        arr[j] = arr[j + 1]; // Shift element left\n"
            "    }\n"
            "    arr.pop_back(); // Truncate trailing element\n"
            "}";
    }
    if (operationId == "linear-search") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "int linearSearch(const vector<int>& arr, int target) {\n"
            "    for (int i = 0; i < static_cast<int>(arr.size()); i++) {\n"
            "        if (arr[i] == target) {\n"
            "            return i; // First match found\n"
            "        }\n"
            "    }\n"
            "    return -1; // Target not found\n"
            "}";
    }
    if (operationId == "binary-search") {
        return
            "#include <iostream>\n"
            "#include <vector>\n"
            "using namespace std;\n"
            "\n"
            "int binarySearch(const vector<int>& arr, int target) {\n"
            "    int low = 0;\n"
            "    int high = static_cast<int>(arr.size()) - 1;\n"
            "    while (low <= high) {\n"
            "        int mid = low + (high - low) / 2;\n"
            "        if (arr[mid] == target) {\n"
            "            return mid;\n"
            "        }\n"
            "        if (arr[mid] < target) {\n"
            "            low = mid + 1;\n"
            "        } else {\n"
            "            high = mid - 1;\n"
            "        }\n"
            "    }\n"
            "    return -1; // Not found\n"
            "}";
    }
    return "// C++ implementation not found";
}
