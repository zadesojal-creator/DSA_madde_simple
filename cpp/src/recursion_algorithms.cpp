#include "../include/recursion_algorithms.hpp"
#include <sstream>
#include <algorithm>
#include <climits>
#include <cmath>


// ═════════════════════════════════════════════════════════════════════════════
// SOURCE CODE STRINGS
// ═════════════════════════════════════════════════════════════════════════════

static const std::string FACTORIAL_CODE = R"(long long factorial(int n) {
    // Base case: 0! = 1! = 1
    if (n <= 1) {
        return 1;
    }
    // Recursive case: n * factorial(n-1)
    return n * factorial(n - 1);
}

void runFactorial(int n) {
    if (n < 0) {
        // Error: factorial undefined for negatives
        return;
    }
    long long result = factorial(n);
    // Result stored in 'result'
}
)";

static const std::string FIBONACCI_CODE = R"(long long fibonacci(int n) {
    // Base case: fib(0) = 0, fib(1) = 1
    if (n <= 1) {
        return n;
    }
    // Recursive case: fib(n-1) + fib(n-2)
    long long left  = fibonacci(n - 1);
    long long right = fibonacci(n - 2);
    return left + right;
}

void runFibonacci(int n) {
    // n <= 15 enforced to bound execution
    long long result = fibonacci(n);
}
)";

static const std::string HANOI_CODE = R"(void towerOfHanoi(int n, char src, char aux, char dst) {
    if (n == 1) {
        // Base case: move single disk directly
        moveDisk(1, src, dst);
        return;
    }
    // Step 1: Move n-1 disks from src to aux
    towerOfHanoi(n - 1, src, dst, aux);
    // Step 2: Move bottom disk from src to dst
    moveDisk(n, src, dst);
    // Step 3: Move n-1 disks from aux to dst
    towerOfHanoi(n - 1, aux, src, dst);
}

void moveDisk(int disk, char from, char to) {
    // Emits a disk_move trace event
}
)";

static const std::string MAZE_CODE = R"(bool solveMaze(vector<vector<int>>& grid,
               int row, int col,
               int goalRow, int goalCol,
               vector<pair<int,int>>& path) {
    int rows = grid.size(), cols = grid[0].size();
    // Bounds and wall check
    if (row < 0 || row >= rows || col < 0 || col >= cols)
        return false;
    if (grid[row][col] == 1)  // wall
        return false;
    if (grid[row][col] == 2)  // already visited
        return false;
    // Mark visited and push to candidate path
    grid[row][col] = 2;
    path.push_back({row, col});
    // Goal check
    if (row == goalRow && col == goalCol)
        return true;
    // Explore neighbours: Down, Right, Up, Left
    int dr[] = {1, 0, -1, 0};
    int dc[] = {0, 1,  0,-1};
    for (int d = 0; d < 4; d++) {
        if (solveMaze(grid, row+dr[d], col+dc[d],
                      goalRow, goalCol, path))
            return true;
    }
    // Backtrack
    grid[row][col] = 0;
    path.pop_back();
    return false;
}
)";

static const std::string NQUEENS_CODE = R"(bool solveNQueens(int row, int n,
                  vector<int>& board,
                  vector<bool>& cols,
                  vector<bool>& diag1,
                  vector<bool>& diag2,
                  int& solutions) {
    if (row == n) {
        // All queens placed successfully
        solutions++;
        return true; // stop after first if findAll=false
    }
    for (int col = 0; col < n; col++) {
        // Check column and diagonal conflicts
        if (cols[col] || diag1[row-col+n-1] || diag2[row+col])
            continue;
        // Place queen
        board[row] = col;
        cols[col] = diag1[row-col+n-1] = diag2[row+col] = true;
        // Recurse to next row
        if (solveNQueens(row+1, n, board, cols, diag1, diag2, solutions))
            return true;
        // Backtrack: remove queen
        board[row] = -1;
        cols[col] = diag1[row-col+n-1] = diag2[row+col] = false;
    }
    return false;
}
)";

std::string getRecursionSourceCode(const std::string& op) {
    if (op == "factorial")        return FACTORIAL_CODE;
    if (op == "fibonacci")        return FIBONACCI_CODE;
    if (op == "tower-of-hanoi")   return HANOI_CODE;
    if (op == "maze")             return MAZE_CODE;
    if (op == "n-queens")         return NQUEENS_CODE;
    return "// C++ source code not available";
}

// ═════════════════════════════════════════════════════════════════════════════
// FACTORIAL
// ═════════════════════════════════════════════════════════════════════════════

struct FactorialFrame {
    int n;
    int frameId;
    int parentId;
};

