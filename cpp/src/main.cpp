#include "../include/algorithms.hpp"
#include "../include/searching_sorting.hpp"
#include "../include/tree_heap_algorithms.hpp"
#include "../include/graph_algorithms.hpp"
#include "../include/recursion_algorithms.hpp"
#include "../include/linear_structure_algorithms.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <cstdlib>

static std::vector<int> parseArray(const std::string& str) {
    std::vector<int> result;
    if (str.empty()) return result;
    std::stringstream ss(str);
    std::string item;
    while (std::getline(ss, item, ',')) {
        size_t first = item.find_first_not_of(" \t\r\n");
        if (first == std::string::npos) continue;
        size_t last = item.find_last_not_of(" \t\r\n");
        std::string trimmed = item.substr(first, (last - first + 1));
        if (!trimmed.empty() && trimmed != "null" && trimmed != "NULL") {
            try {
                result.push_back(std::stoi(trimmed));
            } catch (...) {
                // Ignore malformed token
            }
        }
    }
    return result;
}

static std::vector<std::string> parseTokens(const std::string& str) {
    std::vector<std::string> result;
    if (str.empty()) return result;
    std::stringstream ss(str);
    std::string item;
    while (std::getline(ss, item, ',')) {
        size_t first = item.find_first_not_of(" \t\r\n");
        if (first == std::string::npos) continue;
        size_t last = item.find_last_not_of(" \t\r\n");
        std::string trimmed = item.substr(first, (last - first + 1));
        if (!trimmed.empty()) {
            result.push_back(trimmed);
        }
    }
    return result;
}

