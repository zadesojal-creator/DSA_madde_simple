#include "../include/graph_algorithms.hpp"
#include <iostream>
#include <cassert>
#include <vector>
#include <string>

void testGraphModel() {
    std::cout << "Testing Graph Model..." << std::endl;

    // 1. Empty and Single Vertex Graph
    CppGraph gEmpty(0);
    assert(gEmpty.vertexCount == 0);

    CppGraph gSingle(1);
    assert(gSingle.vertexCount == 1);
    assert(gSingle.adj[0].empty());

    // 2. Isolated vertices
    CppGraph gIso(4, false, false);
    gIso.addEdge(0, 1, 1, 1);
    // vertices 2 and 3 remain isolated
    assert(gIso.adj[0].size() == 1);
    assert(gIso.adj[1].size() == 1);
    assert(gIso.adj[2].empty());
    assert(gIso.adj[3].empty());

    // 3. Directed vs Undirected
    CppGraph gDir(3, true, true);
    gDir.addEdge(0, 1, 5, 1);
    assert(gDir.adj[0].size() == 1);
    assert(gDir.adj[0][0].to == 1);
    assert(gDir.adj[0][0].weight == 5);
    assert(gDir.adj[1].empty());

    CppGraph gUndir(3, false, true);
    gUndir.addEdge(0, 1, 5, 1);
    assert(gUndir.adj[0].size() == 1);
    assert(gUndir.adj[1].size() == 1);
    assert(gUndir.adj[1][0].to == 0);
    assert(gUndir.adj[1][0].weight == 5);

    // 4. Invalid endpoints rejection
    CppGraph gBounds(3);
    gBounds.addEdge(-1, 2);
    gBounds.addEdge(1, 5);
    assert(gBounds.adj[0].empty());
    assert(gBounds.adj[1].empty());
    assert(gBounds.adj[2].empty());

    // 5. Deterministic adjacency order preserved
    CppGraph gOrder(4, true);
    gOrder.addEdge(0, 3);
    gOrder.addEdge(0, 1);
    gOrder.addEdge(0, 2);
    assert(gOrder.adj[0].size() == 3);
    assert(gOrder.adj[0][0].to == 3);
    assert(gOrder.adj[0][1].to == 1);
    assert(gOrder.adj[0][2].to == 2);

    // 6. Token Parsing
    CppGraph gParsed = parseGraphFromTokens(4, false, true, "0-1:10, 1-2:20, 2-3:30");
    assert(gParsed.vertexCount >= 4);
    assert(gParsed.adj[0].size() == 1);
    assert(gParsed.adj[0][0].to == 1);
    assert(gParsed.adj[0][0].weight == 10);

    std::cout << "  ✓ Graph Model tests passed." << std::endl;
}

void testBfs() {
    std::cout << "Testing Breadth-First Search (BFS)..." << std::endl;

    // 1. Single vertex
    {
        CppGraph g(1);
        TraceEmitter emitter;
        traceBfs(g, 0, 0, emitter);
        assert(!emitter.getEvents().empty());
        assert(emitter.getEvents().back().isCompleted);
    }

    // 2. Branching & Cycle graph
    {
        CppGraph g = createSampleGraph("bfs");
        TraceEmitter emitter;
        traceBfs(g, 0, 5, emitter);
        const auto& events = emitter.getEvents();
        assert(events.size() > 5);

        // Final event should have distance to reachable target
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        assert(!lastEv.reconstructedPath.empty());
        assert(lastEv.reconstructedPath.front() == 0);
        assert(lastEv.reconstructedPath.back() == 5);
        assert(lastEv.reconstructedPath.size() == 4);
    }

    // 3. Disconnected graph & unreachable target
    {
        CppGraph g(5, false, false);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        // 3 and 4 are in a separate component
        g.addEdge(3, 4);

        TraceEmitter emitter;
        traceBfs(g, 0, 4, emitter);
        const auto& events = emitter.getEvents();
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        // Vertex 4 is unreachable, so reconstructed path to 4 should be empty
        assert(lastEv.reconstructedPath.empty());
        // Traversal should have visited only 0, 1, 2
        assert(lastEv.traversalOutput.size() == 3);
    }

    std::cout << "  ✓ BFS tests passed." << std::endl;
}

