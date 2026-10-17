#ifndef LINEAR_STRUCTURE_ALGORITHMS_HPP
#define LINEAR_STRUCTURE_ALGORITHMS_HPP

#include "trace_event.hpp"
#include <algorithm>
#include <string>
#include <vector>

class CircularBuffer {
public:
    explicit CircularBuffer(int capacity)
        : slots(static_cast<size_t>(capacity), 0),
          occupied(static_cast<size_t>(capacity), false),
          front(0), count(0) {}

    bool isEmpty() const { return count == 0; }
    bool isFull() const { return count == static_cast<int>(slots.size()); }
    int size() const { return count; }
    int capacity() const { return static_cast<int>(slots.size()); }
    int frontIndex() const { return front; }
    int rearIndex() const { return count == 0 ? -1 : (front + count - 1) % capacity(); }
    int nextInsertionIndex() const { return (front + count) % capacity(); }
    int peek() const { return slots[static_cast<size_t>(front)]; }
    int rear() const { return slots[static_cast<size_t>(rearIndex())]; }
    void writeAt(int index, int value) {
        slots[static_cast<size_t>(index)] = value;
        occupied[static_cast<size_t>(index)] = true;
    }
    void incrementCount() { ++count; }
    void clearFrontSlot() { occupied[static_cast<size_t>(front)] = false; }
    void advanceFrontAndDecrement() {
        front = (front + 1) % capacity();
        --count;
        if (count == 0) front = 0;
    }
    const std::vector<int>& storage() const { return slots; }
    const std::vector<bool>& occupiedSlots() const { return occupied; }

    bool enqueue(int value) {
        if (isFull()) return false;
        const int index = nextInsertionIndex();
        writeAt(index, value);
        incrementCount();
        return true;
    }

    bool dequeue(int& result) {
        if (isEmpty()) return false;
        result = slots[static_cast<size_t>(front)];
        clearFrontSlot();
        advanceFrontAndDecrement();
        return true;
    }

    void clear() {
        clearOccupiedSlots();
        resetFront();
        resetCount();
    }
    void clearOccupiedSlots() {
        std::fill(occupied.begin(), occupied.end(), false);
    }
    void resetFront() { front = 0; }
    void resetCount() { count = 0; }

    std::vector<int> logicalOrder() const {
        std::vector<int> result;
        for (int i = 0; i < count; ++i) {
            result.push_back(slots[static_cast<size_t>((front + i) % capacity())]);
        }
        return result;
    }

private:
    std::vector<int> slots;
    std::vector<bool> occupied;
    int front;
    int count;
};

class CircularDeque {
public:
    explicit CircularDeque(int capacity)
        : slots(static_cast<size_t>(capacity), 0),
          occupied(static_cast<size_t>(capacity), false),
          front(0), count(0) {}

    bool isEmpty() const { return count == 0; }
    bool isFull() const { return count == static_cast<int>(slots.size()); }
    int size() const { return count; }
    int capacity() const { return static_cast<int>(slots.size()); }
    int frontIndex() const { return count == 0 ? -1 : front; }
    int backIndex() const { return count == 0 ? -1 : (front + count - 1) % capacity(); }
    int peekFront() const { return slots[static_cast<size_t>(front)]; }
    int peekBack() const { return slots[static_cast<size_t>(backIndex())]; }
    const std::vector<int>& storage() const { return slots; }
    const std::vector<bool>& occupiedSlots() const { return occupied; }
    int nextBackIndex() const { return (front + count) % capacity(); }
    int previousFrontIndex() const { return (front - 1 + capacity()) % capacity(); }
    void moveFrontBackward() { front = previousFrontIndex(); }
    void writeAt(int index, int value) {
        slots[static_cast<size_t>(index)] = value;
        occupied[static_cast<size_t>(index)] = true;
    }
    void incrementCount() { ++count; }
    void clearSlot(int index) { occupied[static_cast<size_t>(index)] = false; }
    void advanceFront() { front = (front + 1) % capacity(); }
    void decrementCount() {
        --count;
        if (count == 0) front = 0;
    }

    bool pushBack(int value) {
        if (isFull()) return false;
        const int index = nextBackIndex();
        writeAt(index, value);
        incrementCount();
        return true;
    }

    bool pushFront(int value) {
        if (isFull()) return false;
        moveFrontBackward();
        writeAt(front, value);
        incrementCount();
        return true;
    }

    bool popFront(int& result) {
        if (isEmpty()) return false;
        result = slots[static_cast<size_t>(front)];
        clearSlot(front);
        advanceFront();
        decrementCount();
        return true;
    }

    bool popBack(int& result) {
        if (isEmpty()) return false;
        const int index = backIndex();
        result = slots[static_cast<size_t>(index)];
        clearSlot(index);
        decrementCount();
        return true;
    }

    std::vector<int> logicalOrder() const {
        std::vector<int> result;
        for (int i = 0; i < count; ++i) {
            result.push_back(slots[static_cast<size_t>((front + i) % capacity())]);
        }
        return result;
    }

private:
    std::vector<int> slots;
    std::vector<bool> occupied;
    int front;
    int count;
};

inline TraceEvent makeStructureEvent(
    const std::string& type, int line, const std::string& title,
    const std::string& description, const std::vector<int>& values,
    const std::vector<int>& active = {}, const std::string& status = "normal") {
    TraceEvent event;
    event.structureType = type;
    event.sourceLine = line;
    event.title = title;
    event.description = description;
    event.arrayState = values;
    event.activeIndices = active;
    event.statusText = description;
    event.statusType = status;
    event.isCompleted = title == "Operation complete" || status == "error";
    return event;
}