static long long factorialImpl(
    int n,
    int frameId,
    int parentId,
    std::vector<FactorialFrame>& frameStack,
    TraceEmitter& emitter
) {
    frameStack.push_back({n, frameId, parentId});

    // Build callStack strings
    std::vector<std::string> cs;
    for (auto& f : frameStack) {
        cs.push_back("factorial(" + std::to_string(f.n) + ")");
    }

    // function_enter event
    {
        TraceEvent ev;
        ev.eventType  = "function_enter";
        ev.title      = "factorial(" + std::to_string(n) + ") called";
        ev.description = "Entering factorial with n=" + std::to_string(n) +
                         ". Call depth: " + std::to_string((int)frameStack.size() - 1) + ".";
        ev.sourceLine  = 1;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack   = cs;
        ev.variables["n"]      = std::to_string(n);
        ev.variables["frameId"] = std::to_string(frameId);
        emitter.emit(ev);
    }

    // base case
    if (n <= 1) {
        TraceEvent ev;
        ev.eventType   = "base_case";
        ev.title       = "Base case reached: factorial(" + std::to_string(n) + ") = 1";
        ev.description = "n <= 1 is true. Return 1 immediately — no further recursion.";
        ev.sourceLine  = 3;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack   = cs;
        ev.variables["n"]      = std::to_string(n);
        ev.variables["return"] = "1";
        emitter.emit(ev);

        frameStack.pop_back();
        return 1LL;
    }

    // recursive call event
    {
        TraceEvent ev;
        ev.eventType   = "recursive_call";
        ev.title       = "Calling factorial(" + std::to_string(n - 1) + ")";
        ev.description = "n=" + std::to_string(n) + " > 1. Suspend this frame and recurse into factorial(" +
                         std::to_string(n - 1) + ").";
        ev.sourceLine  = 6;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack   = cs;
        ev.variables["n"] = std::to_string(n);
        emitter.emit(ev);
    }

    long long sub = factorialImpl(n - 1, frameId + 1, frameId, frameStack, emitter);

    // Rebuild cs after sub-call returned
    std::vector<std::string> cs2;
    for (auto& f : frameStack) {
        cs2.push_back("factorial(" + std::to_string(f.n) + ")");
    }

    long long result = (long long)n * sub;

    // multiply_return event
    {
        TraceEvent ev;
        ev.eventType   = "multiply_return";
        ev.title       = "Return " + std::to_string(n) + " × " + std::to_string(sub) + " = " + std::to_string(result);
        ev.description = "factorial(" + std::to_string(n - 1) + ") returned " + std::to_string(sub) +
                         ". Multiply: " + std::to_string(n) + " × " + std::to_string(sub) +
                         " = " + std::to_string(result) + ". Pop frame.";
        ev.sourceLine  = 6;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack   = cs2;
        ev.variables["n"]      = std::to_string(n);
        ev.variables["sub"]    = std::to_string(sub);
        ev.variables["return"] = std::to_string(result);
        emitter.emit(ev);
    }

    frameStack.pop_back();
    return result;
}

void traceFactorial(int n, TraceEmitter& emitter) {
    if (n < 0) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Invalid Input";
        ev.description = "Factorial is undefined for negative integers. Input: " + std::to_string(n);
        ev.sourceLine = 1;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }
    if (n > 20) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Input Too Large";
        ev.description = "n=" + std::to_string(n) + " exceeds safe range for long long (max 20). Reduce input.";
        ev.sourceLine = 1;
        ev.isCompleted = true;
        emitter.emit(ev);
        return;
    }

    std::vector<FactorialFrame> frameStack;
    long long result = factorialImpl(n, 0, -1, frameStack, emitter);

    // completion
    TraceEvent ev;
    ev.eventType   = "complete";
    ev.title       = "factorial(" + std::to_string(n) + ") = " + std::to_string(result);
    ev.description = "All recursive calls have returned. Final result: " + std::to_string(n) + "! = " + std::to_string(result) + ".";
    ev.sourceLine  = 6;
    ev.isCompleted = true;
    ev.variables["result"] = std::to_string(result);
    emitter.emit(ev);
}

// ═════════════════════════════════════════════════════════════════════════════
// FIBONACCI
// ═════════════════════════════════════════════════════════════════════════════

struct FibFrame {
    int n;
    int frameId;
    int parentId;
};

static int fibFrameCounter = 0;
static int fibCallCount    = 0;

