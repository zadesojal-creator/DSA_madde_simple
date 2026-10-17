#ifndef GRAPH_ALGORITHMS_HPP
#define GRAPH_ALGORITHMS_HPP

#include <vector>
#include <string>
#include "trace_event.hpp"

struct GraphEdge {
    int to;
    int weight;
    int id;
};

class CppGraph {
public:
    int vertexCount;
    bool directed;
    bool weighted;
    std::vector<std::vector<GraphEdge>> adj;
    std::vector<std::string> vertexLabels;

    explicit CppGraph(int v = 0, bool dir = false, bool w = false)
        : vertexCount(v), directed(dir), weighted(w), adj(v), vertexLabels(v) {
        for (int i = 0; i < v; ++i) {
            vertexLabels[i] = std::to_string(i);
        }
    }

    void addEdge(int u, int v, int weight = 1, int id = 0) {
        if (u < 0 || u >= vertexCount || v < 0 || v >= vertexCount) return;
        adj[u].push_back({v, weight, id});
        if (!directed && u != v) {
            adj[v].push_back({u, weight, id});
        }
    }
};

// Graph Parsing and Sample Construction
CppGraph parseGraphFromTokens(int vertexCount, bool directed, bool weighted, const std::string& edgeTokens);
CppGraph createSampleGraph(const std::string& algorithmId);

// Snapshot capturing helper
void captureGraphSnapshot(
    const CppGraph& g, 
    const std::vector<std::string>& vertexStates,
    const std::vector<int>& distances,
    const std::vector<int>& predecessors,
    const std::vector<int>& discoveryTimes,
    const std::vector<int>& finishTimes,
    const std::vector<std::string>& edgeStates,
    std::vector<GraphVertexSnapshot>& outVertices,
    std::vector<GraphEdgeSnapshot>& outEdges
);

// Graph Algorithm Visualizer Tracers
void traceBfs(const CppGraph& g, int startVertex, int targetVertex, TraceEmitter& emitter);
void traceDfs(const CppGraph& g, int startVertex, TraceEmitter& emitter);
void traceDijkstra(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter);
void traceBellmanFord(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter);
void traceFloydWarshall(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter);

// Canonical C++ Source Code Provider
std::string getGraphSourceCode(const std::string& op);

#endif // GRAPH_ALGORITHMS_HPP