inline void emitBufferSnapshot(
    TraceEmitter& emitter, const std::string& type, const std::string& title,
    const std::string& description, int line, const CircularBuffer& queue,
    const std::string& status = "normal", const std::string& result = "",
    int activeSlot = -1) {
    TraceEvent event = makeStructureEvent(type, line, title, description, queue.logicalOrder(), {}, status);
    event.structureStorage = queue.storage();
    event.occupiedSlots = queue.occupiedSlots();
    event.logicalOrder = queue.logicalOrder();
    event.frontIndex = queue.frontIndex();
    event.rearIndex = queue.rearIndex();
    event.elementCount = queue.size();
    event.capacity = queue.capacity();
    event.pointers.push_back(PointerInfo{"front", queue.frontIndex(), "cyan"});
    event.pointers.push_back(PointerInfo{"rear", queue.rearIndex(), "amber"});
    event.variables["size"] = std::to_string(queue.size());
    event.variables["capacity"] = std::to_string(queue.capacity());
    event.variables["nextInsertionIndex"] = std::to_string(queue.nextInsertionIndex());
    if (activeSlot >= 0) event.activeIndices.push_back(activeSlot);
    if (!result.empty()) event.variables["result"] = result;
    emitter.emit(event);
}

inline void emitDequeSnapshot(
    TraceEmitter& emitter, const std::string& title, const std::string& description,
    int line, const CircularDeque& deque, const std::string& status = "normal",
    const std::string& result = "", int activeSlot = -1) {
    TraceEvent event = makeStructureEvent("deque", line, title, description, deque.logicalOrder(), {}, status);
    event.structureStorage = deque.storage();
    event.occupiedSlots = deque.occupiedSlots();
    event.logicalOrder = deque.logicalOrder();
    event.frontIndex = deque.frontIndex();
    event.rearIndex = deque.backIndex();
    event.dequeFrontIndex = deque.frontIndex();
    event.dequeBackIndex = deque.backIndex();
    event.elementCount = deque.size();
    event.capacity = deque.capacity();
    event.pointers.push_back(PointerInfo{"front", deque.frontIndex(), "cyan"});
    event.pointers.push_back(PointerInfo{"back", deque.backIndex(), "amber"});
    event.variables["size"] = std::to_string(deque.size());
    event.variables["capacity"] = std::to_string(deque.capacity());
    if (activeSlot >= 0) event.activeIndices.push_back(activeSlot);
    if (!result.empty()) event.variables["result"] = result;
    emitter.emit(event);
}