static long long fibImpl(
    int n,
    int frameId,
    int parentId,
    std::vector<FibFrame>& frameStack,
    TraceEmitter& emitter
) {
    fibCallCount++;
    frameStack.push_back({n, frameId, parentId});

    std::vector<std::string> cs;
    for (auto& f : frameStack) {
        cs.push_back("fib(" + std::to_string(f.n) + ")");
    }

    // function_enter
    {
        TraceEvent ev;
        ev.eventType     = "function_enter";
        ev.title         = "fibonacci(" + std::to_string(n) + ") called";
        ev.description   = "Entering fibonacci with n=" + std::to_string(n) +
                           ". Total calls so far: " + std::to_string(fibCallCount) +
                           ". Call depth: " + std::to_string((int)frameStack.size() - 1) + ".";
        ev.sourceLine    = 1;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack     = cs;
        ev.variables["n"]         = std::to_string(n);
        ev.variables["callCount"] = std::to_string(fibCallCount);
        emitter.emit(ev);
    }

    if (n <= 1) {
        TraceEvent ev;
        ev.eventType    = "base_case";
        ev.title        = "Base case: fibonacci(" + std::to_string(n) + ") = " + std::to_string(n);
        ev.description  = "n <= 1: return " + std::to_string(n) + " directly.";
        ev.sourceLine   = 3;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack    = cs;
        ev.variables["n"]      = std::to_string(n);
        ev.variables["return"] = std::to_string(n);
        emitter.emit(ev);

        frameStack.pop_back();
        return (long long)n;
    }

    // first recursive call
    {
        TraceEvent ev;
        ev.eventType    = "first_call";
        ev.title        = "Calling fibonacci(" + std::to_string(n - 1) + ") [left branch]";
        ev.description  = "Compute left subtree: fibonacci(" + std::to_string(n - 1) + ").";
        ev.sourceLine   = 6;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack    = cs;
        ev.variables["n"] = std::to_string(n);
        emitter.emit(ev);
    }

    int leftId = ++fibFrameCounter;
    long long left = fibImpl(n - 1, leftId, frameId, frameStack, emitter);

    std::vector<std::string> cs2;
    for (auto& f : frameStack) {
        cs2.push_back("fib(" + std::to_string(f.n) + ")");
    }

    // second recursive call
    {
        TraceEvent ev;
        ev.eventType    = "second_call";
        ev.title        = "Calling fibonacci(" + std::to_string(n - 2) + ") [right branch]";
        ev.description  = "Left branch returned " + std::to_string(left) +
                          ". Now compute right subtree: fibonacci(" + std::to_string(n - 2) + ").";
        ev.sourceLine   = 7;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack    = cs2;
        ev.variables["n"]    = std::to_string(n);
        ev.variables["left"] = std::to_string(left);
        emitter.emit(ev);
    }

    int rightId = ++fibFrameCounter;
    long long right = fibImpl(n - 2, rightId, frameId, frameStack, emitter);

    std::vector<std::string> cs3;
    for (auto& f : frameStack) {
        cs3.push_back("fib(" + std::to_string(f.n) + ")");
    }

    long long result = left + right;

    // add_return
    {
        TraceEvent ev;
        ev.eventType    = "add_return";
        ev.title        = "Return " + std::to_string(left) + " + " + std::to_string(right) + " = " + std::to_string(result);
        ev.description  = "Both branches returned. fibonacci(" + std::to_string(n) + ") = " +
                          std::to_string(left) + " + " + std::to_string(right) +
                          " = " + std::to_string(result) + ". Pop frame.";
        ev.sourceLine   = 8;
        ev.recursionDepth = (int)frameStack.size() - 1;
        ev.callStack    = cs3;
        ev.variables["n"]      = std::to_string(n);
        ev.variables["left"]   = std::to_string(left);
        ev.variables["right"]  = std::to_string(right);
        ev.variables["return"] = std::to_string(result);
        emitter.emit(ev);
    }

    frameStack.pop_back();
    return result;
}

void traceFibonacci(int n, TraceEmitter& emitter) {
    if (n < 0) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Invalid Input";
        ev.description = "Fibonacci is undefined for negative n. Input: " + std::to_string(n);
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    if (n > 15) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Input Too Large";
        ev.description = "n=" + std::to_string(n) + " would generate 2^n calls. Limit is 15 for safe visualization.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }

    fibFrameCounter = 0;
    fibCallCount    = 0;

    std::vector<FibFrame> frameStack;
    long long result = fibImpl(n, 0, -1, frameStack, emitter);

    TraceEvent ev;
    ev.eventType   = "complete";
    ev.title       = "fibonacci(" + std::to_string(n) + ") = " + std::to_string(result);
    ev.description = "Recursion complete. Total function calls: " + std::to_string(fibCallCount) +
                     ". Result: fibonacci(" + std::to_string(n) + ") = " + std::to_string(result) + ".";
    ev.sourceLine  = 8;
    ev.isCompleted = true;
    ev.variables["result"]    = std::to_string(result);
    ev.variables["callCount"] = std::to_string(fibCallCount);
    emitter.emit(ev);
}

// ═════════════════════════════════════════════════════════════════════════════
// TOWER OF HANOI
// ═════════════════════════════════════════════════════════════════════════════

struct PegState {
    std::vector<int> A; // source
    std::vector<int> B; // auxiliary
    std::vector<int> C; // destination
};

static int hanoiMoveCount = 0;

static std::string pegToStr(const std::vector<int>& p) {
    std::ostringstream ss;
    ss << "[";
    for (size_t i = 0; i < p.size(); ++i) {
        ss << p[i];
        if (i + 1 < p.size()) ss << ",";
    }
    ss << "]";
    return ss.str();
}

static std::vector<int>& getPeg(PegState& state, char peg) {
    if (peg == 'A') return state.A;
    if (peg == 'B') return state.B;
    return state.C;
}

