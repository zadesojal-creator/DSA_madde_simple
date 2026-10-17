#ifndef STACK_ALGORITHMS_HPP
#define STACK_ALGORITHMS_HPP

#include <vector>
#include <string>
#include "trace_event.hpp"
#include "stack.hpp"

// Prototypes for all 10 stack operations
void traceStackIntro(const Stack& s, TraceEmitter& emitter);
void tracePush(Stack s, int value, TraceEmitter& emitter);
void tracePop(Stack s, TraceEmitter& emitter);
void tracePeek(const Stack& s, TraceEmitter& emitter);
void traceIsEmpty(const Stack& s, TraceEmitter& emitter);
void traceIsFull(const Stack& s, TraceEmitter& emitter);
void traceStackSize(const Stack& s, TraceEmitter& emitter);
int traceSearchStack(const Stack& s, int target, TraceEmitter& emitter);
void traceReverseStack(Stack s, TraceEmitter& emitter);
bool traceBalancedParentheses(const std::string& expr, TraceEmitter& emitter);

// Canonical C++ source code retrieval
std::string getStackCppSourceCode(const std::string& operationId);

#endif // STACK_ALGORITHMS_HPP