inline void traceQueueOperation(
    const std::string& operation, const std::vector<int>& initial, int capacity,
    int value, TraceEmitter& emitter) {
    CircularBuffer queue(capacity);
    for (int item : initial) queue.enqueue(item);
    if (operation == "queue-create" || operation == "queue-demo") queue.clear();
    emitBufferSnapshot(emitter, "queue", "Initial state",
        "Bounded circular queue: front points to the first item and rear to the last item.", 1, queue);

    if (operation == "queue-intro" || operation == "queue-create") {
        emitBufferSnapshot(emitter, "queue", "Operation complete",
            operation == "queue-create" ? "The queue is initialized empty." : "Queue uses a fixed-capacity circular buffer; FIFO removes from the front.", 1, queue);
        return;
    }
    if (operation == "queue-demo") {
        emitBufferSnapshot(emitter, "queue", "Circular queue demonstration",
            "Start empty. Circular indices let enqueues reuse freed slots without shifting existing values.", 22, queue);
        for (int item = 10; item < 10 + capacity * 10; item += 10) {
            const int insertionIndex = queue.nextInsertionIndex();
            emitBufferSnapshot(emitter, "queue", "Calculate insertion index",
                "Insert " + std::to_string(item) + " at physical slot " + std::to_string(insertionIndex) + ".", 3, queue);
            queue.enqueue(item);
            emitBufferSnapshot(emitter, "queue", "Enqueue value",
                "Stored " + std::to_string(item) + "; size is now " + std::to_string(queue.size()) + ".", 6, queue);
        }
        int removed = 0;
        for (int i = 0; i < std::min(2, capacity); ++i) {
            queue.dequeue(removed);
            emitBufferSnapshot(emitter, "queue", "Dequeue front",
                "Removed " + std::to_string(removed) + " and advanced front circularly.", 14, queue);
        }
        for (int item = 90; queue.size() < capacity; item += 10) {
            const int insertionIndex = queue.nextInsertionIndex();
            queue.enqueue(item);
            emitBufferSnapshot(emitter, "queue", "Wraparound enqueue",
                "Reused physical slot " + std::to_string(insertionIndex) + " for " + std::to_string(item) + ".", 6, queue);
        }
        emitBufferSnapshot(emitter, "queue", "Full queue",
            "All capacity slots are occupied after wraparound.", 18, queue, "success");
        if (!queue.enqueue(999)) {
            emitBufferSnapshot(emitter, "queue", "Enqueue rejected",
                "Attempted enqueue while full; the C++ method rejects it without changing state.", 2, queue, "overflow");
        }
        while (queue.dequeue(removed)) {
            emitBufferSnapshot(emitter, "queue", "Drain queue",
                "Removed " + std::to_string(removed) + " in FIFO order.", 14, queue);
        }
        if (!queue.dequeue(removed)) {
            emitBufferSnapshot(emitter, "queue", "Dequeue rejected",
                "Attempted dequeue while empty; the C++ method rejects it.", 10, queue, "underflow");
        }
        emitBufferSnapshot(emitter, "queue", "Operation complete",
            "The demonstration covered initial empty, full, wraparound, full rejection, FIFO draining, and empty rejection.", 23, queue, "success");
        return;
    }

    if (operation == "queue-enqueue" || operation == "queue-enqueue-full") {
        emitBufferSnapshot(emitter, "queue", "Begin enqueue", "Attempt to insert " + std::to_string(value) + " at the next circular position.", 1, queue);
        emitBufferSnapshot(emitter, "queue", "Check full", "Compare the element count with the fixed capacity.", 2, queue);
        if (queue.isFull()) {
            emitBufferSnapshot(emitter, "queue", "Enqueue rejected", "Queue is full; storage and pointers remain unchanged.", 2, queue, "overflow");
            return;
        }
        const int index = queue.nextInsertionIndex();
        emitBufferSnapshot(emitter, "queue", "Calculate insertion index", "next = (front + size) % capacity = " + std::to_string(index) + ".", 3, queue, "normal", "", index);
        queue.writeAt(index, value);
        emitBufferSnapshot(emitter, "queue", "Write value", "Write the value into physical slot " + std::to_string(index) + ".", 4, queue, "normal", "", index);
        queue.incrementCount();
        emitBufferSnapshot(emitter, "queue", "Update size", "Increase the element count.", 5, queue, "normal", "", index);
        emitBufferSnapshot(emitter, "queue", "Operation complete", "Enqueue completed; logical order is front to rear.", 6, queue, "success");
        return;
    }
    if (operation == "queue-dequeue" || operation == "queue-dequeue-empty") {
        emitBufferSnapshot(emitter, "queue", "Begin dequeue", "Attempt to remove the logical front element.", 1, queue);
        emitBufferSnapshot(emitter, "queue", "Check empty", "Test whether the element count is zero.", 2, queue);
        if (queue.isEmpty()) {
            emitBufferSnapshot(emitter, "queue", "Dequeue rejected", "Queue is empty; no slot or pointer changes.", 3, queue, "underflow");
            return;
        }
        const int removedIndex = queue.frontIndex();
        const int removed = queue.peek();
        emitBufferSnapshot(emitter, "queue", "Read front value", "Read value " + std::to_string(removed) + " before removing it.", 4, queue, "normal", std::to_string(removed), removedIndex);
        queue.clearFrontSlot();
        emitBufferSnapshot(emitter, "queue", "Remove front slot", "Mark the old front slot unoccupied.", 5, queue, "normal", std::to_string(removed), removedIndex);
        queue.advanceFrontAndDecrement();
        emitBufferSnapshot(emitter, "queue", "Advance front", "Advance front circularly and decrement size.", 6, queue, "normal", std::to_string(removed), removedIndex);
        emitBufferSnapshot(emitter, "queue", "Operation complete", "Dequeued " + std::to_string(removed) + ".", 7, queue, "success", std::to_string(removed));
        return;
    }
    if (operation == "queue-peek" || operation == "queue-rear") {
        const bool rear = operation == "queue-rear";
        emitBufferSnapshot(emitter, "queue", rear ? "Inspect rear" : "Inspect front", "Read without removing the logical " + std::string(rear ? "rear" : "front") + ".", 1, queue);
        if (queue.isEmpty()) {
            emitBufferSnapshot(emitter, "queue", "Inspection unavailable", "Queue is empty; there is no value to inspect.", 2, queue, "underflow");
        } else {
            const int result = rear ? queue.rear() : queue.peek();
            emitBufferSnapshot(emitter, "queue", "Operation complete", "The inspected value is " + std::to_string(result) + ".", rear ? 4 : 3, queue, "success", std::to_string(result));
        }
        return;
    }
    if (operation == "queue-is-empty" || operation == "queue-is-full" || operation == "queue-size") {
        const bool empty = queue.isEmpty();
        const bool full = queue.isFull();
        const std::string result = operation == "queue-is-empty" ? (empty ? "true" : "false") :
            operation == "queue-is-full" ? (full ? "true" : "false") : std::to_string(queue.size());
        emitBufferSnapshot(emitter, "queue", "Evaluate query", "The C++ queue method returns " + result + ".", 1, queue, "success", result);
        emitBufferSnapshot(emitter, "queue", "Operation complete", "Query result: " + result + ".", 2, queue, "success", result);
        return;
    }
    if (operation == "queue-clear") {
        emitBufferSnapshot(emitter, "queue", "Begin clear", "Clear every occupied marker, then reset front and count.", 1, queue);
        queue.clearOccupiedSlots();
        emitBufferSnapshot(emitter, "queue", "Clear occupancy flags", "Mark every physical slot unoccupied.", 2, queue);
        queue.resetFront();
        emitBufferSnapshot(emitter, "queue", "Reset front", "Set front to index zero.", 3, queue);
        queue.resetCount();
        emitBufferSnapshot(emitter, "queue", "Reset size", "Set the current element count to zero.", 4, queue);
        emitBufferSnapshot(emitter, "queue", "Operation complete", "Queue is empty after clear; clear is O(capacity) because occupied slots are marked free.", 5, queue, "success");
    }
}

