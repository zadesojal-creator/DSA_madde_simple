#include "../include/graph_algorithms.hpp"
#include <iostream>
#include <sstream>
#include <queue>
#include <algorithm>
#include <map>
#include <set>

static const int GRAPH_INF = 1000000000;

// Helper to convert comma/space separated edge tokens
CppGraph parseGraphFromTokens(int vertexCount, bool directed, bool weighted, const std::string& edgeTokens) {
    std::vector<std::string> tokens;
    if (!edgeTokens.empty() && edgeTokens != "sample") {
        std::stringstream ss(edgeTokens);
        std::string item;
        while (std::getline(ss, item, ',')) {
            size_t first = item.find_first_not_of(" \t\r\n");
            if (first == std::string::npos) continue;
            size_t last = item.find_last_not_of(" \t\r\n");
            tokens.push_back(item.substr(first, last - first + 1));
        }
    }

    int maxV = vertexCount - 1;
    struct ParsedEdge {
        int u;
        int v;
        int w;
    };
    std::vector<ParsedEdge> parsed;

    for (const auto& tok : tokens) {
        // format: u-v or u-v:w
        size_t dash = tok.find('-');
        if (dash == std::string::npos) continue;
        std::string uStr = tok.substr(0, dash);
        std::string rest = tok.substr(dash + 1);

        size_t colon = rest.find(':');
        std::string vStr = (colon == std::string::npos) ? rest : rest.substr(0, colon);
        std::string wStr = (colon == std::string::npos) ? "1" : rest.substr(colon + 1);

        try {
            int u = std::stoi(uStr);
            int v = std::stoi(vStr);
            int w = weighted ? std::stoi(wStr) : 1;
            parsed.push_back({u, v, w});
            if (u > maxV) maxV = u;
            if (v > maxV) maxV = v;
        } catch (...) {
            // ignore malformed token
        }
    }

    int totalV = std::max(vertexCount, maxV + 1);
    if (totalV <= 0) totalV = 1;

    CppGraph g(totalV, directed, weighted);
    int edgeId = 1;
    for (const auto& pe : parsed) {
        g.addEdge(pe.u, pe.v, pe.w, edgeId++);
    }
    return g;
}

CppGraph createSampleGraph(const std::string& algorithmId) {
    if (algorithmId == "bfs") {
        // 6 vertices, undirected, unweighted
        CppGraph g(6, false, false);
        g.addEdge(0, 1, 1, 1);
        g.addEdge(0, 2, 1, 2);
        g.addEdge(1, 3, 1, 3);
        g.addEdge(1, 4, 1, 4);
        g.addEdge(2, 4, 1, 5);
        g.addEdge(3, 5, 1, 6);
        g.addEdge(4, 5, 1, 7);
        return g;
    }
    if (algorithmId == "dfs") {
        // 6 vertices, directed, unweighted
        CppGraph g(6, true, false);
        g.addEdge(0, 1, 1, 1);
        g.addEdge(0, 2, 1, 2);
        g.addEdge(1, 3, 1, 3);
        g.addEdge(2, 3, 1, 4);
        g.addEdge(3, 4, 1, 5);
        g.addEdge(4, 5, 1, 6);
        g.addEdge(5, 2, 1, 7); // cycle / back edge
        return g;
    }
    if (algorithmId == "dijkstra") {
        // 5 vertices, directed, non-negative weights
        CppGraph g(5, true, true);
        g.addEdge(0, 1, 4, 1);
        g.addEdge(0, 2, 2, 2);
        g.addEdge(1, 2, 1, 3);
        g.addEdge(1, 3, 5, 4);
        g.addEdge(2, 3, 8, 5);
        g.addEdge(2, 4, 10, 6);
        g.addEdge(3, 4, 2, 7);
        return g;
    }
    if (algorithmId == "bellman-ford") {
        // 5 vertices, directed, with negative weight (no negative cycle)
        CppGraph g(5, true, true);
        g.addEdge(0, 1, 4, 1);
        g.addEdge(0, 2, 2, 2);
        g.addEdge(1, 2, -1, 3);
        g.addEdge(1, 3, 2, 4);
        g.addEdge(2, 3, 3, 5);
        g.addEdge(3, 4, 2, 6);
        return g;
    }
    if (algorithmId == "floyd-warshall") {
        // 4 vertices, directed, weighted
        CppGraph g(4, true, true);
        g.addEdge(0, 1, 3, 1);
        g.addEdge(0, 2, 8, 2);
        g.addEdge(1, 2, 2, 3);
        g.addEdge(1, 3, 5, 4);
        g.addEdge(2, 3, 1, 5);
        g.addEdge(3, 0, 2, 6);
        return g;
    }
    // Default fallback
    CppGraph g(4, false, false);
    g.addEdge(0, 1, 1, 1);
    g.addEdge(1, 2, 1, 2);
    g.addEdge(2, 3, 1, 3);
    return g;
}

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
) {
    outVertices.clear();
    outEdges.clear();

    for (int i = 0; i < g.vertexCount; ++i) {
        std::string st = (i < (int)vertexStates.size()) ? vertexStates[i] : "unvisited";
        int dist = (i < (int)distances.size()) ? distances[i] : GRAPH_INF;
        bool hasDist = (dist != GRAPH_INF && dist >= 0);
        int pred = (i < (int)predecessors.size()) ? predecessors[i] : -1;
        int dt = (i < (int)discoveryTimes.size()) ? discoveryTimes[i] : -1;
        int ft = (i < (int)finishTimes.size()) ? finishTimes[i] : -1;
        outVertices.push_back(GraphVertexSnapshot(i, g.vertexLabels[i], st, dist, hasDist, pred, dt, ft));
    }

    std::set<std::pair<int, int>> seenEdges;
    int edgeIdx = 0;
    for (int u = 0; u < g.vertexCount; ++u) {
        for (const auto& e : g.adj[u]) {
            int v = e.to;
            if (!g.directed) {
                int small = std::min(u, v);
                int big = std::max(u, v);
                if (seenEdges.count({small, big})) continue;
                seenEdges.insert({small, big});
            }
            std::string st = (edgeIdx < (int)edgeStates.size()) ? edgeStates[edgeIdx] : "normal";
            outEdges.push_back(GraphEdgeSnapshot(u, v, e.weight, g.directed, st));
            edgeIdx++;
        }
    }
}