static void hanoiImpl(
    int n,
    char src, char aux, char dst,
    int depth,
    std::vector<std::string>& frameStack,
    PegState& pegs,
    TraceEmitter& emitter
) {
    std::string frameStr = "hanoi(" + std::to_string(n) + "," + src + "->" + dst + ")";
    frameStack.push_back(frameStr);

    // function_enter
    {
        TraceEvent ev;
        ev.eventType     = "function_enter";
        ev.title         = "towerOfHanoi(n=" + std::to_string(n) + ", " + src + "→" + dst + ")";
        ev.description   = "Move " + std::to_string(n) + " disk(s) from " + src + " to " + dst +
                           " using " + aux + " as auxiliary. Depth=" + std::to_string(depth) + ".";
        ev.sourceLine    = 1;
        ev.recursionDepth = depth;
        ev.callStack     = frameStack;
        ev.variables["n"]   = std::to_string(n);
        ev.variables["src"] = std::string(1, src);
        ev.variables["dst"] = std::string(1, dst);
        ev.variables["aux"] = std::string(1, aux);
        ev.variables["A"]   = pegToStr(pegs.A);
        ev.variables["B"]   = pegToStr(pegs.B);
        ev.variables["C"]   = pegToStr(pegs.C);
        ev.passNumber = hanoiMoveCount;
        emitter.emit(ev);
    }

    if (n == 1) {
        // base case: move disk
        {
            TraceEvent ev;
            ev.eventType    = "base_move";
            ev.title        = "Base case: Move disk 1 from " + std::string(1, src) + " to " + std::string(1, dst);
            ev.description  = "n=1: directly move the smallest disk from " + std::string(1, src) +
                              " to " + std::string(1, dst) + ".";
            ev.sourceLine   = 3;
            ev.recursionDepth = depth;
            ev.callStack    = frameStack;
            ev.variables["n"]   = "1";
            ev.variables["src"] = std::string(1, src);
            ev.variables["dst"] = std::string(1, dst);
            emitter.emit(ev);
        }

        // perform move
        hanoiMoveCount++;
        std::vector<int>& srcPeg = getPeg(pegs, src);
        std::vector<int>& dstPeg = getPeg(pegs, dst);
        int disk = srcPeg.back();
        srcPeg.pop_back();
        dstPeg.push_back(disk);

        {
            TraceEvent ev;
            ev.eventType    = "disk_move";
            ev.title        = "Move disk " + std::to_string(disk) + ": " + src + " → " + dst +
                              " (move #" + std::to_string(hanoiMoveCount) + ")";
            ev.description  = "Disk " + std::to_string(disk) + " lifted from peg " + src +
                              " and placed on peg " + dst + ". Total moves: " + std::to_string(hanoiMoveCount) + ".";
            ev.sourceLine   = 4;
            ev.recursionDepth = depth;
            ev.callStack    = frameStack;
            ev.passNumber   = hanoiMoveCount;
            ev.variables["disk"] = std::to_string(disk);
            ev.variables["from"] = std::string(1, src);
            ev.variables["to"]   = std::string(1, dst);
            ev.variables["A"]    = pegToStr(pegs.A);
            ev.variables["B"]    = pegToStr(pegs.B);
            ev.variables["C"]    = pegToStr(pegs.C);
            emitter.emit(ev);
        }

        frameStack.pop_back();
        return;
    }

    // Step 1: move n-1 from src->aux
    {
        TraceEvent ev;
        ev.eventType    = "recursive_call_1";
        ev.title        = "Step 1: Move top " + std::to_string(n-1) + " disk(s) from " + src + " to " + aux;
        ev.description  = "Recursively move " + std::to_string(n-1) + " disk(s) using " + dst + " as auxiliary.";
        ev.sourceLine   = 7;
        ev.recursionDepth = depth;
        ev.callStack    = frameStack;
        ev.variables["n"]    = std::to_string(n);
        ev.variables["goal"] = std::string(1, src) + "->" + aux;
        emitter.emit(ev);
    }
    hanoiImpl(n - 1, src, dst, aux, depth + 1, frameStack, pegs, emitter);

    // Step 2: move nth disk src->dst
    {
        TraceEvent ev;
        ev.eventType    = "disk_move";
        std::vector<int>& srcPeg = getPeg(pegs, src);
        std::vector<int>& dstPeg = getPeg(pegs, dst);
        int disk = srcPeg.back();

        // emit intent before move
        ev.title        = "Step 2: Move disk " + std::to_string(disk) + " from " + src + " to " + dst;
        ev.description  = "Bottom disk of current subproblem: move disk " + std::to_string(disk) +
                          " from " + src + " to " + dst + ".";
        ev.sourceLine   = 9;
        ev.recursionDepth = depth;
        ev.callStack    = frameStack;
        ev.variables["n"]   = std::to_string(n);
        emitter.emit(ev);

        // perform move
        hanoiMoveCount++;
        srcPeg.pop_back();
        dstPeg.push_back(disk);

        TraceEvent ev2;
        ev2.eventType   = "disk_move";
        ev2.title       = "Moved disk " + std::to_string(disk) + ": " + src + " → " + dst +
                          " (move #" + std::to_string(hanoiMoveCount) + ")";
        ev2.description = "Disk " + std::to_string(disk) + " placed on peg " + dst + ".";
        ev2.sourceLine  = 9;
        ev2.recursionDepth = depth;
        ev2.callStack   = frameStack;
        ev2.passNumber  = hanoiMoveCount;
        ev2.variables["disk"] = std::to_string(disk);
        ev2.variables["from"] = std::string(1, src);
        ev2.variables["to"]   = std::string(1, dst);
        ev2.variables["A"]    = pegToStr(pegs.A);
        ev2.variables["B"]    = pegToStr(pegs.B);
        ev2.variables["C"]    = pegToStr(pegs.C);
        emitter.emit(ev2);
    }

    // Step 3: move n-1 from aux->dst
    {
        TraceEvent ev;
        ev.eventType    = "recursive_call_2";
        ev.title        = "Step 3: Move top " + std::to_string(n-1) + " disk(s) from " + aux + " to " + dst;
        ev.description  = "Recursively move " + std::to_string(n-1) + " disks from " + aux +
                          " to " + dst + " using " + src + " as auxiliary.";
        ev.sourceLine   = 11;
        ev.recursionDepth = depth;
        ev.callStack    = frameStack;
        ev.variables["n"]    = std::to_string(n);
        ev.variables["goal"] = std::string(1, aux) + "->" + dst;
        emitter.emit(ev);
    }
    hanoiImpl(n - 1, aux, src, dst, depth + 1, frameStack, pegs, emitter);

    frameStack.pop_back();
}