inline void traceDequeOperation(
    const std::string& operation, const std::vector<int>& initial, int capacity,
    int value, TraceEmitter& emitter) {
    CircularDeque deque(capacity);
    for (int item : initial) deque.pushBack(item);
    emitDequeSnapshot(emitter, "Initial state", "Circular deque stores items from front to back.", 1, deque);
    if (operation == "deque-intro") {
        emitDequeSnapshot(emitter, "Operation complete", "A deque supports constant-time insertion and removal at both ends.", 1, deque);
        return;
    }
    emitDequeSnapshot(emitter, "Check boundary", "Check whether the requested operation is valid for the current size and capacity.", 2, deque);
    if (operation == "deque-push-front" || operation == "deque-push-back") {
        if (deque.isFull()) {
            emitDequeSnapshot(emitter, "Insertion rejected", "Deque is full; no storage changes were made.", 2, deque, "overflow");
            return;
        }
        if (operation == "deque-push-front") {
            const int index = deque.previousFrontIndex();
            deque.moveFrontBackward();
            emitDequeSnapshot(emitter, "Move front backward", "front = (front - 1 + capacity) % capacity = " + std::to_string(index) + ".", 3, deque, "normal", "", index);
            deque.writeAt(index, value);
            emitDequeSnapshot(emitter, "Write front slot", "Write " + std::to_string(value) + " into the new front slot.", 4, deque, "normal", "", index);
            deque.incrementCount();
            emitDequeSnapshot(emitter, "Update size", "Increase the element count.", 5, deque, "normal", "", index);
        } else {
            const int index = deque.nextBackIndex();
            emitDequeSnapshot(emitter, "Calculate back slot", "back = (front + size) % capacity = " + std::to_string(index) + ".", 3, deque, "normal", "", index);
            deque.writeAt(index, value);
            emitDequeSnapshot(emitter, "Write back slot", "Write " + std::to_string(value) + " into the next back slot.", 4, deque, "normal", "", index);
            deque.incrementCount();
            emitDequeSnapshot(emitter, "Update size", "Increase the element count.", 5, deque, "normal", "", index);
        }
        emitDequeSnapshot(emitter, "Operation complete", "Insertion completed and size increased by one.", 6, deque, "success");
        return;
    }
    if (operation == "deque-pop-front" || operation == "deque-pop-back") {
        if (deque.isEmpty()) {
            emitDequeSnapshot(emitter, "Removal rejected", "Deque is empty; no pointers or slots changed.", 2, deque, "underflow");
            return;
        }
        const bool fromFront = operation == "deque-pop-front";
        const int index = fromFront ? deque.frontIndex() : deque.backIndex();
        const int removed = fromFront ? deque.peekFront() : deque.peekBack();
        emitDequeSnapshot(emitter, "Read end value", "Read " + std::to_string(removed) + " from the selected end.", fromFront ? 3 : 4, deque, "normal", std::to_string(removed), index);
        deque.clearSlot(index);
        emitDequeSnapshot(emitter, "Clear occupied slot", "Mark physical slot " + std::to_string(index) + " unoccupied.", fromFront ? 4 : 5, deque, "normal", std::to_string(removed), index);
        if (fromFront) {
            deque.advanceFront();
            emitDequeSnapshot(emitter, "Advance front", "Move front to the next circular slot.", 5, deque, "normal", std::to_string(removed), index);
        }
        deque.decrementCount();
        emitDequeSnapshot(emitter, "Update size", "Decrease size; reset front to zero when the last element was removed.", 6, deque, "normal", std::to_string(removed), index);
        emitDequeSnapshot(emitter, "Operation complete", "Removed value " + std::to_string(removed) + " from the selected end.", 7, deque, "success", std::to_string(removed));
        return;
    }
    if (operation == "deque-peek-front" || operation == "deque-peek-back") {
        if (deque.isEmpty()) {
            emitDequeSnapshot(emitter, "Inspection unavailable", "Deque is empty.", 2, deque, "underflow");
        } else {
            const int result = operation == "deque-peek-front" ? deque.peekFront() : deque.peekBack();
            emitDequeSnapshot(emitter, "Operation complete", "Inspected value: " + std::to_string(result) + ".", 3, deque, "success", std::to_string(result));
        }
        return;
    }
    const std::string result = operation == "deque-is-empty" ? (deque.isEmpty() ? "true" : "false") :
        operation == "deque-is-full" ? (deque.isFull() ? "true" : "false") : std::to_string(deque.size());
    emitDequeSnapshot(emitter, "Operation complete", "C++ deque query result: " + result + ".", 2, deque, "success", result);
}

struct ListNode {
    int id;
    int data;
    ListNode* prev;
    ListNode* next;
    ListNode(int nodeId, int value) : id(nodeId), data(value), prev(nullptr), next(nullptr) {}
};

class TracedLinkedList {
public:
    explicit TracedLinkedList(const std::string& listKind)
        : head(nullptr), tail(nullptr), count(0), nextId(1), kind(listKind) {}
    ~TracedLinkedList() { clear(); }
    TracedLinkedList(const TracedLinkedList&) = delete;
    TracedLinkedList& operator=(const TracedLinkedList&) = delete;

    bool circular() const { return kind == "circular"; }
    bool doubly() const { return kind == "doubly"; }
    int size() const { return count; }
    ListNode* headNode() const { return head; }
    ListNode* tailNode() const { return tail; }
    ListNode* at(int index) const {
        if (index < 0 || index >= count) return nullptr;
        ListNode* current = head;
        for (int i = 0; i < index; ++i) current = current->next;
        return current;
    }
    void appendInitial(int value) {
        ListNode* node = new ListNode(nextId++, value);
        liveNodes.push_back(node);
        if (!head) head = tail = node;
        else {
            tail->next = node;
            if (doubly()) node->prev = tail;
            tail = node;
        }
        ++count;
        relinkCircular();
    }
    ListNode* allocate(int value) {
        ListNode* node = new ListNode(nextId++, value);
        liveNodes.push_back(node);
        return node;
    }
    void relinkCircular() { if (circular() && tail) tail->next = head; }
    void clear() {
        if (circular() && tail) tail->next = nullptr;
        ListNode* current = head;
        while (current) {
            ListNode* next = current->next;
            delete current;
            current = next;
        }
        head = tail = nullptr;
        count = 0;
        liveNodes.clear();
    }
    std::vector<int> values() const {
        std::vector<int> result;
        ListNode* current = head;
        for (int i = 0; i < count && current; ++i, current = current->next) result.push_back(current->data);
        return result;
    }
    std::vector<LinkedNodeSnapshot> snapshots() const {
        std::vector<LinkedNodeSnapshot> result;
        std::vector<int> included;
        ListNode* current = head;
        for (int i = 0; i < count && current; ++i) {
            if (std::find(included.begin(), included.end(), current->id) != included.end()) break;
            result.push_back(LinkedNodeSnapshot(current->id, current->data,
                current->next ? current->next->id : -1,
                current->prev ? current->prev->id : -1));
            included.push_back(current->id);
            current = current->next;
        }
        for (ListNode* node : liveNodes) {
            if (std::find(included.begin(), included.end(), node->id) == included.end()) {
                result.push_back(LinkedNodeSnapshot(node->id, node->data,
                    node->next ? node->next->id : -1,
                    node->prev ? node->prev->id : -1));
            }
        }
        return result;
    }
    ListNode* head;
    ListNode* tail;
    int count;
    int nextId;
    std::string kind;
    std::vector<ListNode*> liveNodes;

private:
    void relinkCircularIfNeeded() { relinkCircular(); }
};

