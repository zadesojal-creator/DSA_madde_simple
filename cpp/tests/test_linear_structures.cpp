#include "../include/linear_structure_algorithms.hpp"
#include <cassert>
#include <vector>

static void testQueueBoundariesAndWraparound() {
    CircularBuffer queue(3);
    assert(queue.isEmpty());
    int removed = 0;
    assert(!queue.dequeue(removed));
    assert(queue.enqueue(10));
    assert(queue.enqueue(20));
    assert(queue.enqueue(30));
    assert(queue.isFull());
    assert(!queue.enqueue(40));
    assert(queue.dequeue(removed) && removed == 10);
    assert(queue.dequeue(removed) && removed == 20);
    assert(queue.enqueue(40));
    assert(queue.enqueue(50));
    assert(queue.isFull());
    assert(queue.frontIndex() == 2);
    assert(queue.rearIndex() == 1);
    assert(queue.peek() == 30);
    assert(queue.rear() == 50);
    const std::vector<int> expected{30, 40, 50};
    assert(queue.logicalOrder() == expected);
    assert(queue.dequeue(removed) && removed == 30);
    assert(queue.dequeue(removed) && removed == 40);
    assert(queue.dequeue(removed) && removed == 50);
    assert(queue.isEmpty() && queue.frontIndex() == 0 && queue.rearIndex() == -1);
    queue.enqueue(1);
    queue.clear();
    assert(queue.isEmpty());
    assert(!queue.occupiedSlots()[0]);
}

static void testDequeEndsAndWraparound() {
    CircularDeque deque(4);
    assert(deque.isEmpty());
    int removed = 0;
    assert(!deque.popFront(removed));
    assert(deque.pushBack(20));
    assert(deque.pushFront(10));
    assert(deque.pushBack(30));
    assert(deque.peekFront() == 10 && deque.peekBack() == 30);
    assert(deque.popBack(removed) && removed == 30);
    assert(deque.popFront(removed) && removed == 10);
    assert(deque.popFront(removed) && removed == 20);
    assert(deque.isEmpty());
    assert(deque.pushFront(4));
    assert(deque.frontIndex() == deque.backIndex());
    assert(deque.popBack(removed) && removed == 4);
    assert(deque.isEmpty());
    assert(deque.pushBack(1) && deque.pushBack(2) && deque.pushBack(3) && deque.pushBack(4));
    assert(deque.isFull() && !deque.pushFront(5));
    assert(deque.popFront(removed) && removed == 1);
    assert(deque.pushBack(5));
    assert(deque.frontIndex() == 1 && deque.backIndex() == 0);
    const std::vector<int> wrapped{2, 3, 4, 5};
    assert(deque.logicalOrder() == wrapped);
}