// -------------------------------------------------------------
// 1. Breadth-First Search (BFS)
// -------------------------------------------------------------
void traceBfs(const CppGraph& g, int startVertex, int targetVertex, TraceEmitter& emitter) {
    int V = g.vertexCount;
    if (startVertex < 0 || startVertex >= V) startVertex = 0;

    std::vector<std::string> vStates(V, "unvisited");
    std::vector<int> dist(V, GRAPH_INF);
    std::vector<int> parent(V, -1);
    std::vector<int> dt(V, -1);
    std::vector<int> ft(V, -1);
    std::vector<std::string> eStates;
    std::vector<int> visitOrder;

    // Initialization step
    dist[startVertex] = 0;
    vStates[startVertex] = "in_queue";
    std::queue<int> q;
    q.push(startVertex);

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "BFS Initialized at Vertex " + std::to_string(startVertex);
    ev.description = "Queue initialized with start vertex. Distance to start is 0.";
    ev.sourceLine = 4;
    ev.activeVertexId = startVertex;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
    ev.queueState.push_back(std::to_string(startVertex));
    emitter.emit(ev);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        vStates[u] = "active";
        visitOrder.push_back(u);

        ev = TraceEvent();
        ev.eventType = "vertex_visit";
        ev.title = "Visit Vertex " + std::to_string(u);
        ev.description = "Popped vertex " + std::to_string(u) + " from queue front. Distance = " + std::to_string(dist[u]) + ".";
        ev.sourceLine = 9;
        ev.activeVertexId = u;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
        ev.traversalOutput = visitOrder;

        // Populate queueState snapshot
        std::queue<int> tempQ = q;
        while (!tempQ.empty()) {
            ev.queueState.push_back(std::to_string(tempQ.front()));
            tempQ.pop();
        }
        emitter.emit(ev);

        for (const auto& edge : g.adj[u]) {
            int v = edge.to;

            ev = TraceEvent();
            ev.eventType = "edge_examine";
            ev.title = "Examine Edge (" + std::to_string(u) + " → " + std::to_string(v) + ")";
            ev.sourceLine = 12;
            ev.activeVertexId = u;
            ev.activeEdgeU = u;
            ev.activeEdgeV = v;
            captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
            ev.traversalOutput = visitOrder;

            if (dist[v] == GRAPH_INF) {
                // Discover unvisited neighbor
                dist[v] = dist[u] + 1;
                parent[v] = u;
                vStates[v] = "in_queue";
                q.push(v);

                ev.description = "Vertex " + std::to_string(v) + " unvisited. Discovered! Distance = " + std::to_string(dist[v]) + ". Enqueueing.";
                ev.variables["discovered"] = std::to_string(v);
                ev.variables["distance"] = std::to_string(dist[v]);
                emitter.emit(ev);

                // Emitted enqueue event
                TraceEvent enqEv;
                enqEv.eventType = "queue_enqueue";
                enqEv.title = "Enqueue Vertex " + std::to_string(v);
                enqEv.description = "Pushed vertex " + std::to_string(v) + " into BFS queue.";
                enqEv.sourceLine = 15;
                enqEv.activeVertexId = v;
                captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, enqEv.graphVertices, enqEv.graphEdges);
                enqEv.traversalOutput = visitOrder;
                std::queue<int> tempQ2 = q;
                while (!tempQ2.empty()) {
                    enqEv.queueState.push_back(std::to_string(tempQ2.front()));
                    tempQ2.pop();
                }
                emitter.emit(enqEv);
            } else {
                ev.description = "Vertex " + std::to_string(v) + " already discovered (dist=" + std::to_string(dist[v]) + "). Skipping.";
                emitter.emit(ev);
            }
        }

        vStates[u] = "visited";
        ev = TraceEvent();
        ev.eventType = "vertex_finish";
        ev.title = "Finish Vertex " + std::to_string(u);
        ev.description = "All incident edges from vertex " + std::to_string(u) + " processed.";
        ev.sourceLine = 18;
        ev.activeVertexId = u;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
        ev.traversalOutput = visitOrder;
        emitter.emit(ev);
    }

    // Path reconstruction if target requested
    std::vector<int> path;
    if (targetVertex >= 0 && targetVertex < V && dist[targetVertex] != GRAPH_INF) {
        int curr = targetVertex;
        while (curr != -1) {
            path.push_back(curr);
            curr = parent[curr];
        }
        std::reverse(path.begin(), path.end());

        ev = TraceEvent();
        ev.eventType = "path_reconstruct";
        ev.title = "Shortest Path Reconstructed to " + std::to_string(targetVertex);
        ev.description = "Reconstructed path from parent pointers: length " + std::to_string(dist[targetVertex]) + " edges.";
        ev.sourceLine = 22;
        ev.activeVertexId = targetVertex;
        ev.reconstructedPath = path;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
        ev.traversalOutput = visitOrder;
        emitter.emit(ev);
    }

    // Completion
    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "BFS Traversal Complete";
    ev.description = "Explored all vertices reachable from start vertex " + std::to_string(startVertex) + ". Total visited: " + std::to_string(visitOrder.size()) + ".";
    ev.sourceLine = 25;
    ev.activeVertexId = -1;
    ev.reconstructedPath = path;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, eStates, ev.graphVertices, ev.graphEdges);
    ev.traversalOutput = visitOrder;
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 2. Depth-First Search (DFS)
// -------------------------------------------------------------
static void internalDfs(
    int u, 
    const CppGraph& g, 
    std::vector<std::string>& vStates,
    std::vector<int>& parent,
    std::vector<int>& dt,
    std::vector<int>& ft,
    int& timer,
    std::vector<int>& visitOrder,
    std::vector<std::string>& callStack,
    TraceEmitter& emitter
) {
    dt[u] = ++timer;
    vStates[u] = "active";
    visitOrder.push_back(u);
    callStack.push_back("dfs(" + std::to_string(u) + ")");

    TraceEvent ev;
    ev.eventType = "vertex_discover";
    ev.title = "DFS: Discover Vertex " + std::to_string(u);
    ev.description = "Entering dfs(" + std::to_string(u) + "). Discovery time = " + std::to_string(dt[u]) + ".";
    ev.sourceLine = 6;
    ev.activeVertexId = u;
    ev.recursionDepth = (int)callStack.size();
    ev.callStack = callStack;
    ev.traversalOutput = visitOrder;
    std::vector<int> dummyDist(g.vertexCount, GRAPH_INF);
    std::vector<std::string> dummyEdges;
    captureGraphSnapshot(g, vStates, dummyDist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    emitter.emit(ev);

    for (const auto& edge : g.adj[u]) {
        int v = edge.to;

        ev = TraceEvent();
        ev.eventType = "edge_examine";
        ev.title = "Examine Edge (" + std::to_string(u) + " → " + std::to_string(v) + ")";
        ev.sourceLine = 9;
        ev.activeVertexId = u;
        ev.activeEdgeU = u;
        ev.activeEdgeV = v;
        ev.recursionDepth = (int)callStack.size();
        ev.callStack = callStack;
        ev.traversalOutput = visitOrder;
        captureGraphSnapshot(g, vStates, dummyDist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);

        if (vStates[v] == "unvisited") {
            ev.description = "Neighbor " + std::to_string(v) + " is unvisited. Making recursive call dfs(" + std::to_string(v) + ").";
            parent[v] = u;
            emitter.emit(ev);

            internalDfs(v, g, vStates, parent, dt, ft, timer, visitOrder, callStack, emitter);
        } else {
            ev.description = "Neighbor " + std::to_string(v) + " already discovered (" + vStates[v] + "). Backtracking.";
            emitter.emit(ev);
        }
    }

    ft[u] = ++timer;
    vStates[u] = "visited";

    ev = TraceEvent();
    ev.eventType = "vertex_finish";
    ev.title = "DFS: Finish Vertex " + std::to_string(u);
    ev.description = "All branches from vertex " + std::to_string(u) + " explored. Finish time = " + std::to_string(ft[u]) + ". Returning.";
    ev.sourceLine = 15;
    ev.activeVertexId = u;
    ev.recursionDepth = (int)callStack.size();
    ev.callStack = callStack;
    ev.traversalOutput = visitOrder;
    captureGraphSnapshot(g, vStates, dummyDist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    emitter.emit(ev);

    if (!callStack.empty()) {
        callStack.pop_back();
    }
}

void traceDfs(const CppGraph& g, int startVertex, TraceEmitter& emitter) {
    int V = g.vertexCount;
    if (startVertex < 0 || startVertex >= V) startVertex = 0;

    std::vector<std::string> vStates(V, "unvisited");
    std::vector<int> parent(V, -1);
    std::vector<int> dt(V, -1);
    std::vector<int> ft(V, -1);
    int timer = 0;
    std::vector<int> visitOrder;
    std::vector<std::string> callStack;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "DFS Initialized at Vertex " + std::to_string(startVertex);
    ev.description = "Beginning depth-first search using recursive exploration and backtracking.";
    ev.sourceLine = 2;
    ev.activeVertexId = startVertex;
    std::vector<int> dummyDist(V, GRAPH_INF);
    std::vector<std::string> dummyEdges;
    captureGraphSnapshot(g, vStates, dummyDist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    emitter.emit(ev);

    internalDfs(startVertex, g, vStates, parent, dt, ft, timer, visitOrder, callStack, emitter);

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "DFS Traversal Complete";
    ev.description = "Exploration from start vertex finished. Visited " + std::to_string(visitOrder.size()) + " vertices.";
    ev.sourceLine = 18;
    ev.activeVertexId = -1;
    captureGraphSnapshot(g, vStates, dummyDist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    ev.traversalOutput = visitOrder;
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 3. Dijkstra's Shortest-Path Algorithm
// -------------------------------------------------------------
void traceDijkstra(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter) {
    int V = g.vertexCount;
    if (sourceVertex < 0 || sourceVertex >= V) sourceVertex = 0;

    // Correctness check: Dijkstra requires non-negative edge weights
    for (int u = 0; u < V; ++u) {
        for (const auto& e : g.adj[u]) {
            if (e.weight < 0) {
                TraceEvent errEv;
                errEv.eventType = "error";
                errEv.title = "Negative Weight Edge Detected";
                errEv.description = "Dijkstra's algorithm strictly requires non-negative weights! Edge (" + 
                                    std::to_string(u) + " → " + std::to_string(e.to) + ") has weight " + std::to_string(e.weight) + ".";
                errEv.sourceLine = 3;
                errEv.variables["error"] = "NegativeWeightNotAllowed";
                errEv.isCompleted = true;
                emitter.emit(errEv);
                return;
            }
        }
    }

    std::vector<std::string> vStates(V, "unvisited");
    std::vector<int> dist(V, GRAPH_INF);
    std::vector<int> parent(V, -1);
    std::vector<int> dt(V, -1);
    std::vector<int> ft(V, -1);
    std::vector<std::string> dummyEdges;

    dist[sourceVertex] = 0;
    vStates[sourceVertex] = "discovered";

    // Min-priority queue: stores (distance, vertex)
    typedef std::pair<int, int> DistPair;
    std::priority_queue<DistPair, std::vector<DistPair>, std::greater<DistPair>> pq;
    pq.push({0, sourceVertex});

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Dijkstra Initialized at Source " + std::to_string(sourceVertex);
    ev.description = "Distance table initialized: dist[" + std::to_string(sourceVertex) + "] = 0, all others = ∞.";
    ev.sourceLine = 5;
    ev.activeVertexId = sourceVertex;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    ev.priorityQueueState.push_back("(" + std::to_string(sourceVertex) + ", d=0)");
    emitter.emit(ev);

    while (!pq.empty()) {
        auto top = pq.top();
        pq.pop();
        int d = top.first;
        int u = top.second;

        // Check for stale priority queue entry
        if (d > dist[u]) {
            ev = TraceEvent();
            ev.eventType = "stale_entry_skip";
            ev.title = "Skip Stale Entry for Vertex " + std::to_string(u);
            ev.description = "Popped stale entry (" + std::to_string(u) + ", d=" + std::to_string(d) + 
                             "). Current shortest distance is already " + std::to_string(dist[u]) + ". Skipping.";
            ev.sourceLine = 10;
            ev.activeVertexId = u;
            captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
            emitter.emit(ev);
            continue;
        }

        vStates[u] = "visited"; // Finalized
        ev = TraceEvent();
        ev.eventType = "vertex_visit";
        ev.title = "Finalize Minimum Distance: Vertex " + std::to_string(u);
        ev.description = "Shortest path to vertex " + std::to_string(u) + " is finalized at " + std::to_string(dist[u]) + ".";
        ev.sourceLine = 12;
        ev.activeVertexId = u;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
        emitter.emit(ev);

        // If target was specified and finalized, we can break or continue
        if (targetVertex >= 0 && targetVertex < V && u == targetVertex) {
            // Target shortest distance confirmed
        }

        for (const auto& edge : g.adj[u]) {
            int v = edge.to;
            int weight = edge.weight;

            ev = TraceEvent();
            ev.eventType = "edge_examine";
            ev.title = "Examine Edge (" + std::to_string(u) + " → " + std::to_string(v) + ", w=" + std::to_string(weight) + ")";
            ev.sourceLine = 15;
            ev.activeVertexId = u;
            ev.activeEdgeU = u;
            ev.activeEdgeV = v;
            captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);

            if (dist[u] + weight < dist[v]) {
                int oldDist = dist[v];
                dist[v] = dist[u] + weight;
                parent[v] = u;
                vStates[v] = "discovered";
                pq.push({dist[v], v});

                ev.eventType = "relax_success";
                ev.title = "Relax Edge: Improved Distance to " + std::to_string(v);
                ev.description = "Found shorter path to " + std::to_string(v) + ": " + 
                                 std::to_string(dist[u]) + " + " + std::to_string(weight) + " = " + std::to_string(dist[v]) + 
                                 (oldDist == GRAPH_INF ? " (was ∞)" : " (was " + std::to_string(oldDist) + ")");
                ev.variables["dist_" + std::to_string(v)] = std::to_string(dist[v]);
                emitter.emit(ev);
            } else {
                ev.eventType = "relax_failure";
                ev.title = "No Relaxation for (" + std::to_string(u) + " → " + std::to_string(v) + ")";
                ev.description = "Candidate distance " + std::to_string(dist[u] + weight) + " >= existing distance " + 
                                 (dist[v] == GRAPH_INF ? "∞" : std::to_string(dist[v])) + ".";
                emitter.emit(ev);
            }
        }
    }

    // Mark unreachable vertices
    for (int i = 0; i < V; ++i) {
        if (dist[i] == GRAPH_INF) {
            vStates[i] = "unreachable";
        }
    }

    // Reconstruct path if target requested
    std::vector<int> path;
    if (targetVertex >= 0 && targetVertex < V && dist[targetVertex] != GRAPH_INF) {
        int curr = targetVertex;
        while (curr != -1) {
            path.push_back(curr);
            curr = parent[curr];
        }
        std::reverse(path.begin(), path.end());

        ev = TraceEvent();
        ev.eventType = "path_reconstruct";
        ev.title = "Shortest Path to Vertex " + std::to_string(targetVertex);
        ev.description = "Reconstructed path: total cost = " + std::to_string(dist[targetVertex]) + ".";
        ev.sourceLine = 22;
        ev.activeVertexId = targetVertex;
        ev.reconstructedPath = path;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
        emitter.emit(ev);
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = "Dijkstra Execution Complete";
    ev.description = "Computed single-source shortest paths from source vertex " + std::to_string(sourceVertex) + ".";
    ev.sourceLine = 25;
    ev.reconstructedPath = path;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 4. Bellman-Ford Algorithm
// -------------------------------------------------------------
void traceBellmanFord(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter) {
    int V = g.vertexCount;
    if (sourceVertex < 0 || sourceVertex >= V) sourceVertex = 0;

    std::vector<std::string> vStates(V, "unvisited");
    std::vector<int> dist(V, GRAPH_INF);
    std::vector<int> parent(V, -1);
    std::vector<int> dt(V, -1);
    std::vector<int> ft(V, -1);
    std::vector<std::string> dummyEdges;

    dist[sourceVertex] = 0;
    vStates[sourceVertex] = "active";

    // Gather all edges (u, v, w)
    struct FullEdge {
        int u;
        int v;
        int w;
    };
    std::vector<FullEdge> allEdges;
    for (int u = 0; u < V; ++u) {
        for (const auto& e : g.adj[u]) {
            allEdges.push_back({u, e.to, e.weight});
        }
    }

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Bellman-Ford Initialized at Source " + std::to_string(sourceVertex);
    ev.description = "Supports negative weights. Will perform up to " + std::to_string(V - 1) + " relaxation passes.";
    ev.sourceLine = 4;
    ev.activeVertexId = sourceVertex;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    emitter.emit(ev);

    bool negativeCycle = false;

    // V - 1 passes
    for (int pass = 1; pass <= V - 1; ++pass) {
        bool anyUpdate = false;

        ev = TraceEvent();
        ev.eventType = "pass_start";
        ev.title = "Pass " + std::to_string(pass) + " of " + std::to_string(V - 1);
        ev.description = "Relaxing all " + std::to_string(allEdges.size()) + " edges.";
        ev.sourceLine = 8;
        ev.passNumber = pass;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
        emitter.emit(ev);

        for (const auto& edge : allEdges) {
            int u = edge.u;
            int v = edge.v;
            int w = edge.w;

            if (dist[u] != GRAPH_INF && dist[u] + w < dist[v]) {
                int oldDist = dist[v];
                dist[v] = dist[u] + w;
                parent[v] = u;
                vStates[v] = "discovered";
                anyUpdate = true;

                ev = TraceEvent();
                ev.eventType = "relax_success";
                ev.title = "Pass " + std::to_string(pass) + ": Relax (" + std::to_string(u) + " → " + std::to_string(v) + ")";
                ev.description = "Updated dist[" + std::to_string(v) + "] = " + std::to_string(dist[u]) + 
                                 " + (" + std::to_string(w) + ") = " + std::to_string(dist[v]) + 
                                 (oldDist == GRAPH_INF ? " (was ∞)" : " (was " + std::to_string(oldDist) + ")");
                ev.sourceLine = 12;
                ev.passNumber = pass;
                ev.activeVertexId = v;
                ev.activeEdgeU = u;
                ev.activeEdgeV = v;
                ev.variables["dist_" + std::to_string(v)] = std::to_string(dist[v]);
                captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
                emitter.emit(ev);
            }
        }

        if (!anyUpdate) {
            ev = TraceEvent();
            ev.eventType = "early_termination";
            ev.title = "Early Termination at Pass " + std::to_string(pass);
            ev.description = "No distance values updated in this pass. All shortest paths finalized.";
            ev.sourceLine = 16;
            ev.passNumber = pass;
            captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
            emitter.emit(ev);
            break;
        }
    }

    // Pass V: Negative cycle detection
    for (const auto& edge : allEdges) {
        int u = edge.u;
        int v = edge.v;
        int w = edge.w;

        if (dist[u] != GRAPH_INF && dist[u] + w < dist[v]) {
            negativeCycle = true;
            vStates[v] = "negative_cycle";
            vStates[u] = "negative_cycle";

            ev = TraceEvent();
            ev.eventType = "negative_cycle_detected";
            ev.title = "Negative-Weight Cycle Detected!";
            ev.description = "Edge (" + std::to_string(u) + " → " + std::to_string(v) + ") can still be relaxed. Reachable negative cycle detected.";
            ev.sourceLine = 22;
            ev.activeVertexId = v;
            ev.activeEdgeU = u;
            ev.activeEdgeV = v;
            ev.hasNegativeCycle = true;
            captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
            emitter.emit(ev);
            break;
        }
    }

    for (int i = 0; i < V; ++i) {
        if (dist[i] == GRAPH_INF) {
            vStates[i] = "unreachable";
        }
    }

    std::vector<int> path;
    if (!negativeCycle && targetVertex >= 0 && targetVertex < V && dist[targetVertex] != GRAPH_INF) {
        int curr = targetVertex;
        while (curr != -1) {
            path.push_back(curr);
            curr = parent[curr];
        }
        std::reverse(path.begin(), path.end());

        ev = TraceEvent();
        ev.eventType = "path_reconstruct";
        ev.title = "Shortest Path Reconstructed to " + std::to_string(targetVertex);
        ev.description = "Path cost: " + std::to_string(dist[targetVertex]) + ".";
        ev.sourceLine = 25;
        ev.activeVertexId = targetVertex;
        ev.reconstructedPath = path;
        captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
        emitter.emit(ev);
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = negativeCycle ? "Halted: Negative Cycle Detected" : "Bellman-Ford Execution Complete";
    ev.description = negativeCycle 
        ? "Graph contains a negative weight cycle reachable from the source. Shortest paths undefined."
        : "Computed shortest distances from source " + std::to_string(sourceVertex) + ".";
    ev.sourceLine = 28;
    ev.hasNegativeCycle = negativeCycle;
    ev.reconstructedPath = path;
    captureGraphSnapshot(g, vStates, dist, parent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// 5. Floyd-Warshall Algorithm
// -------------------------------------------------------------
void traceFloydWarshall(const CppGraph& g, int sourceVertex, int targetVertex, TraceEmitter& emitter) {
    int V = g.vertexCount;
    // Cap V <= 8 for safety
    if (V > 8) V = 8;

    std::vector<std::vector<int>> distMatrix(V, std::vector<int>(V, GRAPH_INF));
    std::vector<std::vector<int>> predMatrix(V, std::vector<int>(V, -1));

    // Initialize diagonal to 0
    for (int i = 0; i < V; ++i) {
        distMatrix[i][i] = 0;
        predMatrix[i][i] = i;
    }

    // Initialize direct edge weights
    for (int u = 0; u < V; ++u) {
        for (const auto& e : g.adj[u]) {
            int v = e.to;
            if (v < V) {
                if (e.weight < distMatrix[u][v]) {
                    distMatrix[u][v] = e.weight;
                    predMatrix[u][v] = v;
                }
            }
        }
    }

    std::vector<std::string> vStates(V, "unvisited");
    std::vector<int> dummyDist(V, 0);
    std::vector<int> dummyParent(V, -1);
    std::vector<int> dt(V, -1);
    std::vector<int> ft(V, -1);
    std::vector<std::string> dummyEdges;

    TraceEvent ev;
    ev.eventType = "initialize";
    ev.title = "Floyd-Warshall Initialized (" + std::to_string(V) + "×" + std::to_string(V) + " Matrix)";
    ev.description = "All-pairs shortest paths via 3 nested loops: k (intermediate), i (source), j (dest).";
    ev.sourceLine = 5;
    ev.distanceMatrix = distMatrix;
    ev.predecessorMatrix = predMatrix;
    captureGraphSnapshot(g, vStates, dummyDist, dummyParent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    emitter.emit(ev);

    for (int k = 0; k < V; ++k) {
        vStates[k] = "active";

        ev = TraceEvent();
        ev.eventType = "pass_start";
        ev.title = "Intermediate Vertex k = " + std::to_string(k);
        ev.description = "Considering vertex " + std::to_string(k) + " as potential intermediate detour for all pairs.";
        ev.sourceLine = 8;
        ev.matrixK = k;
        ev.distanceMatrix = distMatrix;
        ev.predecessorMatrix = predMatrix;
        captureGraphSnapshot(g, vStates, dummyDist, dummyParent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
        emitter.emit(ev);

        for (int i = 0; i < V; ++i) {
            for (int j = 0; j < V; ++j) {
                if (distMatrix[i][k] != GRAPH_INF && distMatrix[k][j] != GRAPH_INF) {
                    int candidate = distMatrix[i][k] + distMatrix[k][j];
                    if (candidate < distMatrix[i][j]) {
                        distMatrix[i][j] = candidate;
                        predMatrix[i][j] = predMatrix[i][k];

                        ev = TraceEvent();
                        ev.eventType = "matrix_cell_update";
                        ev.title = "Update dist[" + std::to_string(i) + "][" + std::to_string(j) + "] = " + std::to_string(candidate);
                        ev.description = "Detour via k=" + std::to_string(k) + " improves path: " + 
                                         std::to_string(distMatrix[i][k]) + " + " + std::to_string(distMatrix[k][j]) + " = " + std::to_string(candidate) + ".";
                        ev.sourceLine = 12;
                        ev.matrixK = k;
                        ev.matrixI = i;
                        ev.matrixJ = j;
                        ev.activeEdgeU = i;
                        ev.activeEdgeV = j;
                        ev.distanceMatrix = distMatrix;
                        ev.predecessorMatrix = predMatrix;
                        captureGraphSnapshot(g, vStates, dummyDist, dummyParent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
                        emitter.emit(ev);
                    }
                }
            }
        }
        vStates[k] = "visited";
    }

    // Check for negative cycles
    bool hasNegCycle = false;
    for (int i = 0; i < V; ++i) {
        if (distMatrix[i][i] < 0) {
            hasNegCycle = true;
            break;
        }
    }

    std::vector<int> path;
    if (!hasNegCycle && sourceVertex >= 0 && sourceVertex < V && targetVertex >= 0 && targetVertex < V) {
        if (distMatrix[sourceVertex][targetVertex] != GRAPH_INF) {
            int curr = sourceVertex;
            path.push_back(curr);
            int steps = 0;
            while (curr != targetVertex && steps <= V) {
                curr = predMatrix[curr][targetVertex];
                if (curr == -1) break;
                path.push_back(curr);
                steps++;
            }
        }
    }

    ev = TraceEvent();
    ev.eventType = "complete";
    ev.title = hasNegCycle ? "Negative Cycle Detected on Diagonal" : "Floyd-Warshall Complete";
    ev.description = hasNegCycle 
        ? "Diagonal entry dist[i][i] < 0 detected. Negative cycle present in graph."
        : "All-pairs shortest paths computed. Distance matrix finalized.";
    ev.sourceLine = 16;
    ev.distanceMatrix = distMatrix;
    ev.predecessorMatrix = predMatrix;
    ev.reconstructedPath = path;
    ev.hasNegativeCycle = hasNegCycle;
    captureGraphSnapshot(g, vStates, dummyDist, dummyParent, dt, ft, dummyEdges, ev.graphVertices, ev.graphEdges);
    ev.isCompleted = true;
    emitter.emit(ev);
}

// -------------------------------------------------------------
// Canonical C++ Source Code Provider
// -------------------------------------------------------------
std::string getGraphSourceCode(const std::string& op) {
    if (op == "bfs" || op == "graph-bfs") {
        return
            "void bfs(int start, const Graph& g) {\n"
            "    std::vector<int> dist(g.V, -1);\n"
            "    std::queue<int> q;\n"
            "    dist[start] = 0;\n"
            "    q.push(start);\n"
            "    while (!q.empty()) {\n"
            "        int u = q.front(); q.pop();\n"
            "        visit(u);\n"
            "        for (const auto& e : g.adj[u]) {\n"
            "            int v = e.to;\n"
            "            if (dist[v] == -1) {\n"
            "                dist[v] = dist[u] + 1;\n"
            "                parent[v] = u;\n"
            "                q.push(v);\n"
            "            }\n"
            "        }\n"
            "    }\n"
            "}";
    }
    if (op == "dfs" || op == "graph-dfs") {
        return
            "void dfs(int u, const Graph& g, std::vector<bool>& visited) {\n"
            "    visited[u] = true;\n"
            "    discoveryTime[u] = ++timer;\n"
            "    visit(u);\n"
            "    for (const auto& e : g.adj[u]) {\n"
            "        int v = e.to;\n"
            "        if (!visited[v]) {\n"
            "            parent[v] = u;\n"
            "            dfs(v, g, visited);\n"
            "        }\n"
            "    }\n"
            "    finishTime[u] = ++timer;\n"
            "}";
    }
    if (op == "dijkstra" || op == "graph-dijkstra") {
        return
            "void dijkstra(int src, const Graph& g) {\n"
            "    // Requires non-negative weights\n"
            "    std::vector<int> dist(g.V, INF);\n"
            "    std::priority_queue<Pair, vector<Pair>, greater<Pair>> pq;\n"
            "    dist[src] = 0;\n"
            "    pq.push({0, src});\n"
            "    while (!pq.empty()) {\n"
            "        auto [d, u] = pq.top(); pq.pop();\n"
            "        if (d > dist[u]) continue; // skip stale\n"
            "        for (const auto& e : g.adj[u]) {\n"
            "            int v = e.to, w = e.weight;\n"
            "            if (dist[u] + w < dist[v]) {\n"
            "                dist[v] = dist[u] + w;\n"
            "                parent[v] = u;\n"
            "                pq.push({dist[v], v});\n"
            "            }\n"
            "        }\n"
            "    }\n"
            "}";
    }
    if (op == "bellman-ford" || op == "graph-bellman-ford") {
        return
            "bool bellmanFord(int src, const Graph& g, int V) {\n"
            "    std::vector<int> dist(V, INF);\n"
            "    dist[src] = 0;\n"
            "    for (int i = 1; i <= V - 1; ++i) {\n"
            "        bool updated = false;\n"
            "        for (const auto& e : allEdges) {\n"
            "            if (dist[e.u] != INF && dist[e.u] + e.w < dist[e.v]) {\n"
            "                dist[e.v] = dist[e.u] + e.w;\n"
            "                updated = true;\n"
            "            }\n"
            "        }\n"
            "        if (!updated) break; // early exit\n"
            "    }\n"
            "    for (const auto& e : allEdges) {\n"
            "        if (dist[e.u] != INF && dist[e.u] + e.w < dist[e.v])\n"
            "            return false; // negative cycle!\n"
            "    }\n"
            "    return true;\n"
            "}";
    }
    if (op == "floyd-warshall" || op == "graph-floyd-warshall") {
        return
            "void floydWarshall(int V) {\n"
            "    // dist[V][V] initialized with edge weights\n"
            "    for (int k = 0; k < V; ++k) {\n"
            "        for (int i = 0; i < V; ++i) {\n"
            "            for (int j = 0; j < V; ++j) {\n"
            "                if (dist[i][k] != INF && dist[k][j] != INF) {\n"
            "                    if (dist[i][k] + dist[k][j] < dist[i][j]) {\n"
            "                        dist[i][j] = dist[i][k] + dist[k][j];\n"
            "                        nextHop[i][j] = nextHop[i][k];\n"
            "                    }\n"
            "                }\n"
            "            }\n"
            "        }\n"
            "    }\n"
            "}";
    }
    return "// C++ source code not available";
}