void traceTowerOfHanoi(int n, TraceEmitter& emitter) {
    if (n <= 0) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Invalid Input";
        ev.description = "Number of disks must be >= 1. Got: " + std::to_string(n);
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    if (n > 8) {
        TraceEvent ev;
        ev.eventType  = "error";
        ev.title      = "Input Too Large";
        ev.description = "n=" + std::to_string(n) + " would generate " + std::to_string((1 << n) - 1) +
                         " moves. Limit is 8 disks (255 moves) for safe visualization.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }

    hanoiMoveCount = 0;

    // Initialize pegs: A has disks n,n-1,...,1 (bottom to top)
    PegState pegs;
    for (int i = n; i >= 1; --i) pegs.A.push_back(i);

    std::vector<std::string> frameStack;
    hanoiImpl(n, 'A', 'B', 'C', 0, frameStack, pegs, emitter);

    int expectedMoves = (1 << n) - 1;
    TraceEvent ev;
    ev.eventType   = "complete";
    ev.title       = "Tower of Hanoi Complete: " + std::to_string(hanoiMoveCount) + " moves";
    ev.description = "All " + std::to_string(n) + " disks successfully moved from A to C. " +
                     "Total moves: " + std::to_string(hanoiMoveCount) +
                     " (expected: 2^" + std::to_string(n) + " - 1 = " + std::to_string(expectedMoves) + ").";
    ev.sourceLine  = 11;
    ev.isCompleted = true;
    ev.variables["totalMoves"]    = std::to_string(hanoiMoveCount);
    ev.variables["expectedMoves"] = std::to_string(expectedMoves);
    ev.variables["A"]  = pegToStr(pegs.A);
    ev.variables["B"]  = pegToStr(pegs.B);
    ev.variables["C"]  = pegToStr(pegs.C);
    emitter.emit(ev);
}

// ═════════════════════════════════════════════════════════════════════════════
// MAZE SOLVING
// ═════════════════════════════════════════════════════════════════════════════

static int mazeDepth = 0;
static int mazeStepLimit = 0;
static bool mazeLimitHit = false;

// Path serializer
static std::string pathToStr(const std::vector<std::pair<int,int>>& path) {
    std::ostringstream ss;
    ss << "[";
    for (size_t i = 0; i < path.size(); ++i) {
        ss << "(" << path[i].first << "," << path[i].second << ")";
        if (i + 1 < path.size()) ss << ",";
    }
    ss << "]";
    return ss.str();
}

// Produce snapshot of the grid as a flat arrayState for renderer
// Encoding: 0=open, 1=wall, 2=visited/candidate, 3=solution, 4=start, 5=goal
static std::vector<int> flattenGrid(
    const std::vector<std::vector<int>>& g,
    const std::vector<std::pair<int,int>>& path,
    int sr, int sc, int gr, int gc,
    bool solved
) {
    int rows = (int)g.size();
    int cols = rows > 0 ? (int)g[0].size() : 0;
    std::vector<int> flat(rows * cols, 0);
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            int val = g[r][c]; // 0=open, 1=wall, 2=visited
            flat[r * cols + c] = val;
        }
    }
    // mark path cells
    for (auto& p : path) flat[p.first * cols + p.second] = solved ? 3 : 2;
    // start/goal always on top
    flat[sr * cols + sc] = 4;
    flat[gr * cols + gc] = 5;
    return flat;
}