void testDfs() {
    std::cout << "Testing Depth-First Search (DFS)..." << std::endl;

    // 1. Single vertex
    {
        CppGraph g(1);
        TraceEmitter emitter;
        traceDfs(g, 0, emitter);
        assert(!emitter.getEvents().empty());
        assert(emitter.getEvents().back().isCompleted);
        assert(emitter.getEvents().back().traversalOutput.size() == 1);
    }

    // 2. Cyclic directed graph
    {
        CppGraph g = createSampleGraph("dfs");
        TraceEmitter emitter;
        traceDfs(g, 0, emitter);
        const auto& events = emitter.getEvents();
        assert(events.size() > 5);
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        assert(lastEv.traversalOutput.size() == 6);
    }

    // 3. Disconnected graph
    {
        CppGraph g(4, true, false);
        g.addEdge(0, 1);
        // 2 -> 3 is unreachable from 0
        g.addEdge(2, 3);
        TraceEmitter emitter;
        traceDfs(g, 0, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        // Only 0 and 1 are reachable from 0
        assert(lastEv.traversalOutput.size() == 2);
    }

    std::cout << "  ✓ DFS tests passed." << std::endl;
}

void testDijkstra() {
    std::cout << "Testing Dijkstra's Algorithm..." << std::endl;

    // 1. Standard positive weights
    {
        CppGraph g = createSampleGraph("dijkstra");
        TraceEmitter emitter;
        traceDijkstra(g, 0, 4, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        assert(!lastEv.reconstructedPath.empty());
        assert(lastEv.reconstructedPath.front() == 0);
        assert(lastEv.reconstructedPath.back() == 4);
    }

    // 2. Negative weight rejection
    {
        CppGraph g(3, true, true);
        g.addEdge(0, 1, -5);
        g.addEdge(1, 2, 2);
        TraceEmitter emitter;
        traceDijkstra(g, 0, 2, emitter);
        const auto& events = emitter.getEvents();
        assert(events.size() == 1);
        assert(events[0].eventType == "error");
        assert(events[0].variables.at("error") == "NegativeWeightNotAllowed");
    }

    // 3. Zero-weight edge
    {
        CppGraph g(3, true, true);
        g.addEdge(0, 1, 0);
        g.addEdge(1, 2, 4);
        TraceEmitter emitter;
        traceDijkstra(g, 0, 2, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        assert(lastEv.reconstructedPath.size() == 3);
    }

    // 4. Source == Target
    {
        CppGraph g(2, true, true);
        g.addEdge(0, 1, 10);
        TraceEmitter emitter;
        traceDijkstra(g, 0, 0, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        assert(lastEv.reconstructedPath.size() == 1);
        assert(lastEv.reconstructedPath[0] == 0);
    }

    // 5. Unreachable vertex
    {
        CppGraph g(3, true, true);
        g.addEdge(0, 1, 5);
        // Vertex 2 has no incoming edges
        TraceEmitter emitter;
        traceDijkstra(g, 0, 2, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        assert(lastEv.reconstructedPath.empty());
    }

    std::cout << "  ✓ Dijkstra tests passed." << std::endl;
}

void testBellmanFord() {
    std::cout << "Testing Bellman-Ford Algorithm..." << std::endl;

    // 1. Graph with negative edges but NO negative cycles
    {
        CppGraph g = createSampleGraph("bellman-ford");
        TraceEmitter emitter;
        traceBellmanFord(g, 0, 4, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        assert(!lastEv.hasNegativeCycle);
        assert(!lastEv.reconstructedPath.empty());
        assert(lastEv.reconstructedPath.front() == 0);
        assert(lastEv.reconstructedPath.back() == 4);
    }

    // 2. Reachable negative cycle detection
    {
        CppGraph g(4, true, true);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, 2);
        g.addEdge(2, 3, -10); // cycle 1 -> 2 -> 3 -> 1 total cost = 2 - 10 + 1 = -7
        g.addEdge(3, 1, 1);
        TraceEmitter emitter;
        traceBellmanFord(g, 0, 3, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        assert(lastEv.hasNegativeCycle);
    }

    // 3. Early termination when no updates occur
    {
        CppGraph g(4, true, true);
        g.addEdge(0, 1, 2);
        g.addEdge(1, 2, 3);
        g.addEdge(2, 3, 4);
        TraceEmitter emitter;
        traceBellmanFord(g, 0, 3, emitter);
        bool foundEarly = false;
        for (const auto& ev : emitter.getEvents()) {
            if (ev.eventType == "early_termination") {
                foundEarly = true;
                break;
            }
        }
        assert(foundEarly);
    }

    std::cout << "  ✓ Bellman-Ford tests passed." << std::endl;
}

void testFloydWarshall() {
    std::cout << "Testing Floyd-Warshall Algorithm..." << std::endl;

    // 1. Standard all-pairs shortest paths
    {
        CppGraph g = createSampleGraph("floyd-warshall");
        TraceEmitter emitter;
        traceFloydWarshall(g, 0, 3, emitter);
        const auto& events = emitter.getEvents();
        assert(!events.empty());
        const auto& lastEv = events.back();
        assert(lastEv.isCompleted);
        assert(!lastEv.hasNegativeCycle);
        assert(!lastEv.distanceMatrix.empty());
        // Diagonal should be 0
        for (size_t i = 0; i < lastEv.distanceMatrix.size(); ++i) {
            assert(lastEv.distanceMatrix[i][i] == 0);
        }
        assert(!lastEv.reconstructedPath.empty());
        assert(lastEv.reconstructedPath.front() == 0);
        assert(lastEv.reconstructedPath.back() == 3);
    }

    // 2. Negative cycle detection
    {
        CppGraph g(3, true, true);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, -5);
        g.addEdge(2, 0, 2); // 1 - 5 + 2 = -2 cycle
        TraceEmitter emitter;
        traceFloydWarshall(g, 0, 2, emitter);
        const auto& lastEv = emitter.getEvents().back();
        assert(lastEv.isCompleted);
        assert(lastEv.hasNegativeCycle);
    }

    std::cout << "  ✓ Floyd-Warshall tests passed." << std::endl;
}

void testSourceCodeRetrieval() {
    std::cout << "Testing Graph Source Code Retrieval..." << std::endl;

    assert(getGraphSourceCode("bfs").find("void bfs") != std::string::npos);
    assert(getGraphSourceCode("dfs").find("void dfs") != std::string::npos);
    assert(getGraphSourceCode("dijkstra").find("void dijkstra") != std::string::npos);
    assert(getGraphSourceCode("bellman-ford").find("bool bellmanFord") != std::string::npos);
    assert(getGraphSourceCode("floyd-warshall").find("void floydWarshall") != std::string::npos);

    std::cout << "  ✓ Source Code Retrieval tests passed." << std::endl;
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  C++ Graph Algorithms Unit Test Suite  " << std::endl;
    std::cout << "========================================" << std::endl;

    testGraphModel();
    testBfs();
    testDfs();
    testDijkstra();
    testBellmanFord();
    testFloydWarshall();
    testSourceCodeRetrieval();

    std::cout << "========================================" << std::endl;
    std::cout << "  ALL C++ GRAPH TESTS PASSED (100%)!    " << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