static void testLinkedListTracesAndTopology() {
    TraceEmitter headInsert;
    traceLinkedListOperation("singly", "list-insert-head", {20, 30}, 0, 10, 0, headInsert);
    const std::vector<int> headValues{10, 20, 30};
    assert(headInsert.getEvents().back().arrayState == headValues);

    TraceEmitter singlyTrace;
    traceLinkedListOperation("singly", "list-insert-index", {10, 30}, 1, 20, 0, singlyTrace);
    const auto& inserted = singlyTrace.getEvents().back();
    assert(inserted.linkedNodes.size() == 3);
    assert(inserted.linkedNodes[0].nextId == inserted.linkedNodes[1].id);
    assert(inserted.linkedNodes[1].value == 20);
    assert(inserted.linkedNodes[1].nextId == inserted.linkedNodes[2].id);
    TraceEmitter deletedTrace;
    traceLinkedListOperation("singly", "list-delete-tail", {10, 20, 30}, 0, 0, 0, deletedTrace);
    assert(deletedTrace.getEvents().back().linkedNodes.size() == 2);
    assert(deletedTrace.getEvents().back().linkedNodes.back().nextId == -1);

    TraceEmitter searchTrace;
    traceLinkedListOperation("singly", "list-search", {10, 20, 30}, 0, 0, 20, searchTrace);
    assert(searchTrace.getEvents().back().variables.at("result") == "1");
    TraceEmitter updateTrace;
    traceLinkedListOperation("singly", "list-update", {10, 20, 30}, 2, 99, 0, updateTrace);
    assert(updateTrace.getEvents().back().linkedNodes[2].value == 99);
    TraceEmitter reverseTrace;
    traceLinkedListOperation("singly", "list-reverse", {10, 20, 30}, 0, 0, 0, reverseTrace);
    const std::vector<int> reversed{30, 20, 10};
    assert(reverseTrace.getEvents().back().arrayState == reversed);
    TraceEmitter invalidIndexTrace;
    traceLinkedListOperation("singly", "list-insert-index", {10}, 3, 20, 0, invalidIndexTrace);
    assert(invalidIndexTrace.getEvents().back().statusType == "error");
    TraceEmitter lengthTrace;
    traceLinkedListOperation("singly", "list-length", {10, 20, 30}, 0, 0, 0, lengthTrace);
    assert(lengthTrace.getEvents().back().variables.at("result") == "3");

    TraceEmitter doublyTrace;
    traceLinkedListOperation("doubly", "list-insert-head", {20, 30}, 0, 10, 0, doublyTrace);
    const auto& doublyNodes = doublyTrace.getEvents().back().linkedNodes;
    assert(doublyNodes.size() == 3);
    assert(doublyNodes[1].prevId == doublyNodes[0].id);
    TraceEmitter backwardTrace;
    traceLinkedListOperation("doubly", "list-traverse-backward", {10, 20, 30}, 0, 0, 0, backwardTrace);
    assert(backwardTrace.getEvents().back().variables.at("result") == "3");
    TraceEmitter doublyReverseTrace;
    traceLinkedListOperation("doubly", "list-reverse", {10, 20, 30}, 0, 0, 0, doublyReverseTrace);
    assert((doublyReverseTrace.getEvents().back().arrayState == reversed));
    TraceEmitter doublyTailDelete;
    traceLinkedListOperation("doubly", "list-delete-tail", {10, 20, 30}, 0, 0, 0, doublyTailDelete);
    assert(doublyTailDelete.getEvents().back().linkedNodes.size() == 2);

    TraceEmitter circularTrace;
    traceLinkedListOperation("circular", "list-create", {7}, 0, 0, 0, circularTrace);
    const auto& circularNodes = circularTrace.getEvents().back().linkedNodes;
    assert(circularNodes.size() == 1);
    assert(circularNodes.front().nextId == circularNodes.front().id);
    TraceEmitter circularInsert;
    traceLinkedListOperation("circular", "list-insert-tail", {10, 20}, 0, 30, 0, circularInsert);
    const auto& circularInserted = circularInsert.getEvents().back().linkedNodes;
    assert(circularInserted.back().nextId == circularInserted.front().id);
    TraceEmitter circularReverse;
    traceLinkedListOperation("circular", "list-reverse", {10, 20, 30}, 0, 0, 0, circularReverse);
    assert((circularReverse.getEvents().back().arrayState == reversed));
    assert(circularReverse.getEvents().back().linkedNodes.back().nextId == circularReverse.getEvents().back().linkedNodes.front().id);

    TraceEmitter emptyCircularTrace;
    traceLinkedListOperation("circular", "list-delete-head", {7}, 0, 0, 0, emptyCircularTrace);
    const auto& empty = emptyCircularTrace.getEvents().back();
    assert(empty.linkedNodes.empty());
    assert(empty.variables.at("head") == "nullptr");
    assert(empty.variables.at("tail") == "nullptr");
}

static void testTraceSnapshotsMatchMethods() {
    TraceEmitter enqueueTrace;
    traceQueueOperation("queue-enqueue", {10}, 3, 20, enqueueTrace);
    const auto& enqueueEvents = enqueueTrace.getEvents();
    assert(enqueueEvents.size() >= 6);
    assert(enqueueEvents[4].structureStorage[1] == 20);
    assert(enqueueEvents[4].elementCount == 1);
    assert(enqueueEvents.back().elementCount == 2);
    assert(enqueueEvents.back().sourceLine == 6);

    TraceEmitter dequeueTrace;
    traceQueueOperation("queue-dequeue", {10, 20}, 3, 0, dequeueTrace);
    const auto& dequeueEvents = dequeueTrace.getEvents();
    assert(dequeueEvents[3].variables.at("result") == "10");
    assert(dequeueEvents[3].elementCount == 2);
    assert(dequeueEvents.back().logicalOrder == std::vector<int>{20});
    assert(enqueueEvents[4].sourceLine == 4);
    assert(enqueueEvents.back().sourceLine == 6);
    assert(linearStructureSource("queue-enqueue").find("incrementCount()") != std::string::npos);
    assert(linearStructureSource("list-reverse", "circular").find("tail->next = head") != std::string::npos);

    TraceEmitter demoTrace;
    traceQueueOperation("queue-demo", {}, 4, 0, demoTrace);
    assert(demoTrace.getEvents().front().capacity == 4);
    assert(demoTrace.getEvents().front().logicalOrder.empty());
    bool sawFull = false;
    bool sawOverflow = false;
    bool sawUnderflow = false;
    for (const TraceEvent& event : demoTrace.getEvents()) {
        sawFull = sawFull || event.title == "Full queue";
        sawOverflow = sawOverflow || event.statusType == "overflow";
        sawUnderflow = sawUnderflow || event.statusType == "underflow";
        if (event.title == "Wraparound enqueue" && event.elementCount == 4) {
            assert((event.logicalOrder == std::vector<int>{30, 40, 90, 100}));
        }
    }
    assert(sawFull && sawOverflow && sawUnderflow);
}

int main() {
    testQueueBoundariesAndWraparound();
    testDequeEndsAndWraparound();
    testLinkedListTracesAndTopology();
    testTraceSnapshotsMatchMethods();
    return 0;
}
