#include "../include/stack_algorithms.hpp"
#include <iostream>
#include <sstream>

// Helper to fill common stack trace properties
static void setStackProps(TraceEvent& ev, const Stack& s) {
    ev.stackState = s.getData();
    ev.arrayState = s.getData(); // For backward compatibility with general visualizer components
    ev.capacity = s.getCapacity();
    ev.topIndex = s.size() > 0 ? s.size() - 1 : -1;
    ev.variables["size"] = std::to_string(s.size());
    ev.variables["capacity"] = std::to_string(s.getCapacity());
    if (s.size() > 0) {
        ev.variables["topIndex"] = std::to_string(s.size() - 1);
        int topVal = 0;
        if (s.peek(topVal)) {
            ev.variables["topValue"] = std::to_string(topVal);
        }
        ev.pointers.push_back({"TOP", s.size() - 1, "violet"});
    } else {
        ev.variables["topIndex"] = "-1 (Empty)";
        ev.variables["topValue"] = "None";
    }
}

// 1. Stack Introduction
void traceStackIntro(const Stack& initialStack, TraceEmitter& emitter) {
    Stack s(5);
    TraceEvent ev;

    // Line 6: Initialize Stack(5)
    ev.eventType = "init";
    ev.title = "Stack s(5) Initialized";
    ev.description = "A bounded stack backed by std::vector<int> is allocated with capacity 5. Initially empty (size = 0).";
    ev.sourceLine = 6;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Initialized";
    emitter.emit(ev);

    // Line 7: push(10)
    s.push(10);
    ev = TraceEvent();
    ev.eventType = "push";
    ev.title = "s.push(10) - Insert First Element";
    ev.description = "10 is inserted at the bottom (index 0). Top pointer points to index 0.";
    ev.sourceLine = 7;
    setStackProps(ev, s);
    ev.activeIndices = {0};
    ev.highlightedItems[0] = "push";
    ev.statusType = "success";
    ev.statusText = "Pushed 10";
    emitter.emit(ev);

    // Line 8: push(20)
    s.push(20);
    ev = TraceEvent();
    ev.eventType = "push";
    ev.title = "s.push(20) - Insert Second Element";
    ev.description = "20 is pushed on top of 10. Vector size is now 2; top pointer updates to index 1.";
    ev.sourceLine = 8;
    setStackProps(ev, s);
    ev.activeIndices = {1};
    ev.highlightedItems[1] = "push";
    ev.statusType = "success";
    ev.statusText = "Pushed 20";
    emitter.emit(ev);

    // Line 9: push(30)
    s.push(30);
    ev = TraceEvent();
    ev.eventType = "push";
    ev.title = "s.push(30) - Insert Third Element";
    ev.description = "30 is pushed on top. Top pointer updates to index 2. 30 is now the most recently inserted element.";
    ev.sourceLine = 9;
    setStackProps(ev, s);
    ev.activeIndices = {2};
    ev.highlightedItems[2] = "push";
    ev.statusType = "success";
    ev.statusText = "Pushed 30 (Current Top)";
    emitter.emit(ev);

    // Line 11: peek(topVal)
    int topVal = 0;
    s.peek(topVal);
    ev = TraceEvent();
    ev.eventType = "peek";
    ev.title = "s.peek(topVal) - Inspect Top Element";
    ev.description = "Peek reads top value 30 without removing it. Stack contents remain completely untouched.";
    ev.sourceLine = 11;
    setStackProps(ev, s);
    ev.activeIndices = {2};
    ev.highlightedItems[2] = "peek";
    ev.variables["topVal"] = std::to_string(topVal);
    ev.statusType = "success";
    ev.statusText = "Inspected Top (30)";
    emitter.emit(ev);

    // Line 12: pop()
    ev = TraceEvent();
    ev.eventType = "pop";
    ev.title = "s.pop() - Remove Top Element";
    ev.description = "Pop removes 30, the most recently pushed element. Notice that 10 and 20 remain safely below.";
    ev.sourceLine = 12;
    setStackProps(ev, s);
    ev.activeIndices = {2};
    ev.highlightedItems[2] = "pop";
    ev.statusType = "normal";
    ev.statusText = "Popping 30";
    emitter.emit(ev);

    s.pop();

    // Line 13: Complete
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "LIFO Demonstration Complete";
    ev.description = "Last-In, First-Out (LIFO) demonstrated: The element inserted last (30) was removed first. Top is now 20.";
    ev.sourceLine = 13;
    setStackProps(ev, s);
    ev.activeIndices = {1};
    ev.highlightedItems[1] = "active";
    ev.statusType = "success";
    ev.statusText = "LIFO Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 2. Push Operation
void tracePush(Stack s, int value, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin push
    ev.eventType = "start";
    ev.title = "Call push(" + std::to_string(value) + ")";
    ev.description = "Initiating push operation for value " + std::to_string(value) + ". Checking capacity constraints.";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.variables["value"] = std::to_string(value);
    ev.statusType = "normal";
    ev.statusText = "Checking capacity";
    emitter.emit(ev);

    // Line 2: Check isFull()
    bool full = s.isFull();
    ev = TraceEvent();
    ev.eventType = "condition";
    ev.title = "Check if (isFull()): " + std::string(full ? "True" : "False");
    ev.description = "Evaluating condition: current size (" + std::to_string(s.size()) + ") >= capacity (" + std::to_string(s.getCapacity()) + ").";
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["value"] = std::to_string(value);
    ev.variables["isFull()"] = full ? "true" : "false";

    if (full) {
        ev.statusType = "overflow";
        ev.statusText = "Stack Overflow Detected";
        emitter.emit(ev);

        // Line 3: Output overflow message
        ev = TraceEvent();
        ev.eventType = "overflow";
        ev.title = "cout << \"Stack Overflow!\";";
        ev.description = "Stack is full. Cannot insert " + std::to_string(value) + " because capacity (" + std::to_string(s.getCapacity()) + ") has been reached.";
        ev.sourceLine = 3;
        setStackProps(ev, s);
        ev.variables["value"] = std::to_string(value);
        ev.statusType = "overflow";
        ev.statusText = "Stack Overflow!";
        emitter.emit(ev);

        // Line 4: Return false
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "return false; (Push Rejected)";
        ev.description = "Operation aborted due to Stack Overflow. Stack elements remain unchanged.";
        ev.sourceLine = 4;
        setStackProps(ev, s);
        ev.variables["value"] = std::to_string(value);
        ev.variables["result"] = "false (Overflow)";
        ev.statusType = "overflow";
        ev.statusText = "Rejected: Overflow";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    ev.statusType = "normal";
    ev.statusText = "Capacity available";
    emitter.emit(ev);

    // Line 6: data.push_back(value)
    s.push(value);
    int newTop = s.size() - 1;

    ev = TraceEvent();
    ev.eventType = "push";
    ev.title = "data.push_back(" + std::to_string(value) + ");";
    ev.description = "Appended " + std::to_string(value) + " to the underlying vector. Memory allocated at slot index " + std::to_string(newTop) + ".";
    ev.sourceLine = 6;
    setStackProps(ev, s);
    ev.activeIndices = {newTop};
    ev.highlightedItems[newTop] = "push";
    ev.variables["value"] = std::to_string(value);
    ev.statusType = "success";
    ev.statusText = "Element pushed";
    emitter.emit(ev);

    // Line 7: newTop pointer updated
    ev = TraceEvent();
    ev.eventType = "update";
    ev.title = "Update Top Pointer -> Index " + std::to_string(newTop);
    ev.description = "Stack top pointer is updated to index " + std::to_string(newTop) + ". New stack size is " + std::to_string(s.size()) + ".";
    ev.sourceLine = 7;
    setStackProps(ev, s);
    ev.activeIndices = {newTop};
    ev.highlightedItems[newTop] = "active";
    ev.variables["newTop"] = std::to_string(newTop);
    ev.variables["value"] = std::to_string(value);
    ev.statusType = "success";
    ev.statusText = "Top updated";
    emitter.emit(ev);

    // Line 8: Return true
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return true; (Push Succeeded)";
    ev.description = "Push operation finished successfully in amortized O(1) time. " + std::to_string(value) + " is now at the top of the stack.";
    ev.sourceLine = 8;
    setStackProps(ev, s);
    ev.activeIndices = {newTop};
    ev.highlightedItems[newTop] = "found";
    ev.variables["result"] = "true";
    ev.statusType = "success";
    ev.statusText = "Push successful";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 3. Pop Operation
void tracePop(Stack s, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin pop
    ev.eventType = "start";
    ev.title = "Call pop()";
    ev.description = "Initiating pop operation. Checking if stack contains any elements to remove.";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Starting pop";
    emitter.emit(ev);

    // Line 2: Check isEmpty()
    bool empty = s.isEmpty();
    ev = TraceEvent();
    ev.eventType = "condition";
    ev.title = "Check if (isEmpty()): " + std::string(empty ? "True" : "False");
    ev.description = "Evaluating condition: vector size (" + std::to_string(s.size()) + ") == 0.";
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["isEmpty()"] = empty ? "true" : "false";

    if (empty) {
        ev.statusType = "underflow";
        ev.statusText = "Stack Underflow Detected";
        emitter.emit(ev);

        // Line 3: Output underflow message
        ev = TraceEvent();
        ev.eventType = "underflow";
        ev.title = "cout << \"Stack Underflow!\";";
        ev.description = "Cannot pop from an empty stack (size = 0). Underflow condition reached.";
        ev.sourceLine = 3;
        setStackProps(ev, s);
        ev.statusType = "underflow";
        ev.statusText = "Stack Underflow!";
        emitter.emit(ev);

        // Line 4: Return false
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "return false; (Pop Rejected)";
        ev.description = "Operation aborted due to Stack Underflow. Vector was empty.";
        ev.sourceLine = 4;
        setStackProps(ev, s);
        ev.variables["result"] = "false (Underflow)";
        ev.statusType = "underflow";
        ev.statusText = "Rejected: Underflow";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    ev.statusType = "normal";
    ev.statusText = "Non-empty stack";
    emitter.emit(ev);

    // Line 6: int poppedValue = data.back();
    int topIdx = s.size() - 1;
    int poppedVal = 0;
    s.peek(poppedVal);

    ev = TraceEvent();
    ev.eventType = "read";
    ev.title = "int poppedValue = data.back(); (" + std::to_string(poppedVal) + ")";
    ev.description = "Reading top element at index " + std::to_string(topIdx) + " with value " + std::to_string(poppedVal) + " before removal.";
    ev.sourceLine = 6;
    setStackProps(ev, s);
    ev.activeIndices = {topIdx};
    ev.highlightedItems[topIdx] = "pop";
    ev.variables["poppedValue"] = std::to_string(poppedVal);
    ev.statusType = "normal";
    ev.statusText = "Identified " + std::to_string(poppedVal);
    emitter.emit(ev);

    // Line 7: data.pop_back();
    s.pop();

    ev = TraceEvent();
    ev.eventType = "pop";
    ev.title = "data.pop_back(); (Removed " + std::to_string(poppedVal) + ")";
    ev.description = "Top element removed from vector. Stack size decreases from " + std::to_string(topIdx + 1) + " to " + std::to_string(s.size()) + ".";
    ev.sourceLine = 7;
    setStackProps(ev, s);
    ev.variables["removedValue"] = std::to_string(poppedVal);
    ev.statusType = "success";
    ev.statusText = "Element removed";
    emitter.emit(ev);

    // Line 8: Return true
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return true; (Pop Succeeded)";
    ev.description = "Pop operation succeeded in O(1) time. Removed value was " + std::to_string(poppedVal) + ".";
    ev.sourceLine = 8;
    setStackProps(ev, s);
    ev.variables["result"] = "true";
    ev.variables["removedValue"] = std::to_string(poppedVal);
    ev.statusType = "success";
    ev.statusText = "Pop complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 4. Peek / Top Operation
void tracePeek(const Stack& s, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin peek
    ev.eventType = "start";
    ev.title = "Call peek(result)";
    ev.description = "Initiating peek operation to inspect top element without modifying stack state.";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Starting peek";
    emitter.emit(ev);

    // Line 2: Check isEmpty()
    bool empty = s.isEmpty();
    ev = TraceEvent();
    ev.eventType = "condition";
    ev.title = "Check if (isEmpty()): " + std::string(empty ? "True" : "False");
    ev.description = "Evaluating condition: vector size (" + std::to_string(s.size()) + ") == 0.";
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["isEmpty()"] = empty ? "true" : "false";

    if (empty) {
        ev.statusType = "underflow";
        ev.statusText = "Stack is Empty";
        emitter.emit(ev);

        // Line 3: Output empty message
        ev = TraceEvent();
        ev.eventType = "underflow";
        ev.title = "cout << \"Stack is Empty!\";";
        ev.description = "Cannot peek into an empty stack. No top element exists.";
        ev.sourceLine = 3;
        setStackProps(ev, s);
        ev.statusType = "underflow";
        ev.statusText = "Stack is Empty!";
        emitter.emit(ev);

        // Line 4: Return false
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "return false; (Peek Failed)";
        ev.description = "Peek operation rejected because stack is empty.";
        ev.sourceLine = 4;
        setStackProps(ev, s);
        ev.variables["result"] = "false (Empty)";
        ev.statusType = "underflow";
        ev.statusText = "Rejected: Empty";
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    ev.statusType = "normal";
    ev.statusText = "Stack has elements";
    emitter.emit(ev);

    // Line 6: result = data.back();
    int topIdx = s.size() - 1;
    int resultVal = 0;
    s.peek(resultVal);

    ev = TraceEvent();
    ev.eventType = "peek";
    ev.title = "result = data.back(); (" + std::to_string(resultVal) + ")";
    ev.description = "Read top element at index " + std::to_string(topIdx) + ". Value is " + std::to_string(resultVal) + ". Notice stack is NOT modified.";
    ev.sourceLine = 6;
    setStackProps(ev, s);
    ev.activeIndices = {topIdx};
    ev.highlightedItems[topIdx] = "peek";
    ev.variables["result"] = std::to_string(resultVal);
    ev.statusType = "success";
    ev.statusText = "Peeked " + std::to_string(resultVal);
    emitter.emit(ev);

    // Line 7: Return true
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return true; (Peek Complete)";
    ev.description = "Peek finished in O(1) time. Top element is " + std::to_string(resultVal) + ". Stack remains unchanged.";
    ev.sourceLine = 7;
    setStackProps(ev, s);
    ev.activeIndices = {topIdx};
    ev.highlightedItems[topIdx] = "peek";
    ev.variables["result"] = std::to_string(resultVal);
    ev.statusType = "success";
    ev.statusText = "Peek complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 5. Is Empty
void traceIsEmpty(const Stack& s, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin isEmpty
    ev.eventType = "start";
    ev.title = "Call isEmpty()";
    ev.description = "Checking whether stack contains 0 elements.";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Checking empty";
    emitter.emit(ev);

    // Line 2: bool result = data.empty();
    bool emptyResult = s.isEmpty();
    ev = TraceEvent();
    ev.eventType = "condition";
    ev.title = "bool result = data.empty(); -> " + std::string(emptyResult ? "true" : "false");
    ev.description = "Underlying std::vector::empty() evaluates to " + std::string(emptyResult ? "true (stack has 0 elements)" : "false (stack has " + std::to_string(s.size()) + " elements)");
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["result"] = emptyResult ? "true" : "false";
    ev.statusType = emptyResult ? "normal" : "success";
    ev.statusText = emptyResult ? "Stack is empty" : "Stack is not empty";
    emitter.emit(ev);

    // Line 3: Return result
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return " + std::string(emptyResult ? "true;" : "false;");
    ev.description = "Method returns " + std::string(emptyResult ? "true" : "false") + " in O(1) time.";
    ev.sourceLine = 3;
    setStackProps(ev, s);
    ev.variables["result"] = emptyResult ? "true" : "false";
    ev.statusType = "success";
    ev.statusText = "Check complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 6. Is Full
void traceIsFull(const Stack& s, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin isFull
    ev.eventType = "start";
    ev.title = "Call isFull()";
    ev.description = "Checking whether stack has reached configured capacity (" + std::to_string(s.getCapacity()) + ").";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Checking full";
    emitter.emit(ev);

    // Line 2: bool result = (size >= capacity);
    bool fullResult = s.isFull();
    ev = TraceEvent();
    ev.eventType = "condition";
    ev.title = "bool result = (data.size() >= capacity); -> " + std::string(fullResult ? "true" : "false");
    ev.description = "Comparing size (" + std::to_string(s.size()) + ") >= capacity (" + std::to_string(s.getCapacity()) + ") = " + std::string(fullResult ? "true (At full capacity)" : "false (Slots available)");
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["result"] = fullResult ? "true" : "false";
    ev.statusType = fullResult ? "overflow" : "success";
    ev.statusText = fullResult ? "Stack is full" : "Capacity available";
    emitter.emit(ev);

    // Line 3: Return result
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return " + std::string(fullResult ? "true;" : "false;");
    ev.description = "Method returns " + std::string(fullResult ? "true" : "false") + " in O(1) time.";
    ev.sourceLine = 3;
    setStackProps(ev, s);
    ev.variables["result"] = fullResult ? "true" : "false";
    ev.statusType = fullResult ? "overflow" : "success";
    ev.statusText = "Check complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 7. Stack Size
void traceStackSize(const Stack& s, TraceEmitter& emitter) {
    TraceEvent ev;

    // Line 1: Begin size()
    ev.eventType = "start";
    ev.title = "Call size()";
    ev.description = "Querying number of active elements stored in the stack.";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.statusType = "normal";
    ev.statusText = "Querying size";
    emitter.emit(ev);

    // Line 2: int currentSize = static_cast<int>(data.size());
    int currentSize = s.size();
    ev = TraceEvent();
    ev.eventType = "read";
    ev.title = "int currentSize = static_cast<int>(data.size()); (" + std::to_string(currentSize) + ")";
    ev.description = "Retrieved internal vector size count: " + std::to_string(currentSize) + " element(s) currently stored.";
    ev.sourceLine = 2;
    setStackProps(ev, s);
    ev.variables["currentSize"] = std::to_string(currentSize);
    ev.statusType = "success";
    ev.statusText = "Size is " + std::to_string(currentSize);
    emitter.emit(ev);

    // Line 3: Return currentSize
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return " + std::to_string(currentSize) + ";";
    ev.description = "Returned size " + std::to_string(currentSize) + " in O(1) time.";
    ev.sourceLine = 3;
    setStackProps(ev, s);
    ev.variables["result"] = std::to_string(currentSize);
    ev.statusType = "success";
    ev.statusText = "Size retrieved";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 8. Search in Stack
int traceSearchStack(const Stack& s, int target, TraceEmitter& emitter) {
    const auto& data = s.getData();
    int n = static_cast<int>(data.size());
    TraceEvent ev;

    // Line 1: Begin search
    ev.eventType = "start";
    ev.title = "searchStack(data, " + std::to_string(target) + ")";
    ev.description = "Searching for target " + std::to_string(target) + " by inspecting elements from TOP (index " + std::to_string(n - 1) + ") down to BOTTOM (index 0).";
    ev.sourceLine = 1;
    setStackProps(ev, s);
    ev.variables["target"] = std::to_string(target);
    ev.statusType = "normal";
    ev.statusText = "Starting search";
    emitter.emit(ev);

    if (n == 0) {
        // Line 7: Empty stack -> return -1
        ev = TraceEvent();
        ev.eventType = "complete";
        ev.title = "return -1; (Empty Stack)";
        ev.description = "Stack is empty; target " + std::to_string(target) + " not found.";
        ev.sourceLine = 7;
        setStackProps(ev, s);
        ev.variables["target"] = std::to_string(target);
        ev.variables["result"] = "-1 (Not found)";
        ev.statusType = "normal";
        ev.statusText = "Target not found";
        ev.isCompleted = true;
        emitter.emit(ev);
        return -1;
    }

    // Inspect elements from top to bottom
    for (int i = n - 1; i >= 0; --i) {
        int val = data[i];

        // Line 2: Loop condition
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "Loop Check: i = " + std::to_string(i) + " >= 0";
        ev.description = "Inspecting stack slot index " + std::to_string(i) + " (" + std::to_string(n - 1 - i) + " positions below top).";
        ev.sourceLine = 2;
        setStackProps(ev, s);
        ev.activeIndices = {i};
        ev.highlightedItems[i] = "active";
        ev.pointers.push_back({"search_i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["data[i]"] = std::to_string(val);
        ev.variables["target"] = std::to_string(target);
        ev.statusType = "normal";
        ev.statusText = "Inspecting index " + std::to_string(i);
        emitter.emit(ev);

        // Line 3: Compare data[i] == target
        bool matched = (val == target);
        ev = TraceEvent();
        ev.eventType = "compare";
        ev.title = "if (data[" + std::to_string(i) + "] == " + std::to_string(target) + ") -> " + std::to_string(val) + " == " + std::to_string(target) + " (" + (matched ? "Match!" : "Mismatch") + ")";
        ev.description = matched ? "Target found! data[" + std::to_string(i) + "] matches target " + std::to_string(target) + "." 
                                : "Value " + std::to_string(val) + " != " + std::to_string(target) + ". Moving downwards.";
        ev.sourceLine = 3;
        setStackProps(ev, s);
        ev.activeIndices = {i};
        ev.highlightedItems[i] = matched ? "found" : "compare";
        ev.pointers.push_back({"search_i", i, "indigo"});
        ev.variables["i"] = std::to_string(i);
        ev.variables["data[i]"] = std::to_string(val);
        ev.variables["target"] = std::to_string(target);
        ev.statusType = matched ? "success" : "normal";
        ev.statusText = matched ? "Match found!" : "Not a match";
        emitter.emit(ev);

        if (matched) {
            // Line 4: Return i
            ev = TraceEvent();
            ev.eventType = "complete";
            ev.title = "return " + std::to_string(i) + "; (Found at Index " + std::to_string(i) + ")";
            ev.description = "First occurrence from top found at index " + std::to_string(i) + ". Stopping search in O(" + std::to_string(n - i) + ") time.";
            ev.sourceLine = 4;
            setStackProps(ev, s);
            ev.activeIndices = {i};
            ev.highlightedItems[i] = "found";
            ev.pointers.push_back({"search_i", i, "indigo"});
            ev.variables["result"] = std::to_string(i);
            ev.variables["target"] = std::to_string(target);
            ev.statusType = "success";
            ev.statusText = "Found at index " + std::to_string(i);
            ev.isCompleted = true;
            emitter.emit(ev);
            return i;
        }
    }

    // Line 7: Return -1 (Not found)
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "return -1; (Target Not Found)";
    ev.description = "Inspected all " + std::to_string(n) + " elements from top to bottom. Target " + std::to_string(target) + " does not exist in stack.";
    ev.sourceLine = 7;
    setStackProps(ev, s);
    ev.variables["result"] = "-1 (Not found)";
    ev.variables["target"] = std::to_string(target);
    ev.statusType = "normal";
    ev.statusText = "Target not found";
    ev.isCompleted = true;
    emitter.emit(ev);
    return -1;
}

// 9. Reverse a Stack
void traceReverseStack(Stack original, TraceEmitter& emitter) {
    Stack aux(original.getCapacity());
    TraceEvent ev;

    // Line 1: Begin reverseStack
    ev.eventType = "start";
    ev.title = "reverseStack(original, aux)";
    ev.description = "Reversing stack by popping each element from the original stack and pushing it onto an auxiliary stack.";
    ev.sourceLine = 1;
    ev.stackState = original.getData();
    ev.auxStackState = aux.getData();
    ev.capacity = original.getCapacity();
    ev.topIndex = original.size() > 0 ? original.size() - 1 : -1;
    ev.variables["originalSize"] = std::to_string(original.size());
    ev.variables["auxSize"] = std::to_string(aux.size());
    ev.statusType = "normal";
    ev.statusText = "Starting reverse";
    emitter.emit(ev);

    int transferCount = 0;
    while (!original.isEmpty()) {
        int val = 0;
        original.peek(val);

        // Line 2: while (!original.isEmpty())
        ev = TraceEvent();
        ev.eventType = "condition";
        ev.title = "while (!original.isEmpty()): True (Size = " + std::to_string(original.size()) + ")";
        ev.description = "Original stack is not empty. Preparing to transfer top element (" + std::to_string(val) + ") to auxiliary stack.";
        ev.sourceLine = 2;
        ev.stackState = original.getData();
        ev.auxStackState = aux.getData();
        ev.capacity = original.getCapacity();
        ev.topIndex = original.size() - 1;
        ev.activeIndices = {original.size() - 1};
        ev.highlightedItems[original.size() - 1] = "peek";
        ev.variables["topVal"] = std::to_string(val);
        ev.variables["originalSize"] = std::to_string(original.size());
        ev.variables["auxSize"] = std::to_string(aux.size());
        ev.statusType = "normal";
        ev.statusText = "Peeking " + std::to_string(val);
        emitter.emit(ev);

        // Line 4: original.peek(val)
        ev = TraceEvent();
        ev.eventType = "peek";
        ev.title = "original.peek(val); -> val = " + std::to_string(val);
        ev.description = "Read top value " + std::to_string(val) + " from original stack.";
        ev.sourceLine = 4;
        ev.stackState = original.getData();
        ev.auxStackState = aux.getData();
        ev.capacity = original.getCapacity();
        ev.topIndex = original.size() - 1;
        ev.activeIndices = {original.size() - 1};
        ev.highlightedItems[original.size() - 1] = "peek";
        ev.variables["val"] = std::to_string(val);
        ev.statusType = "normal";
        ev.statusText = "Identified " + std::to_string(val);
        emitter.emit(ev);

        // Line 5: original.pop()
        original.pop();
        ev = TraceEvent();
        ev.eventType = "pop";
        ev.title = "original.pop(); (Popped " + std::to_string(val) + ")";
        ev.description = "Popped " + std::to_string(val) + " from original stack.";
        ev.sourceLine = 5;
        ev.stackState = original.getData();
        ev.auxStackState = aux.getData();
        ev.capacity = original.getCapacity();
        ev.topIndex = original.size() > 0 ? original.size() - 1 : -1;
        ev.variables["poppedVal"] = std::to_string(val);
        ev.variables["originalSize"] = std::to_string(original.size());
        ev.statusType = "normal";
        ev.statusText = "Popped " + std::to_string(val);
        emitter.emit(ev);

        // Line 6: aux.push(val)
        aux.push(val);
        transferCount++;
        ev = TraceEvent();
        ev.eventType = "push";
        ev.title = "aux.push(" + std::to_string(val) + ");";
        ev.description = "Pushed " + std::to_string(val) + " onto auxiliary stack. (Transfer #" + std::to_string(transferCount) + ").";
        ev.sourceLine = 6;
        ev.stackState = original.getData();
        ev.auxStackState = aux.getData();
        ev.capacity = original.getCapacity();
        ev.topIndex = original.size() > 0 ? original.size() - 1 : -1;
        ev.variables["transferredVal"] = std::to_string(val);
        ev.variables["auxSize"] = std::to_string(aux.size());
        ev.statusType = "success";
        ev.statusText = "Transferred " + std::to_string(val);
        emitter.emit(ev);
    }

    // Line 7: Loop finished
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Stack Reversal Complete!";
    ev.description = "All elements transferred. Auxiliary stack now contains elements in exact reversed order of original stack.";
    ev.sourceLine = 7;
    ev.stackState = original.getData();
    ev.auxStackState = aux.getData();
    ev.capacity = original.getCapacity();
    ev.topIndex = -1;
    ev.variables["originalSize"] = "0 (Empty)";
    ev.variables["reversedAuxSize"] = std::to_string(aux.size());
    ev.statusType = "success";
    ev.statusText = "Reversal Complete";
    ev.isCompleted = true;
    emitter.emit(ev);
}

// 10. Balanced Parentheses
bool traceBalancedParentheses(const std::string& expr, TraceEmitter& emitter) {
    std::vector<std::string> s;
    TraceEvent ev;

    // Line 1: Start
    ev.eventType = "start";
    ev.title = "isBalanced(\"" + expr + "\")";
    ev.description = "Evaluating bracket balancing for input string. Non-bracket characters are ignored.";
    ev.sourceLine = 1;
    ev.expression = expr;
    ev.charIndex = -1;
    ev.charStackState = s;
    ev.variables["expression"] = expr;
    ev.variables["stackSize"] = "0";
    ev.statusType = "normal";
    ev.statusText = "Starting evaluation";
    emitter.emit(ev);

    // Line 2: vector<char> s initialized
    ev = TraceEvent();
    ev.eventType = "init";
    ev.title = "vector<char> s; (Empty Bracket Stack)";
    ev.description = "Character stack initialized to store opening brackets awaiting matching closing brackets.";
    ev.sourceLine = 2;
    ev.expression = expr;
    ev.charIndex = -1;
    ev.charStackState = s;
    ev.variables["stackSize"] = "0";
    ev.statusType = "normal";
    ev.statusText = "Bracket stack ready";
    emitter.emit(ev);

    for (size_t i = 0; i < expr.length(); ++i) {
        char ch = expr[i];
        std::string chStr(1, ch);

        // Line 3-4: char ch = expr[i]
        ev = TraceEvent();
        ev.eventType = "read";
        ev.title = "Index " + std::to_string(i) + ": Inspect '" + chStr + "'";
        ev.description = "Reading character at index " + std::to_string(i) + ": '" + chStr + "'.";
        ev.sourceLine = 4;
        ev.expression = expr;
        ev.charIndex = static_cast<int>(i);
        ev.currentChar = chStr;
        ev.charStackState = s;
        ev.variables["i"] = std::to_string(i);
        ev.variables["ch"] = "'" + chStr + "'";
        ev.variables["stackSize"] = std::to_string(s.size());
        ev.statusType = "normal";
        ev.statusText = "Reading char '" + chStr + "'";
        emitter.emit(ev);

        if (ch == '(' || ch == '{' || ch == '[') {
            // Line 6: s.push_back(ch)
            s.push_back(chStr);
            ev = TraceEvent();
            ev.eventType = "push";
            ev.title = "Push Opening Bracket '" + chStr + "'";
            ev.description = "'" + chStr + "' is an opening bracket. Pushed onto bracket stack.";
            ev.sourceLine = 6;
            ev.expression = expr;
            ev.charIndex = static_cast<int>(i);
            ev.currentChar = chStr;
            ev.charStackState = s;
            ev.variables["pushed"] = "'" + chStr + "'";
            ev.variables["stackTop"] = "'" + chStr + "'";
            ev.variables["stackSize"] = std::to_string(s.size());
            ev.statusType = "success";
            ev.statusText = "Pushed '" + chStr + "'";
            emitter.emit(ev);
        } else if (ch == ')' || ch == '}' || ch == ']') {
            // Line 8: Check if (s.empty())
            if (s.empty()) {
                // Line 8: Return false (Underflow / Unmatched closing bracket)
                ev = TraceEvent();
                ev.eventType = "complete";
                ev.title = "Unmatched Closing Bracket '" + chStr + "'!";
                ev.description = "Encountered closing bracket '" + chStr + "' at index " + std::to_string(i) + " but stack is empty. Expression is unbalanced.";
                ev.sourceLine = 8;
                ev.expression = expr;
                ev.charIndex = static_cast<int>(i);
                ev.currentChar = chStr;
                ev.charStackState = s;
                ev.variables["result"] = "false (Unmatched closing)";
                ev.statusType = "mismatch";
                ev.statusText = "Unbalanced: Extra '" + chStr + "'";
                ev.isCompleted = true;
                emitter.emit(ev);
                return false;
            }

            // Line 9-10: char top = s.back(); s.pop_back();
            std::string topBracket = s.back();
            s.pop_back();

            ev = TraceEvent();
            ev.eventType = "pop";
            ev.title = "Pop Stack Top '" + topBracket + "' to Match '" + chStr + "'";
            ev.description = "Closing bracket '" + chStr + "' found. Popped corresponding top opening bracket '" + topBracket + "' for matching.";
            ev.sourceLine = 10;
            ev.expression = expr;
            ev.charIndex = static_cast<int>(i);
            ev.currentChar = chStr;
            ev.charStackState = s;
            ev.variables["poppedTop"] = "'" + topBracket + "'";
            ev.variables["closingChar"] = "'" + chStr + "'";
            ev.statusType = "normal";
            ev.statusText = "Comparing with '" + topBracket + "'";
            emitter.emit(ev);

            // Line 11-14: Check match
            bool match = (ch == ')' && topBracket == "(") ||
                         (ch == '}' && topBracket == "{") ||
                         (ch == ']' && topBracket == "[");

            if (!match) {
                // Line 14: Return false (Mismatched bracket types)
                ev = TraceEvent();
                ev.eventType = "complete";
                ev.title = "Bracket Mismatch: '" + topBracket + "' vs '" + chStr + "'!";
                ev.description = "Mismatched bracket types at index " + std::to_string(i) + ": Opening bracket was '" + topBracket + "' but closing was '" + chStr + "'.";
                ev.sourceLine = 14;
                ev.expression = expr;
                ev.charIndex = static_cast<int>(i);
                ev.currentChar = chStr;
                ev.charStackState = s;
                ev.variables["expected"] = (topBracket == "(" ? "')'" : (topBracket == "{" ? "'}'" : "']'"));
                ev.variables["found"] = "'" + chStr + "'";
                ev.variables["result"] = "false (Mismatch)";
                ev.statusType = "mismatch";
                ev.statusText = "Mismatch: '" + topBracket + "' and '" + chStr + "'";
                ev.isCompleted = true;
                emitter.emit(ev);
                return false;
            }

            // Successfully matched pair
            ev = TraceEvent();
            ev.eventType = "compare";
            ev.title = "Matched Pair: '" + topBracket + "' and '" + chStr + "' ✓";
            ev.description = "Bracket pair '" + topBracket + chStr + "' matched successfully.";
            ev.sourceLine = 16;
            ev.expression = expr;
            ev.charIndex = static_cast<int>(i);
            ev.currentChar = chStr;
            ev.charStackState = s;
            ev.variables["matchedPair"] = topBracket + chStr;
            ev.statusType = "success";
            ev.statusText = "Pair matched ✓";
            emitter.emit(ev);
        } else {
            // Irrelevant character ignored
            ev = TraceEvent();
            ev.eventType = "read";
            ev.title = "Skip Non-Bracket Character '" + chStr + "'";
            ev.description = "'" + chStr + "' is not a parenthesis or bracket; ignored in evaluation.";
            ev.sourceLine = 16;
            ev.expression = expr;
            ev.charIndex = static_cast<int>(i);
            ev.currentChar = chStr;
            ev.charStackState = s;
            ev.statusType = "normal";
            ev.statusText = "Skipped non-bracket";
            emitter.emit(ev);
        }
    }

    // Line 18: return s.empty();
    bool balanced = s.empty();
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.sourceLine = 18;
    ev.expression = expr;
    ev.charIndex = static_cast<int>(expr.length());
    ev.charStackState = s;

    if (balanced) {
        ev.title = "Expression is Balanced! (return true;)";
        ev.description = "All brackets opened have been closed in the correct order. Stack is completely empty.";
        ev.variables["result"] = "true (Balanced)";
        ev.statusType = "success";
        ev.statusText = "Balanced ✓";
    } else {
        ev.title = "Unmatched Opening Brackets! (return false;)";
        ev.description = "Expression ended but stack still contains " + std::to_string(s.size()) + " unclosed opening bracket(s).";
        ev.variables["remainingUnclosed"] = std::to_string(s.size());
        ev.variables["result"] = "false (Unmatched open)";
        ev.statusType = "mismatch";
        ev.statusText = "Unbalanced: Unclosed brackets";
    }
    ev.isCompleted = true;
    emitter.emit(ev);
    return balanced;
}

// Canonical C++ source code getter
std::string getStackCppSourceCode(const std::string& operationId) {
    if (operationId == "stack-intro") {
        return "#include <iostream>\n"
               "#include <vector>\n"
               "using namespace std;\n\n"
               "int main() {\n"
               "    Stack s(5);            // 6: Initialize bounded Stack (capacity 5)\n"
               "    s.push(10);            // 7: Push first element (bottom)\n"
               "    s.push(20);            // 8: Push second element\n"
               "    s.push(30);            // 9: Push third element (current top)\n"
               "    int topVal = 0;        // 10: Variable to store top element\n"
               "    s.peek(topVal);        // 11: Inspect top element (returns 30)\n"
               "    s.pop();               // 12: Pop top element (30 removed first)\n"
               "    return 0;              // 13: LIFO: Last-In, First-Out demonstrated\n"
               "}";
    }
    if (operationId == "push") {
        return "bool Stack::push(int value) {\n"
               "    if (isFull()) {\n"
               "        cout << \"Stack Overflow!\" << endl;\n"
               "        return false;\n"
               "    }\n"
               "    data.push_back(value);\n"
               "    int newTop = static_cast<int>(data.size()) - 1;\n"
               "    return true;\n"
               "}";
    }
    if (operationId == "pop") {
        return "bool Stack::pop() {\n"
               "    if (isEmpty()) {\n"
               "        cout << \"Stack Underflow!\" << endl;\n"
               "        return false;\n"
               "    }\n"
               "    int poppedValue = data.back();\n"
               "    data.pop_back();\n"
               "    return true;\n"
               "}";
    }
    if (operationId == "peek") {
        return "bool Stack::peek(int& result) const {\n"
               "    if (isEmpty()) {\n"
               "        cout << \"Stack is Empty!\" << endl;\n"
               "        return false;\n"
               "    }\n"
               "    result = data.back();\n"
               "    return true;\n"
               "}";
    }
    if (operationId == "is-empty") {
        return "bool Stack::isEmpty() const {\n"
               "    bool result = data.empty();\n"
               "    return result;\n"
               "}";
    }
    if (operationId == "is-full") {
        return "bool Stack::isFull() const {\n"
               "    bool result = (static_cast<int>(data.size()) >= capacity);\n"
               "    return result;\n"
               "}";
    }
    if (operationId == "stack-size") {
        return "int Stack::size() const {\n"
               "    int currentSize = static_cast<int>(data.size());\n"
               "    return currentSize;\n"
               "}";
    }
    if (operationId == "search") {
        return "int searchStack(const vector<int>& data, int target) {\n"
               "    for (int i = static_cast<int>(data.size()) - 1; i >= 0; --i) {\n"
               "        if (data[i] == target) {\n"
               "            return i; // Found at index i (measured from bottom)\n"
               "        }\n"
               "    }\n"
               "    return -1; // Target not found\n"
               "}";
    }
    if (operationId == "reverse") {
        return "void reverseStack(Stack& original, Stack& aux) {\n"
               "    while (!original.isEmpty()) {\n"
               "        int val = 0;\n"
               "        original.peek(val);\n"
               "        original.pop();\n"
               "        aux.push(val);\n"
               "    }\n"
               "}";
    }
    if (operationId == "balanced-parentheses") {
        return "bool isBalanced(const string& expr) {\n"
               "    vector<char> s;\n"
               "    for (size_t i = 0; i < expr.length(); ++i) {\n"
               "        char ch = expr[i];\n"
               "        if (ch == '(' || ch == '{' || ch == '[') {\n"
               "            s.push_back(ch);\n"
               "        } else if (ch == ')' || ch == '}' || ch == ']') {\n"
               "            if (s.empty()) return false;\n"
               "            char top = s.back();\n"
               "            s.pop_back();\n"
               "            if ((ch == ')' && top != '(') ||\n"
               "                (ch == '}' && top != '{') ||\n"
               "                (ch == ']' && top != '[')) {\n"
               "                return false;\n"
               "            }\n"
               "        }\n"
               "    }\n"
               "    return s.empty();\n"
               "}";
    }
    return "// Operation not found";
}