static bool mazeImpl(
    std::vector<std::vector<int>>& grid,
    int row, int col,
    int goalRow, int goalCol,
    int sr, int sc,
    std::vector<std::pair<int,int>>& path,
    std::vector<std::string>& callFrames,
    TraceEmitter& emitter
) {
    if (mazeLimitHit) return false;
    if (mazeStepLimit > 0 && (int)emitter.getEvents().size() > mazeStepLimit) {
        mazeLimitHit = true;
        return false;
    }

    mazeDepth++;
    int rows = (int)grid.size();
    int cols = rows > 0 ? (int)grid[0].size() : 0;
    std::string cellStr = "(" + std::to_string(row) + "," + std::to_string(col) + ")";
    std::string frame   = "solve" + cellStr;
    callFrames.push_back(frame);

    // function_enter
    {
        TraceEvent ev;
        ev.eventType     = "function_enter";
        ev.title         = "solveMaze" + cellStr;
        ev.description   = "Entered cell " + cellStr + ". Depth=" + std::to_string(mazeDepth) + ".";
        ev.sourceLine    = 1;
        ev.recursionDepth = mazeDepth;
        ev.callStack     = callFrames;
        ev.arrayState    = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        ev.variables["row"] = std::to_string(row);
        ev.variables["col"] = std::to_string(col);
        ev.variables["path"] = pathToStr(path);
        emitter.emit(ev);
    }

    // bounds check
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        TraceEvent ev;
        ev.eventType    = "cell_reject";
        ev.title        = "Reject " + cellStr + ": Out of bounds";
        ev.description  = "Cell " + cellStr + " is outside the grid (" + std::to_string(rows) + "×" + std::to_string(cols) + ").";
        ev.sourceLine   = 4;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        emitter.emit(ev);
        callFrames.pop_back();
        mazeDepth--;
        return false;
    }

    // wall check
    if (grid[row][col] == 1) {
        TraceEvent ev;
        ev.eventType    = "cell_reject";
        ev.title        = "Reject " + cellStr + ": Wall";
        ev.description  = "Cell " + cellStr + " is a wall (value=1). Cannot pass through.";
        ev.sourceLine   = 6;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        emitter.emit(ev);
        callFrames.pop_back();
        mazeDepth--;
        return false;
    }

    // visited check
    if (grid[row][col] == 2) {
        TraceEvent ev;
        ev.eventType    = "cell_reject";
        ev.title        = "Reject " + cellStr + ": Already visited";
        ev.description  = "Cell " + cellStr + " was already visited in the current path. Skip to avoid cycles.";
        ev.sourceLine   = 8;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        emitter.emit(ev);
        callFrames.pop_back();
        mazeDepth--;
        return false;
    }

    // mark visited and add to path
    grid[row][col] = 2;
    path.push_back({row, col});

    {
        TraceEvent ev;
        ev.eventType    = "cell_visit";
        ev.title        = "Visit " + cellStr;
        ev.description  = "Marked cell " + cellStr + " as visited. Added to candidate path.";
        ev.sourceLine   = 10;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        ev.variables["path"] = pathToStr(path);
        emitter.emit(ev);
    }

    // goal check
    if (row == goalRow && col == goalCol) {
        TraceEvent ev;
        ev.eventType    = "destination_reached";
        ev.title        = "Destination reached at " + cellStr + "!";
        ev.description  = "Goal (" + std::to_string(goalRow) + "," + std::to_string(goalCol) +
                          ") found! Path length: " + std::to_string(path.size()) + " cells.";
        ev.sourceLine   = 13;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, true);
        ev.variables["path"] = pathToStr(path);
        ev.isCompleted  = true;
        emitter.emit(ev);
        callFrames.pop_back();
        mazeDepth--;
        return true;
    }

    // explore neighbours: Down, Right, Up, Left
    int dr[] = {1, 0, -1, 0};
    int dc[] = {0, 1,  0, -1};
    const char* dirNames[] = {"Down", "Right", "Up", "Left"};

    for (int d = 0; d < 4; ++d) {
        if (mazeLimitHit) break;
        int nr = row + dr[d];
        int nc = col + dc[d];

        TraceEvent ev;
        ev.eventType    = "exploration_branch";
        ev.title        = "Explore " + std::string(dirNames[d]) + " from " + cellStr;
        ev.description  = "Trying direction " + std::string(dirNames[d]) +
                          " → (" + std::to_string(nr) + "," + std::to_string(nc) + ").";
        ev.sourceLine   = 17;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        emitter.emit(ev);

        if (mazeImpl(grid, nr, nc, goalRow, goalCol, sr, sc, path, callFrames, emitter)) {
            callFrames.pop_back();
            mazeDepth--;
            return true;
        }
    }

    // backtrack
    grid[row][col] = 0;
    path.pop_back();

    {
        TraceEvent ev;
        ev.eventType    = "backtrack";
        ev.title        = "Backtrack from " + cellStr;
        ev.description  = "All directions from " + cellStr + " failed. Remove from path and backtrack.";
        ev.sourceLine   = 22;
        ev.recursionDepth = mazeDepth;
        ev.callStack    = callFrames;
        ev.arrayState   = flattenGrid(grid, path, sr, sc, goalRow, goalCol, false);
        ev.variables["path"] = pathToStr(path);
        emitter.emit(ev);
    }

    callFrames.pop_back();
    mazeDepth--;
    return false;
}