inline void emitListSnapshot(TraceEmitter& emitter, TracedLinkedList& list,
    const std::string& title, const std::string& description, int line,
    int activeId = -1, const std::string& status = "normal", const std::string& result = "") {
    TraceEvent event = makeStructureEvent("linked-" + list.kind, line, title, description, list.values(), {}, status);
    event.linkedNodes = list.snapshots();
    event.elementCount = list.size();
    event.activeNodeId = activeId;
    if (list.head) event.pointers.push_back(PointerInfo{"head", list.head->id, "cyan"});
    else event.pointers.push_back(PointerInfo{"head", -1, "cyan"});
    if (list.tail) event.pointers.push_back(PointerInfo{"tail", list.tail->id, "amber"});
    else event.pointers.push_back(PointerInfo{"tail", -1, "amber"});
    if (activeId >= 0) event.pointers.push_back(PointerInfo{"current", activeId, "violet"});
    event.variables["size"] = std::to_string(list.size());
    event.variables["head"] = list.head ? "N" + std::to_string(list.head->id) : "nullptr";
    event.variables["tail"] = list.tail ? "N" + std::to_string(list.tail->id) : "nullptr";
    if (!result.empty()) event.variables["result"] = result;
    emitter.emit(event);
}

inline void traceLinkedListOperation(const std::string& kind, const std::string& operation,
    const std::vector<int>& initial, int index, int value, int target, TraceEmitter& emitter) {
    TracedLinkedList list(kind);
    if (operation != "list-create") for (int item : initial) list.appendInitial(item);
    emitListSnapshot(emitter, list, "Initial state", "Nodes use stable IDs; arrows represent the actual C++ next/prev pointers.", 1);
    if (operation == "list-create") {
        for (int item : initial) {
            ListNode* node = list.allocate(item);
            emitListSnapshot(emitter, list, "Allocate node", "Allocate N" + std::to_string(node->id) + " with data " + std::to_string(item) + ".", 2, node->id);
            if (!list.head) {
                list.head = list.tail = node;
                if (list.circular()) node->next = node;
                emitListSnapshot(emitter, list, "Set head and tail", "The first allocated node becomes both head and tail.", 3, node->id);
            } else {
                list.tail->next = node;
                emitListSnapshot(emitter, list, "Link previous tail", "Set the old tail's next pointer to the new node.", 4, list.tail->id);
                if (list.doubly()) node->prev = list.tail;
                if (list.doubly()) emitListSnapshot(emitter, list, "Set previous pointer", "Set the new node's prev pointer to the old tail.", 5, node->id);
                list.tail = node;
                emitListSnapshot(emitter, list, "Update tail", "Move tail to the newly allocated node.", 6, node->id);
                list.relinkCircular();
                if (list.circular()) emitListSnapshot(emitter, list, "Close circular link", "Set the tail's next pointer to head.", 7, node->id);
            }
            ++list.count;
            emitListSnapshot(emitter, list, "Update size", "Increase the node count.", 8, node->id);
        }
        emitListSnapshot(emitter, list, "Operation complete", "List creation completed.", 9, -1, "success");
        return;
    }
    if (operation == "list-length") {
        emitListSnapshot(emitter, list, "Read size", "Return the maintained node count without traversing the list.", 2, -1, "success", std::to_string(list.size()));
        return;
    }
    if (operation == "list-traverse" || operation == "list-traverse-backward") {
        const bool backward = operation == "list-traverse-backward";
        ListNode* current = backward ? list.tail : list.head;
        for (int i = 0; i < list.count; ++i) {
            emitListSnapshot(emitter, list, "Visit node", "Traversal visits N" + std::to_string(current->id) + " (value " + std::to_string(current->data) + ").", kind == "circular" ? 4 : 3, current->id);
            current = backward ? current->prev : current->next;
        }
        emitListSnapshot(emitter, list, "Operation complete", "Traversal completed after visiting exactly " + std::to_string(list.size()) + " nodes.", kind == "circular" ? 8 : 5, -1, "success", std::to_string(list.size()));
        return;
    }
    if (operation == "list-search") {
        ListNode* current = list.head;
        for (int i = 0; i < list.count && current; ++i, current = current->next) {
            emitListSnapshot(emitter, list, "Compare node", "Compare N" + std::to_string(current->id) + " with target " + std::to_string(target) + ".", 3, current->id);
            if (current->data == target) {
                emitListSnapshot(emitter, list, "Operation complete", "Target found at visual index " + std::to_string(i) + ".", 3, current->id, "success", std::to_string(i));
                return;
            }
        }
        emitListSnapshot(emitter, list, "Operation complete", "Target was not found.", 6, -1, "success", "-1");
        return;
    }
    if (operation == "list-insert-head" || operation == "list-insert-tail" || operation == "list-insert-index") {
        const int insertIndex = operation == "list-insert-head" ? 0 : operation == "list-insert-tail" ? list.size() : index;
        if (insertIndex < 0 || insertIndex > list.size()) {
            emitListSnapshot(emitter, list, "Invalid index", "Insertion index must be between 0 and size inclusive.", 2, -1, "error");
            return;
        }
        ListNode* node = list.allocate(value);
        emitListSnapshot(emitter, list, "Allocate node", "Allocate N" + std::to_string(node->id) + " before changing list links.", 3, node->id);
        if (insertIndex == 0) {
            node->next = list.head;
            emitListSnapshot(emitter, list, "Set new node next", "Set the new node's next pointer to the former head.", 5, node->id);
            if (list.doubly() && list.head) {
                list.head->prev = node;
                emitListSnapshot(emitter, list, "Repair old head prev", "Set the former head's prev pointer to the new node.", 6, list.head->id);
            }
            list.head = node;
            emitListSnapshot(emitter, list, "Update head", "Move head to the allocated node.", 7, node->id);
        } else {
            ListNode* previous = list.head;
            for (int i = 0; i < insertIndex - 1; ++i) {
                previous = previous->next;
                emitListSnapshot(emitter, list, "Traverse to predecessor", "Follow next to predecessor N" + std::to_string(previous->id) + ".", 10, previous->id);
            }
            ListNode* next = previous->next;
            node->next = next;
            emitListSnapshot(emitter, list, "Set new node next", "Set the new node's next pointer to the successor.", 11, node->id);
            previous->next = node;
            emitListSnapshot(emitter, list, "Link predecessor", "Set predecessor->next to the new node.", 12, previous->id);
            if (list.doubly() && next) {
                next->prev = node;
                emitListSnapshot(emitter, list, "Repair successor prev", "Set successor->prev to the new node.", 13, next->id);
            }
        }
        if (insertIndex == list.count) {
            list.tail = node;
            emitListSnapshot(emitter, list, "Update tail", "Move tail to the inserted node.", 15, node->id);
        }
        if (list.circular()) {
            list.relinkCircular();
            emitListSnapshot(emitter, list, "Close circular link", "Keep tail->next connected to head.", 16, list.tail->id);
        }
        ++list.count;
        emitListSnapshot(emitter, list, "Update size", "Increase the node count.", 17, node->id);
        emitListSnapshot(emitter, list, "Operation complete", "Inserted value " + std::to_string(value) + ".", 18, node->id, "success");
        return;
    }
    if (operation == "list-delete-head" || operation == "list-delete-tail" || operation == "list-delete-index") {
        const int deleteIndex = operation == "list-delete-head" ? 0 : operation == "list-delete-tail" ? list.size() - 1 : index;
        if (deleteIndex < 0 || deleteIndex >= list.size()) {
            emitListSnapshot(emitter, list, "Invalid index", "Deletion requires an index from 0 through size - 1 and a non-empty list.", 2, -1, "error");
            return;
        }
        ListNode* removed = nullptr;
        ListNode* predecessor = nullptr;
        const bool directTailDelete = list.doubly() && deleteIndex == list.size() - 1;
        if (directTailDelete) {
            removed = list.tail;
            predecessor = removed->prev;
        } else {
            removed = list.head;
            for (int i = 0; i < deleteIndex; ++i) {
                predecessor = removed;
                removed = removed->next;
                emitListSnapshot(emitter, list, "Traverse to target", "Follow next to node N" + std::to_string(removed->id) + ".", 5, removed->id);
            }
        }
        const int removedId = removed->id;
        const int removedValue = removed->data;
        emitListSnapshot(emitter, list, "Select node", "Select N" + std::to_string(removedId) + " before unlinking it.", directTailDelete ? 4 : 5, removedId);
        if (list.doubly()) {
            if (removed->prev) {
                removed->prev->next = removed->next;
                emitListSnapshot(emitter, list, "Bypass target from previous", "Set previous->next to the target's next node.", directTailDelete ? 5 : 6, removed->prev->id);
            } else {
                list.head = removed->next;
                emitListSnapshot(emitter, list, "Update head", "Move head to the target's next node.", directTailDelete ? 6 : 7, list.head ? list.head->id : -1);
            }
            if (removed->next) {
                removed->next->prev = removed->prev;
                emitListSnapshot(emitter, list, "Repair next prev", "Set next->prev to the target's previous node.", 8, removed->next->id);
            }
        } else {
            if (predecessor) {
                predecessor->next = removed->next;
                emitListSnapshot(emitter, list, "Bypass target", "Set predecessor->next to the target's next node.", 6, predecessor->id);
            } else {
                list.head = removed->next;
                emitListSnapshot(emitter, list, "Update head", "Move head to the target's next node.", 7, list.head ? list.head->id : -1);
            }
        }
        if (removed == list.tail) {
            list.tail = predecessor;
            emitListSnapshot(emitter, list, "Update tail", "Move tail to the predecessor.", directTailDelete ? 7 : 9, predecessor ? predecessor->id : -1);
        }
        --list.count;
        emitListSnapshot(emitter, list, "Update size", "Decrease the node count.", directTailDelete ? 8 : 10, removedId);
        if (list.count == 0) {
            list.head = list.tail = nullptr;
            emitListSnapshot(emitter, list, "Reset empty list", "Set both head and tail to nullptr.", directTailDelete ? 9 : 11, removedId);
        }
        if (list.circular() && list.tail) {
            list.relinkCircular();
            emitListSnapshot(emitter, list, "Close circular link", "Set tail->next to the current head.", 12, list.tail->id);
        }
        removed->next = nullptr;
        removed->prev = nullptr;
        emitListSnapshot(emitter, list, "Detach node", "N" + std::to_string(removedId) + " is detached and still allocated.", directTailDelete ? 10 : 13, removedId);
        list.liveNodes.erase(std::remove(list.liveNodes.begin(), list.liveNodes.end(), removed), list.liveNodes.end());
        delete removed;
        emitListSnapshot(emitter, list, "Deallocate node", "Delete N" + std::to_string(removedId) + " (value " + std::to_string(removedValue) + "); the freed ID is not retained as a live pointer.", directTailDelete ? 11 : 14);
        emitListSnapshot(emitter, list, "Operation complete", "Deletion completed.", directTailDelete ? 12 : 15, -1, "success", std::to_string(removedValue));
        return;
    }
    if (operation == "list-update") {
        if (index < 0 || index >= list.size()) {
            emitListSnapshot(emitter, list, "Invalid index", "Update index must refer to an existing node.", 2, -1, "error");
            return;
        }
        ListNode* node = list.head;
        for (int i = 0; i < index && node; ++i) {
            node = node->next;
            if (node) emitListSnapshot(emitter, list, "Traverse to node", "Follow next to the requested visual index.", 4, node->id);
        }
        if (!node) {
            emitListSnapshot(emitter, list, "Invalid index", "Update index must refer to an existing node.", 2, -1, "error");
            return;
        }
        emitListSnapshot(emitter, list, "Select node", "Reach index " + std::to_string(index) + " by following links.", 4, node->id);
        node->data = value;
        emitListSnapshot(emitter, list, "Update node data", "Set the selected node's data to " + std::to_string(value) + ".", 5, node->id, "success");
        return;
    }
    if (operation == "list-reverse") {
        if (list.circular() && list.tail) {
            list.tail->next = nullptr;
            emitListSnapshot(emitter, list, "Break circular link", "Temporarily set tail->next to nullptr so traversal terminates.", 2, list.tail->id);
        }
        if (list.doubly()) {
            ListNode* current = list.head;
            while (current) {
                ListNode* next = current->next;
                ListNode* previous = current->prev;
                current->next = previous;
                current->prev = next;
                emitListSnapshot(emitter, list, "Reverse node links", "Swap N" + std::to_string(current->id) + "'s prev and next links.", 5, current->id);
                current = next;
            }
            std::swap(list.head, list.tail);
        } else {
            ListNode* previous = nullptr;
            ListNode* current = list.head;
            ListNode* oldHead = list.head;
            while (current) {
                ListNode* next = current->next;
                current->next = previous;
                emitListSnapshot(emitter, list, "Reverse pointer", "Set N" + std::to_string(current->id) + "->next to " + (previous ? "N" + std::to_string(previous->id) : "nullptr") + ".", list.circular() ? 8 : 7, current->id);
                previous = current;
                current = next;
            }
            list.head = previous;
            emitListSnapshot(emitter, list, "Update head", "Set head to the previous node.", list.circular() ? 12 : 11);
            list.tail = oldHead;
            emitListSnapshot(emitter, list, "Update tail", "Set tail to the old head node.", list.circular() ? 13 : 12);
        }
        if (list.circular() && list.tail) {
            list.tail->next = list.head;
            emitListSnapshot(emitter, list, "Restore circular link", "Set the new tail's next pointer to the new head.", 14, list.tail->id);
        }
        emitListSnapshot(emitter, list, "Operation complete", "List reversed.", list.circular() ? 15 : list.doubly() ? 8 : 13, -1, "success");
    }
}

