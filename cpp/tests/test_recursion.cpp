#include "../include/recursion_algorithms.hpp"
#include <iostream>
#include <cassert>
#include <vector>
#include <string>

void testFactorial() {
    std::cout << "Testing C++ Factorial..." << std::endl;

    // Standard case: 5! = 120
    {
        TraceEmitter emitter;
        traceFactorial(5, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        assert(events.back().isCompleted == true);
        assert(events.back().eventType == "complete");
        assert(events.back().variables.at("result") == "120");
    }

    // Base cases: 0! = 1, 1! = 1
    {
        TraceEmitter emitter0;
        traceFactorial(0, emitter0);
        assert(emitter0.getEvents().back().variables.at("result") == "1");

        TraceEmitter emitter1;
        traceFactorial(1, emitter1);
        assert(emitter1.getEvents().back().variables.at("result") == "1");
    }

    // Negative case: undefined error event
    {
        TraceEmitter emitter;
        traceFactorial(-5, emitter);
        assert(emitter.getEvents().front().eventType == "error");
    }
}

void testFibonacci() {
    std::cout << "Testing C++ Fibonacci..." << std::endl;

    // fib(6) = 8
    {
        TraceEmitter emitter;
        traceFibonacci(6, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        assert(events.back().isCompleted == true);
        assert(events.back().eventType == "complete");
        assert(events.back().variables.at("result") == "8");
    }

    // Base cases: fib(0) = 0, fib(1) = 1
    {
        TraceEmitter emitter0;
        traceFibonacci(0, emitter0);
        assert(emitter0.getEvents().back().variables.at("result") == "0");

        TraceEmitter emitter1;
        traceFibonacci(1, emitter1);
        assert(emitter1.getEvents().back().variables.at("result") == "1");
    }

    // Safety guard: n > 15 rejected
    {
        TraceEmitter emitter;
        traceFibonacci(20, emitter);
        assert(emitter.getEvents().front().eventType == "error");
    }
}

void testTowerOfHanoi() {
    std::cout << "Testing C++ Tower of Hanoi..." << std::endl;

    // 3 disks -> 7 moves
    {
        TraceEmitter emitter;
        traceTowerOfHanoi(3, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        assert(events.back().isCompleted == true);
        assert(events.back().eventType == "complete");
        assert(events.back().variables.at("totalMoves") == "7");
        assert(events.back().variables.at("A") == "[]");
        assert(events.back().variables.at("B") == "[]");
        assert(events.back().variables.at("C") == "[3,2,1]");
    }

    // 1 disk -> 1 move
    {
        TraceEmitter emitter;
        traceTowerOfHanoi(1, emitter);
        assert(emitter.getEvents().back().variables.at("totalMoves") == "1");
        assert(emitter.getEvents().back().variables.at("C") == "[1]");
    }
}

void testMaze() {
    std::cout << "Testing C++ Maze Backtracking..." << std::endl;

    // 5x5 maze
    std::vector<std::vector<int>> grid = {
        {0,0,1,0,0},
        {0,1,1,0,1},
        {0,0,0,0,1},
        {1,1,0,1,0},
        {0,0,0,0,0}
    };
    TraceEmitter emitter;
    traceMazeSolve(grid, 0, 0, 4, 4, emitter);
    const auto& events = emitter.getEvents();
    assert(!events.empty());
    assert(events.back().isCompleted == true);
    assert(events.back().eventType == "complete");

    // Must find destination reached event
    bool foundGoal = false;
    for (const auto& ev : events) {
        if (ev.eventType == "destination_reached") {
            foundGoal = true;
            break;
        }
    }
    assert(foundGoal);
}

void testNQueens() {
    std::cout << "Testing C++ N-Queens..." << std::endl;

    // 4-Queens
    {
        TraceEmitter emitter;
        traceNQueens(4, false, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        assert(events.back().isCompleted == true);
        assert(events.back().eventType == "search_complete");

        bool foundSolution = false;
        for (const auto& ev : events) {
            if (ev.eventType == "solution_found") {
                foundSolution = true;
                break;
            }
        }
        assert(foundSolution);
    }

    // 6-Queens
    {
        TraceEmitter emitter;
        traceNQueens(6, false, emitter);
        assert(emitter.getEvents().back().isCompleted == true);
    }
}

void testRecursionSourceCode() {
    std::cout << "Testing Recursion Source Code Retrieval..." << std::endl;
    std::vector<std::string> ops = {"factorial", "fibonacci", "tower-of-hanoi", "maze", "n-queens"};
    for (const auto& op : ops) {
        std::string code = getRecursionSourceCode(op);
        assert(!code.empty());
        assert(code != "// C++ source code not available");
    }
}

int main() {
    std::cout << "=== Running Recursion & Backtracking C++ Unit Tests ===" << std::endl;
    testFactorial();
    testFibonacci();
    testTowerOfHanoi();
    testMaze();
    testNQueens();
    testRecursionSourceCode();
    std::cout << "All Recursion C++ Unit Tests Passed Successfully!" << std::endl;
    return 0;
}