int main(int argc, char* argv[]) {
    std::string op = "array-basics";
    std::string arrStr = "10,20,30,40,50";
    int index = 0;
    int value = 99;
    int target = 42;
    int source = 0;
    int vertexCount = 0;
    int capacity = 5;
    std::string structure = "singly";
    bool directed = false;
    bool weighted = false;
    bool hasIndex = false;
    bool hasValue = false;
    bool hasTarget = false;
    bool hasSource = false;
    bool findAll = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--op" && i + 1 < argc) {
            op = argv[++i];
        } else if (arg == "--arr" && i + 1 < argc) {
            arrStr = argv[++i];
        } else if (arg == "--index" && i + 1 < argc) {
            index = std::atoi(argv[++i]);
            hasIndex = true;
        } else if (arg == "--value" && i + 1 < argc) {
            value = std::atoi(argv[++i]);
            hasValue = true;
        } else if (arg == "--target" && i + 1 < argc) {
            target = std::atoi(argv[++i]);
            hasTarget = true;
        } else if (arg == "--source" && i + 1 < argc) {
            source = std::atoi(argv[++i]);
            hasSource = true;
        } else if (arg == "--vertices" && i + 1 < argc) {
            vertexCount = std::atoi(argv[++i]);
        } else if (arg == "--capacity" && i + 1 < argc) {
            capacity = std::atoi(argv[++i]);
        } else if (arg == "--structure" && i + 1 < argc) {
            structure = argv[++i];
        } else if (arg == "--directed" && i + 1 < argc) {
            std::string d = argv[++i];
            directed = (d == "1" || d == "true");
        } else if (arg == "--weighted" && i + 1 < argc) {
            std::string w = argv[++i];
            weighted = (w == "1" || w == "true");
        } else if (arg == "--findall" && i + 1 < argc) {
            std::string fa = argv[++i];
            findAll = (fa == "1" || fa == "true");
        } else if (arg == "--code" && i + 1 < argc) {
            std::string codeOp = argv[++i];
            std::string code = linearStructureSource(codeOp, structure);
            if (code == "// C++ source code not available") {
                code = getRecursionSourceCode(codeOp);
            }
            if (code == "// C++ source code not available") {
                code = getGraphSourceCode(codeOp);
            }
            if (code == "// C++ source code not available") {
                code = getTreeHeapSourceCode(codeOp);
            }
            if (code == "// C++ source code not available") {
                code = getSearchingSortingSourceCode(codeOp);
            }
            if (code == "// C++ source code not available") {
                code = getCppSourceCode(codeOp);
            }
            std::cout << code << std::endl;
            return 0;
        }
    }

    // Graph operations check before array size validation
    bool isGraphOp = (op == "bfs" || op == "graph-bfs" ||
                      op == "dfs" || op == "graph-dfs" ||
                      op == "dijkstra" || op == "graph-dijkstra" ||
                      op == "bellman-ford" || op == "graph-bellman-ford" ||
                      op == "floyd-warshall" || op == "graph-floyd-warshall");

    bool isRecursionOp = (op == "factorial" || op == "fibonacci" ||
                          op == "tower-of-hanoi" || op == "maze" || op == "n-queens");

    std::vector<std::string> tokens = parseTokens(arrStr);
    std::vector<int> arr = parseArray(arrStr);

    // Safety checks: restrict max input size for non-graph/non-recursion operations
    if (!isGraphOp && !isRecursionOp && (tokens.size() > 30 || arr.size() > 30)) {
        std::cout << "[{\"error\": \"Input size exceeds maximum allowed 30 elements.\"}]" << std::endl;
        return 1;
    }

    TraceEmitter emitter;

    const bool isLinearStructureOp =
        op.find("queue-") == 0 || op.find("deque-") == 0 ||
        op == "deque-intro" || op == "list-create" || op == "list-traverse" ||
        op == "list-traverse-backward" || op == "list-insert-head" ||
        op == "list-insert-tail" || op == "list-insert-index" ||
        op == "list-delete-head" || op == "list-delete-tail" ||
        op == "list-delete-index" || op == "list-search" || op == "list-update" ||
        op == "list-reverse" || op == "list-length";
    if (isLinearStructureOp) {
        if (capacity <= 0 || capacity > 30) {
            std::cout << "[{\"error\": \"Capacity must be between 1 and 30.\"}]" << std::endl;
            return 1;
        }
        if ((op.find("queue-") == 0 || op.find("deque-") == 0 || op == "deque-intro") &&
            static_cast<int>(arr.size()) > capacity) {
            std::cout << "[{\"error\": \"Initial element count cannot exceed capacity.\"}]" << std::endl;
            return 1;
        }
        if (op.find("queue-") == 0) {
            traceQueueOperation(op, arr, capacity, value, emitter);
        } else if (op.find("deque-") == 0 || op == "deque-intro") {
            traceDequeOperation(op, arr, capacity, value, emitter);
        } else {
            traceLinkedListOperation(structure, op, arr, index, value, target, emitter);
        }
        std::cout << emitter.toJson();
        return 0;
    }

    // Array operations
    if (op == "array-basics") {
        traceArrayBasics(arr, emitter);
    } else if (op == "traversal") {
        traceArrayTraversal(arr, emitter);
    } else if (op == "access") {
        traceAccessByIndex(arr, index, emitter);
    } else if (op == "update") {
        traceUpdateElement(arr, index, value, emitter);
    } else if (op == "insert") {
        traceInsertElement(arr, index, value, emitter);
    } else if (op == "delete") {
        traceDeleteElement(arr, index, emitter);
    }
    // Searching and Sorting operations
    else if (op == "linear-search") {
        traceLinearSearchAlgorithm(arr, target, emitter);
    } else if (op == "binary-search") {
        traceBinarySearchAlgorithm(arr, target, emitter);
    } else if (op == "bubble-sort") {
        traceBubbleSortAlgorithm(arr, emitter);
    } else if (op == "selection-sort") {
        traceSelectionSortAlgorithm(arr, emitter);
    } else if (op == "insertion-sort") {
        traceInsertionSortAlgorithm(arr, emitter);
    } else if (op == "merge-sort") {
        traceMergeSortAlgorithm(arr, emitter);
    } else if (op == "quick-sort") {
        traceQuickSortAlgorithm(arr, emitter);
    }
    // Binary Tree operations
    else if (op == "binary-tree" || op == "tree-build") {
        traceBinaryTreeBuild(tokens, emitter);
    } else if (op == "tree-insert") {
        traceBinaryTreeInsert(tokens, (hasValue ? value : (hasTarget ? target : 99)), emitter);
    } else if (op == "tree-search") {
        traceBinaryTreeSearch(tokens, (hasTarget ? target : (hasValue ? value : 42)), emitter);
    } else if (op == "tree-size") {
        traceBinaryTreeSize(tokens, emitter);
    } else if (op == "tree-height") {
        traceBinaryTreeHeight(tokens, emitter);
    } else if (op == "tree-leaves") {
        traceBinaryTreeLeaves(tokens, emitter);
    }
    // Traversals
    else if (op == "traversals" || op == "traversal-preorder" || op == "preorder") {
        tracePreorder(tokens, emitter);
    } else if (op == "traversal-inorder" || op == "inorder") {
        traceInorder(tokens, emitter);
    } else if (op == "traversal-postorder" || op == "postorder") {
        tracePostorder(tokens, emitter);
    } else if (op == "traversal-level-order" || op == "level-order") {
        traceLevelOrder(tokens, emitter);
    }
    // BST operations
    else if (op == "binary-search-tree" || op == "bst-insert") {
        traceBstInsert(arr, (hasValue ? value : (hasTarget ? target : 99)), emitter);
    } else if (op == "bst-search") {
        traceBstSearch(arr, (hasTarget ? target : (hasValue ? value : 42)), emitter);
    } else if (op == "bst-delete") {
        traceBstDelete(arr, (hasTarget ? target : (hasValue ? value : 42)), emitter);
    } else if (op == "bst-min") {
        traceBstFindMin(arr, emitter);
    } else if (op == "bst-max") {
        traceBstFindMax(arr, emitter);
    } else if (op == "bst-inorder") {
        traceBstInorder(arr, emitter);
    } else if (op == "bst-pred-succ") {
        traceBstPredSucc(arr, (hasTarget ? target : (hasValue ? value : 42)), emitter);
    }
    // Min/Max Heap operations
    else if (op == "min-heap" || op == "min-heap-build") {
        traceHeapBuild(arr, true, emitter);
    } else if (op == "min-heap-insert") {
        traceHeapInsert(arr, (hasValue ? value : (hasTarget ? target : 99)), true, emitter);
    } else if (op == "min-heap-extract") {
        traceHeapExtract(arr, true, emitter);
    } else if (op == "min-heap-peek") {
        traceHeapPeek(arr, true, emitter);
    } else if (op == "max-heap" || op == "max-heap-build") {
        traceHeapBuild(arr, false, emitter);
    } else if (op == "max-heap-insert") {
        traceHeapInsert(arr, (hasValue ? value : (hasTarget ? target : 99)), false, emitter);
    } else if (op == "max-heap-extract") {
        traceHeapExtract(arr, false, emitter);
    } else if (op == "max-heap-peek") {
        traceHeapPeek(arr, false, emitter);
    }
    // Graph operations
    else if (op == "bfs" || op == "graph-bfs") {
        CppGraph g = (arrStr == "sample" || arrStr.empty()) 
            ? createSampleGraph("bfs") 
            : parseGraphFromTokens(vertexCount, directed, weighted, arrStr);
        int startV = hasSource ? source : (hasValue ? value : 0);
        int targetV = hasTarget ? target : -1;
        traceBfs(g, startV, targetV, emitter);
    } else if (op == "dfs" || op == "graph-dfs") {
        CppGraph g = (arrStr == "sample" || arrStr.empty()) 
            ? createSampleGraph("dfs") 
            : parseGraphFromTokens(vertexCount, directed, weighted, arrStr);
        int startV = hasSource ? source : (hasValue ? value : 0);
        traceDfs(g, startV, emitter);
    } else if (op == "dijkstra" || op == "graph-dijkstra") {
        CppGraph g = (arrStr == "sample" || arrStr.empty()) 
            ? createSampleGraph("dijkstra") 
            : parseGraphFromTokens(vertexCount, directed, weighted, arrStr);
        int src = hasSource ? source : (hasValue ? value : 0);
        int targetV = hasTarget ? target : -1;
        traceDijkstra(g, src, targetV, emitter);
    } else if (op == "bellman-ford" || op == "graph-bellman-ford") {
        CppGraph g = (arrStr == "sample" || arrStr.empty()) 
            ? createSampleGraph("bellman-ford") 
            : parseGraphFromTokens(vertexCount, directed, weighted, arrStr);
        int src = hasSource ? source : (hasValue ? value : 0);
        int targetV = hasTarget ? target : -1;
        traceBellmanFord(g, src, targetV, emitter);
    } else if (op == "floyd-warshall" || op == "graph-floyd-warshall") {
        CppGraph g = (arrStr == "sample" || arrStr.empty()) 
            ? createSampleGraph("floyd-warshall") 
            : parseGraphFromTokens(vertexCount, directed, weighted, arrStr);
        int src = hasSource ? source : (hasValue ? value : 0);
        int targetV = hasTarget ? target : -1;
        traceFloydWarshall(g, src, targetV, emitter);
    }
    // Recursion: Factorial
    else if (op == "factorial") {
        int n = hasValue ? value : (hasTarget ? target : (arr.empty() ? 5 : arr[0]));
        traceFactorial(n, emitter);
    }
    // Recursion: Fibonacci
    else if (op == "fibonacci") {
        int n = hasValue ? value : (hasTarget ? target : (arr.empty() ? 6 : arr[0]));
        traceFibonacci(n, emitter);
    }
    // Recursion: Tower of Hanoi
    else if (op == "tower-of-hanoi") {
        int n = hasValue ? value : (hasTarget ? target : (arr.empty() ? 3 : arr[0]));
        traceTowerOfHanoi(n, emitter);
    }
    // Backtracking: Maze
    else if (op == "maze") {
        // arrStr encodes: rows;cols;grid_flat;startRow;startCol;goalRow;goalCol
        // e.g. "4;4;0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0;0;0;3;3"
        std::vector<std::vector<int>> grid;
        int sr = 0, sc = 0, gr = 3, gc = 3;
        // Parse custom format or use default 4x4 maze
        bool usedCustom = false;
        if (arrStr != "sample" && arrStr != "10,20,30,40,50" && !arrStr.empty()) {
            // Try to parse rows;cols;flat;sr;sc;gr;gc
            std::istringstream ss(arrStr);
            std::string part;
            std::vector<std::string> parts;
            while (std::getline(ss, part, ';')) parts.push_back(part);
            if (parts.size() >= 7) {
                int rows = std::atoi(parts[0].c_str());
                int cols = std::atoi(parts[1].c_str());
                // parse flat grid
                std::vector<int> flat;
                std::istringstream fs(parts[2]);
                std::string tok;
                while (std::getline(fs, tok, ',')) {
                    if (!tok.empty()) flat.push_back(std::atoi(tok.c_str()));
                }
                if (rows > 0 && cols > 0 && (int)flat.size() == rows * cols) {
                    grid.resize(rows, std::vector<int>(cols));
                    for (int r = 0; r < rows; ++r)
                        for (int c = 0; c < cols; ++c)
                            grid[r][c] = flat[r * cols + c];
                    sr = std::atoi(parts[3].c_str());
                    sc = std::atoi(parts[4].c_str());
                    gr = std::atoi(parts[5].c_str());
                    gc = std::atoi(parts[6].c_str());
                    usedCustom = true;
                }
            }
        }
        if (!usedCustom) {
            // Default 5x5 maze
            grid = {
                {0,0,1,0,0},
                {0,1,1,0,1},
                {0,0,0,0,1},
                {1,1,0,1,0},
                {0,0,0,0,0}
            };
            sr = 0; sc = 0; gr = 4; gc = 4;
        }
        traceMazeSolve(grid, sr, sc, gr, gc, emitter);
    }
    // Backtracking: N-Queens
    else if (op == "n-queens") {
        int n = hasValue ? value : (hasTarget ? target : (arr.empty() ? 6 : arr[0]));
        traceNQueens(n, findAll, emitter);
    }
    else {
        std::cout << "[{\"error\": \"Unknown operation: " << op << "\"}]" << std::endl;
        return 1;
    }

    std::cout << emitter.toJson();
    return 0;
}