void traceMazeSolve(
    const std::vector<std::vector<int>>& gridIn,
    int startRow, int startCol,
    int goalRow,  int goalCol,
    TraceEmitter& emitter
) {
    int rows = (int)gridIn.size();
    int cols = rows > 0 ? (int)gridIn[0].size() : 0;

    // Validate
    if (rows == 0 || cols == 0) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "Invalid Grid";
        ev.description = "Grid is empty.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    auto inBounds = [&](int r, int c) { return r >= 0 && r < rows && c >= 0 && c < cols; };
    if (!inBounds(startRow, startCol) || !inBounds(goalRow, goalCol)) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "Invalid Start/Goal";
        ev.description = "Start or goal cell is outside grid bounds.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    if (gridIn[startRow][startCol] == 1) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "Start is a Wall";
        ev.description = "Start cell (" + std::to_string(startRow) + "," + std::to_string(startCol) + ") is a wall.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    if (gridIn[goalRow][goalCol] == 1) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "Goal is a Wall";
        ev.description = "Goal cell (" + std::to_string(goalRow) + "," + std::to_string(goalCol) + ") is a wall.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }

    std::vector<std::vector<int>> grid = gridIn; // working copy
    std::vector<std::pair<int,int>> path;
    std::vector<std::string> callFrames;
    mazeDepth = 0;
    mazeLimitHit = false;
    mazeStepLimit = 2000;

    bool solved = mazeImpl(grid, startRow, startCol, goalRow, goalCol,
                           startRow, startCol, path, callFrames, emitter);

    TraceEvent ev;
    ev.eventType   = "complete";
    ev.isCompleted = true;
    if (mazeLimitHit) {
        ev.title       = "Trace limit reached";
        ev.description = "Execution exceeded " + std::to_string(mazeStepLimit) +
                         " events. Maze may be very large or the goal unreachable.";
    } else if (solved) {
        ev.title       = "Maze solved! Path length: " + std::to_string(path.size());
        ev.description = "Backtracking DFS found a path from (" + std::to_string(startRow) + "," +
                         std::to_string(startCol) + ") to (" + std::to_string(goalRow) + "," +
                         std::to_string(goalCol) + ") in " + std::to_string(path.size()) + " steps.";
    } else {
        ev.title       = "No path found";
        ev.description = "Goal (" + std::to_string(goalRow) + "," + std::to_string(goalCol) +
                         ") is unreachable from (" + std::to_string(startRow) + "," + std::to_string(startCol) + ").";
    }
    ev.sourceLine = 24;
    emitter.emit(ev);
}

// ═════════════════════════════════════════════════════════════════════════════
// N-QUEENS
// ═════════════════════════════════════════════════════════════════════════════

static int queensSolutionCount = 0;
static int queensStepLimit     = 0;
static bool queensLimitHit     = false;
static bool queensFindAll      = false;

static std::string boardToStr(const std::vector<int>& board, int rows) {
    std::ostringstream ss;
    ss << "[";
    for (int r = 0; r < rows; ++r) {
        ss << (board[r] >= 0 ? std::to_string(board[r]) : "-");
        if (r + 1 < rows) ss << ",";
    }
    ss << "]";
    return ss.str();
}

// Flat board: 0=empty, 1=queen, 2=conflict-highlight
static std::vector<int> flatBoard(const std::vector<int>& board, int n, int activeRow = -1, int activeCol = -1) {
    std::vector<int> flat(n * n, 0);
    for (int r = 0; r < n; ++r) {
        if (board[r] >= 0) flat[r * n + board[r]] = 1;
    }
    if (activeRow >= 0 && activeCol >= 0 && activeRow < n && activeCol < n) {
        flat[activeRow * n + activeCol] = 2;
    }
    return flat;
}