inline std::string linearStructureSource(const std::string& operation, const std::string& structure = "singly") {
    if (operation == "queue-demo") {
        return "bool enqueue(int value) {\n    if (isFull()) return false;\n    int index = nextInsertionIndex();\n    writeAt(index, value);\n    incrementCount();\n    return true;\n}\n\nbool dequeue(int& result) {\n    if (isEmpty()) return false;\n    result = peek();\n    clearFrontSlot();\n    advanceFrontAndDecrement();\n    return true;\n}\n\nbool isFull() const {\n    return count == capacity;\n}\n\nvoid circularQueueDemo() {\n    queue.clear();\n    return;\n}";
    }
    if (operation == "queue-clear") {
        return "void clear() {\n    clearOccupiedSlots();\n    resetFront();\n    resetCount();\n}";
    }
    if (operation == "deque-push-front") {
        return "bool pushFront(int value) {\n    if (isFull()) return false;\n    front = (front - 1 + capacity) % capacity;\n    storage[front] = value;\n    ++count;\n    return true;\n}";
    }
    if (operation == "deque-push-back") {
        return "bool pushBack(int value) {\n    if (isFull()) return false;\n    int index = (front + count) % capacity;\n    storage[index] = value;\n    ++count;\n    return true;\n}";
    }
    if (operation == "deque-pop-front") {
        return "bool popFront(int& result) {\n    if (isEmpty()) return false;\n    result = peekFront();\n    clearSlot(front);\n    advanceFront();\n    decrementCount();\n    return true;\n}";
    }
    if (operation == "deque-pop-back") {
        return "bool popBack(int& result) {\n    if (isEmpty()) return false;\n    int index = backIndex();\n    result = peekBack();\n    clearSlot(index);\n    decrementCount();\n    return true;\n}";
    }
    if (operation.find("deque-") == 0 || operation == "deque-intro") {
        if (operation == "deque-peek-front") {
            return "int peekFront() const {\n    if (isEmpty()) return -1;\n    return storage[front];\n}";
        }
        if (operation == "deque-peek-back") {
            return "int peekBack() const {\n    if (isEmpty()) return -1;\n    return storage[(front + count - 1) % capacity];\n}";
        }
        if (operation == "deque-is-empty") {
            return "bool isEmpty() const {\n    return count == 0;\n}";
        }
        if (operation == "deque-is-full") {
            return "bool isFull() const {\n    return count == capacity;\n}";
        }
        if (operation == "deque-size") {
            return "int size() const {\n    return count;\n}";
        }
        if (operation == "deque-intro") {
            return "class CircularDeque {\n    vector<int> storage;\n    int front;\n    int count;\n};";
        }
        return "bool isEmpty() const { return count == 0; }\nbool isFull() const { return count == capacity; }\nint size() const { return count; }\nint peekFront() const { return storage[front]; }\nint peekBack() const { return storage[(front + count - 1) % capacity]; }";
    }
    if (operation.find("list-") == 0) {
        if (operation == "list-create") {
            return "void createList(const vector<int>& values) {\n    Node* node = new Node(nextId++, value);\n    if (!head) head = tail = node;\n    else tail->next = node;\n    if (doubly) node->prev = tail;\n    tail = node;\n    if (circular) tail->next = head;\n    ++count;\n}";
        }
        if (operation == "list-traverse" || operation == "list-traverse-backward") {
            if (structure == "circular") {
                return "int visited = 0;\nNode* current = head;\nwhile (visited < count) {\n    visit(current);\n    current = current->next;\n    ++visited;\n}\nreturn count;";
            }
            return operation == "list-traverse-backward"
                ? "Node* current = tail;\nwhile (current) {\n    visit(current);\n    current = current->prev;\n}\nreturn count;"
                : "Node* current = head;\nwhile (current) {\n    visit(current);\n    current = current->next;\n}\nreturn count;";
        }
        if (operation == "list-length") {
            return "int size() const {\n    return count;\n}";
        }
        if (operation == "list-search") {
            return "Node* current = head;\nfor (int index = 0; index < count; ++index) {\n    if (current->data == target) return index;\n    current = current->next;\n}\nreturn -1;";
        }
        if (operation == "list-insert-head" || operation == "list-insert-tail" || operation == "list-insert-index") {
            return "bool insertAt(int index, int value) {\n    if (index < 0 || index > count) return false;\n    Node* node = new Node(nextId++, value);\n    if (index == 0) {\n        node->next = head;\n        if (head) head->prev = node;\n        head = node;\n    } else {\n        Node* previous = head;\n        for (int i = 0; i < index - 1; ++i) previous = previous->next;\n        node->next = previous->next;\n        previous->next = node;\n        if (node->next) node->next->prev = node;\n    }\n    if (index == count) tail = node;\n    if (circular) tail->next = head;\n    ++count;\n    return true;\n}";
        }
        if (operation == "list-delete-head" || operation == "list-delete-tail" || operation == "list-delete-index") {
            if (operation == "list-delete-tail" && structure == "doubly") {
                return "bool eraseTail() {\n    if (!tail) return false;\n    Node* current = tail;\n    Node* previous = current->prev;\n    if (previous) previous->next = nullptr;\n    else head = nullptr;\n    tail = previous;\n    --count;\n    if (count == 0) head = tail = nullptr;\n    current->next = current->prev = nullptr;\n    delete current;\n    return true;\n}";
            }
            return "bool eraseAt(int index) {\n    if (index < 0 || index >= count) return false;\n    Node* previous = nullptr;\n    Node* current = head;\n    while (index-- > 0) { previous = current; current = current->next; }\n    if (previous) previous->next = current->next;\n    else head = current->next;\n    if (current->next) current->next->prev = previous;\n    if (current == tail) tail = previous;\n    --count;\n    if (count == 0) head = tail = nullptr;\n    if (circular && tail) tail->next = head;\n    current->next = current->prev = nullptr;\n    delete current;\n    return true;\n}";
        }
        if (operation == "list-update") {
            return "bool updateAt(int index, int value) {\n    if (index < 0 || index >= count) return false;\n    Node* current = head;\n    while (index-- > 0) current = current->next;\n    current->data = value;\n    return true;\n}";
        }
        if (operation == "list-reverse" && structure == "doubly") {
            return "void reverse() {\n    Node* current = head;\n    while (current) {\n        Node* next = current->next;\n        std::swap(current->next, current->prev);\n        current = next;\n    }\n    std::swap(head, tail);\n}";
        }
        if (operation == "list-reverse" && structure == "circular") {
            return "void reverse() {\n    tail->next = nullptr;\n    Node* previous = nullptr;\n    Node* current = head;\n    Node* oldHead = head;\n    while (current) {\n        Node* next = current->next;\n        current->next = previous;\n        previous = current;\n        current = next;\n    }\n    head = previous;\n    tail = oldHead;\n    tail->next = head;\n}";
        }
        if (operation == "list-reverse") {
            return "void reverse() {\n    Node* previous = nullptr;\n    Node* current = head;\n    Node* oldHead = head;\n    while (current) {\n        Node* next = current->next;\n        current->next = previous;\n        previous = current;\n        current = next;\n    }\n    head = previous;\n    tail = oldHead;\n}";
        }
        return "struct Node { int data; Node* prev; Node* next; };\n\nbool insertAt(int index, int value) {\n    if (index < 0 || index > size) return false;\n    Node* node = new Node{value, nullptr, nullptr};\n    if (index == 0) {\n        node->next = head;\n        if (head) head->prev = node;\n        head = node;\n    } else {\n        Node* previous = nodeAt(index - 1);\n        node->next = previous->next;\n        node->prev = previous;\n        previous->next = node;\n        if (node->next) node->next->prev = node;\n    }\n    ++size;\n    return true;\n}\n\nvoid reverse() {\n    Node* previous = nullptr;\n    Node* current = head;\n    while (current) {\n        Node* next = current->next;\n        current->next = previous;\n        previous = current;\n        current = next;\n    }\n    head = previous;\n}";
    }
    if (operation == "queue-enqueue" || operation == "queue-enqueue-full") {
        return "bool enqueue(int value) {\n    if (isFull()) return false;\n    int index = nextInsertionIndex();\n    writeAt(index, value);\n    incrementCount();\n    return true;\n}";
    }
    if (operation == "queue-dequeue" || operation == "queue-dequeue-empty") {
        return "bool dequeue(int& result) {\n    if (isEmpty()) return false;\n    result = peek();\n    clearFrontSlot();\n    advanceFrontAndDecrement();\n    return true;\n}";
    }
    if (operation.find("queue-") == 0) {
        if (operation == "queue-peek") {
            return "int peek() const {\n    if (isEmpty()) return -1;\n    return storage[front];\n}";
        }
        if (operation == "queue-rear") {
            return "int rear() const {\n    if (isEmpty()) return -1;\n    int index = (front + count - 1) % capacity;\n    return storage[index];\n}";
        }
        if (operation == "queue-is-empty") {
            return "bool isEmpty() const {\n    return count == 0;\n}";
        }
        if (operation == "queue-is-full") {
            return "bool isFull() const {\n    return count == capacity;\n}";
        }
        if (operation == "queue-size") {
            return "int size() const {\n    return count;\n}";
        }
        return "class CircularQueue {\n    int front;\n    int count;\n    vector<int> storage;\n};";
    }
    return "// C++ source code not available";
}

#endif
