#include "../include/stack_algorithms.hpp"
#include <cassert>
#include <iostream>

void testStackBasics() {
    Stack s(3);
    assert(s.isEmpty());
    assert(!s.isFull());
    assert(s.size() == 0);

    assert(s.push(10));
    assert(s.push(20));
    assert(s.push(30));
    assert(s.size() == 3);
    assert(s.isFull());

    int topVal = 0;
    assert(s.peek(topVal));
    assert(topVal == 30);
    assert(s.pop());
    assert(s.size() == 2);
    assert(s.getData().back() == 20);

    Stack emptyStack(2);
    assert(emptyStack.isEmpty());
    assert(!emptyStack.pop());
    assert(!emptyStack.peek(topVal));
}

void testStackSearch() {
    Stack s(5);
    s.push(10);
    s.push(20);
    s.push(30);
    s.push(20);

    TraceEmitter emitter;
    int foundIndex = traceSearchStack(s, 20, emitter);
    assert(foundIndex == 3);
    assert(!emitter.getEvents().empty());
}

void testReverseAndBalanced() {
    Stack s(5);
    s.push(10);
    s.push(20);
    s.push(30);

    TraceEmitter reverseEmitter;
    traceReverseStack(s, reverseEmitter);
    assert(!reverseEmitter.getEvents().empty());
    assert(reverseEmitter.getEvents().back().isCompleted);

    TraceEmitter parenEmitter;
    assert(traceBalancedParentheses("([{}])", parenEmitter));
    TraceEmitter badEmitter;
    assert(!traceBalancedParentheses("([)]", badEmitter));
}

int main() {
    std::cout << "Running stack C++ tests..." << std::endl;
    testStackBasics();
    testStackSearch();
    testReverseAndBalanced();
    std::cout << "All stack C++ tests passed." << std::endl;
    return 0;
}