static bool queensImpl(
    int row, int n,
    std::vector<int>& board,
    std::vector<bool>& cols,
    std::vector<bool>& diag1,
    std::vector<bool>& diag2,
    std::vector<std::string>& callFrames,
    TraceEmitter& emitter
) {
    if (queensLimitHit) return false;
    if (queensStepLimit > 0 && (int)emitter.getEvents().size() > queensStepLimit) {
        queensLimitHit = true;
        return false;
    }

    std::string frame = "queens(row=" + std::to_string(row) + ")";
    callFrames.push_back(frame);

    // row_enter
    {
        TraceEvent ev;
        ev.eventType     = "row_enter";
        ev.title         = "Processing row " + std::to_string(row);
        ev.description   = "Attempting to place a queen in row " + std::to_string(row) +
                           " (0-indexed). Board so far: " + boardToStr(board, row) + ".";
        ev.sourceLine    = 1;
        ev.recursionDepth = row;
        ev.callStack     = callFrames;
        ev.arrayState    = flatBoard(board, n);
        ev.variables["row"] = std::to_string(row);
        emitter.emit(ev);
    }

    // solution found
    if (row == n) {
        queensSolutionCount++;
        TraceEvent ev;
        ev.eventType   = "solution_found";
        ev.title       = "Solution #" + std::to_string(queensSolutionCount) + " found!";
        ev.description = "All " + std::to_string(n) + " queens placed. Board: " + boardToStr(board, n) + ".";
        ev.sourceLine  = 9;
        ev.recursionDepth = row;
        ev.callStack   = callFrames;
        ev.arrayState  = flatBoard(board, n);
        ev.isCompleted = !queensFindAll;
        ev.variables["solutions"] = std::to_string(queensSolutionCount);
        emitter.emit(ev);

        callFrames.pop_back();
        return !queensFindAll; // stop after first if not findAll
    }

    for (int col = 0; col < n; ++col) {
        if (queensLimitHit) break;

        // candidate_column
        {
            TraceEvent ev;
            ev.eventType    = "candidate_column";
            ev.title        = "Try column " + std::to_string(col) + " in row " + std::to_string(row);
            ev.description  = "Checking if queen can be placed at (" + std::to_string(row) + "," + std::to_string(col) + ").";
            ev.sourceLine   = 11;
            ev.recursionDepth = row;
            ev.callStack    = callFrames;
            ev.arrayState   = flatBoard(board, n, row, col);
            ev.variables["row"] = std::to_string(row);
            ev.variables["col"] = std::to_string(col);
            emitter.emit(ev);
        }

        // conflict check
        bool colConflict  = cols[col];
        bool d1Conflict   = diag1[row - col + n - 1];
        bool d2Conflict   = diag2[row + col];
        bool hasConflict  = colConflict || d1Conflict || d2Conflict;

        if (hasConflict) {
            TraceEvent ev;
            ev.eventType    = "placement_rejected";
            std::string why = "";
            if (colConflict) why += "column " + std::to_string(col) + " occupied; ";
            if (d1Conflict)  why += "diagonal (row-col) conflict; ";
            if (d2Conflict)  why += "anti-diagonal (row+col) conflict; ";
            ev.title        = "Reject (" + std::to_string(row) + "," + std::to_string(col) + "): " + why;
            ev.description  = "Conflict detected: " + why + "Cannot place queen here.";
            ev.sourceLine   = 13;
            ev.recursionDepth = row;
            ev.callStack    = callFrames;
            ev.arrayState   = flatBoard(board, n, row, col);
            ev.variables["row"] = std::to_string(row);
            ev.variables["col"] = std::to_string(col);
            emitter.emit(ev);
            continue;
        }

        // place queen
        board[row] = col;
        cols[col] = true;
        diag1[row - col + n - 1] = true;
        diag2[row + col] = true;

        {
            TraceEvent ev;
            ev.eventType    = "queen_placed";
            ev.title        = "Place queen at (" + std::to_string(row) + "," + std::to_string(col) + ")";
            ev.description  = "No conflicts found. Queen placed at row " + std::to_string(row) +
                              ", column " + std::to_string(col) + ". Recurse to row " + std::to_string(row + 1) + ".";
            ev.sourceLine   = 16;
            ev.recursionDepth = row;
            ev.callStack    = callFrames;
            ev.arrayState   = flatBoard(board, n);
            ev.variables["board"] = boardToStr(board, n);
            emitter.emit(ev);
        }

        if (queensImpl(row + 1, n, board, cols, diag1, diag2, callFrames, emitter)) {
            callFrames.pop_back();
            return true;
        }

        // backtrack
        board[row] = -1;
        cols[col] = false;
        diag1[row - col + n - 1] = false;
        diag2[row + col] = false;

        {
            TraceEvent ev;
            ev.eventType    = "backtrack";
            ev.title        = "Backtrack: Remove queen from (" + std::to_string(row) + "," + std::to_string(col) + ")";
            ev.description  = "Row " + std::to_string(row + 1) + " could not be resolved with queen at column " +
                              std::to_string(col) + ". Remove queen and try next column.";
            ev.sourceLine   = 20;
            ev.recursionDepth = row;
            ev.callStack    = callFrames;
            ev.arrayState   = flatBoard(board, n);
            ev.variables["board"] = boardToStr(board, n);
            emitter.emit(ev);
        }
    }

    callFrames.pop_back();
    return false;
}

void traceNQueens(int n, bool findAll, TraceEmitter& emitter) {
    if (n <= 0) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "Invalid N";
        ev.description = "N must be >= 1. Got: " + std::to_string(n);
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }
    if (n > 10) {
        TraceEvent ev;
        ev.eventType  = "error"; ev.title = "N Too Large";
        ev.description = "N=" + std::to_string(n) + " exceeds limit of 10 for safe visualization.";
        ev.sourceLine = 1; ev.isCompleted = true;
        emitter.emit(ev); return;
    }

    queensSolutionCount = 0;
    queensLimitHit      = false;
    queensFindAll       = findAll;
    queensStepLimit     = 3000;

    std::vector<int>  board(n, -1);
    std::vector<bool> cols(n, false);
    std::vector<bool> diag1(2 * n - 1, false);
    std::vector<bool> diag2(2 * n - 1, false);
    std::vector<std::string> callFrames;

    queensImpl(0, n, board, cols, diag1, diag2, callFrames, emitter);

    TraceEvent ev;
    ev.eventType   = "search_complete";
    ev.isCompleted = true;
    if (queensLimitHit) {
        ev.title       = "Trace limit hit";
        ev.description = "Search exceeded " + std::to_string(queensStepLimit) + " events.";
    } else if (queensSolutionCount == 0) {
        ev.title       = "No solution exists for N=" + std::to_string(n);
        ev.description = "The N-Queens problem has no valid placement for N=" + std::to_string(n) + ".";
    } else {
        ev.title       = "Search complete: " + std::to_string(queensSolutionCount) +
                         (queensSolutionCount == 1 ? " solution" : " solutions") + " found";
        ev.description = "N-Queens for N=" + std::to_string(n) +
                         ": found " + std::to_string(queensSolutionCount) +
                         " solution(s)" + (findAll ? " (all-solutions mode)." : " (first-solution mode).");
    }
    ev.sourceLine = 20;
    ev.variables["n"]         = std::to_string(n);
    ev.variables["solutions"] = std::to_string(queensSolutionCount);
    emitter.emit(ev);
}
