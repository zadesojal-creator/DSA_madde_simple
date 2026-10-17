#ifndef RECURSION_ALGORITHMS_HPP
#define RECURSION_ALGORITHMS_HPP

#include "../include/trace_event.hpp"
#include <vector>
#include <string>

// ──────────────────────────────────────────────────────────────────────────────
// Source-code retrieval
// ──────────────────────────────────────────────────────────────────────────────
std::string getRecursionSourceCode(const std::string& op);

// ──────────────────────────────────────────────────────────────────────────────
// Factorial
// ──────────────────────────────────────────────────────────────────────────────
// Computes n! recursively. Emits: function_enter, base_case, recursive_call,
// multiply_return events.
void traceFactorial(int n, TraceEmitter& emitter);

// ──────────────────────────────────────────────────────────────────────────────
// Fibonacci (naive recursive – no memoisation)
// ──────────────────────────────────────────────────────────────────────────────
// Computes fib(n) via pure recursion. Emits: function_enter, base_case,
// first_call, second_call, add_return events.
// Hard limit: n <= 15 to bound trace size.
void traceFibonacci(int n, TraceEmitter& emitter);

// ──────────────────────────────────────────────────────────────────────────────
// Tower of Hanoi
// ──────────────────────────────────────────────────────────────────────────────
// Moves n disks from src peg to dst peg via aux. Emits: function_enter,
// base_move, recursive_call_1, disk_move, recursive_call_2, return events.
// Hard limit: n <= 8 to keep trace <= 512 events.
void traceTowerOfHanoi(int n, TraceEmitter& emitter);

// ──────────────────────────────────────────────────────────────────────────────
// Maze Solving (backtracking DFS, 0=open 1=wall)
// ──────────────────────────────────────────────────────────────────────────────
// Solves via DFS with backtracking. Emits: function_enter, cell_validate,
// cell_reject, cell_visit, path_push, exploration_branch, path_pop, backtrack,
// destination_reached, return, complete events.
void traceMazeSolve(
    const std::vector<std::vector<int>>& grid,
    int startRow, int startCol,
    int goalRow,  int goalCol,
    TraceEmitter& emitter
);

// ──────────────────────────────────────────────────────────────────────────────
// N-Queens backtracking
// ──────────────────────────────────────────────────────────────────────────────
// Finds the first solution (or all solutions) for N-Queens.
// Hard limit: N <= 10.
void traceNQueens(int n, bool findAll, TraceEmitter& emitter);

#endif // RECURSION_ALGORITHMS_HPP
