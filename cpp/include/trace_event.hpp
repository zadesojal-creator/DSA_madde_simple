#ifndef TRACE_EVENT_HPP
#define TRACE_EVENT_HPP

#include <string>
#include <vector>
#include <map>
#include <sstream>

struct PointerInfo {
    std::string name;
    int index;
    std::string color; // optional
};

struct TreeNodeSnapshot {
    int id;
    int value;
    int leftId;
    int rightId;
    int parentId;
    int depth;

    TreeNodeSnapshot() : id(0), value(0), leftId(-1), rightId(-1), parentId(-1), depth(0) {}
    TreeNodeSnapshot(int id, int val, int l, int r, int p, int d)
        : id(id), value(val), leftId(l), rightId(r), parentId(p), depth(d) {}
};

struct GraphVertexSnapshot {
    int id;
    std::string label;
    std::string state;
    int distance;
    bool hasDistance;
    int predecessor;
    int discoveryTime;
    int finishTime;

    GraphVertexSnapshot() 
        : id(0), label(""), state("unvisited"), distance(0), hasDistance(false), predecessor(-1), discoveryTime(-1), finishTime(-1) {}
    GraphVertexSnapshot(int id, const std::string& lbl, const std::string& st, int dist, bool hasDist, int pred, int dt = -1, int ft = -1)
        : id(id), label(lbl), state(st), distance(dist), hasDistance(hasDist), predecessor(pred), discoveryTime(dt), finishTime(ft) {}
};

struct GraphEdgeSnapshot {
    int u;
    int v;
    int weight;
    bool directed;
    std::string state;

    GraphEdgeSnapshot() : u(0), v(0), weight(1), directed(false), state("normal") {}
    GraphEdgeSnapshot(int u, int v, int w, bool dir, const std::string& st = "normal")
        : u(u), v(v), weight(w), directed(dir), state(st) {}
};

struct LinkedNodeSnapshot {
    int id;
    int value;
    int nextId;
    int prevId;

    LinkedNodeSnapshot(int id, int value, int nextId, int prevId)
        : id(id), value(value), nextId(nextId), prevId(prevId) {}
};

struct TraceEvent {
    int id;
    int stepIndex;
    std::string eventType;
    std::string title;
    std::string description;
    int sourceLine; // 1-based line in displayed C++ source code
    std::vector<int> arrayState;
    std::vector<int> stackState;
    std::vector<int> auxStackState;
    std::vector<std::string> charStackState;
    int capacity;
    int topIndex;
    std::string statusType;
    std::string expression;
    int charIndex;
    std::string currentChar;
    std::vector<int> activeIndices;
    std::map<int, std::string> highlightedItems; // index -> highlight type
    std::vector<PointerInfo> pointers;
    std::map<std::string, std::string> variables;
    std::string statusText;
    bool isCompleted;

    // Sorting & searching live counters and metadata
    int comparisons;
    int swaps;
    int writes;
    int recursionDepth;
    int rangeLow;
    int rangeHigh;
    int pivotIndex;
    int passNumber;

    // Tree & Heap specific state
    std::vector<TreeNodeSnapshot> treeNodes;
    int rootId;
    int activeNodeId;
    std::vector<int> traversalOutput;
    std::vector<std::string> callStack;
    std::vector<std::string> queueState;
    std::map<int, std::string> highlightedNodes;
    std::vector<std::string> highlightedEdges;
    int heapSize;
    std::string heapType;
    int activeParentIdx;
    int activeLeftIdx;
    int activeRightIdx;

    // Graph specific state
    std::vector<GraphVertexSnapshot> graphVertices;
    std::vector<GraphEdgeSnapshot> graphEdges;
    int activeVertexId;
    int activeEdgeU;
    int activeEdgeV;
    std::vector<int> reconstructedPath;
    std::vector<std::string> priorityQueueState;
    std::vector<std::vector<int>> distanceMatrix;
    std::vector<std::vector<int>> predecessorMatrix;
    int matrixK;
    int matrixI;
    int matrixJ;
    bool hasNegativeCycle;

    // Queue, deque, and linked-list snapshots
    std::string structureType;
    std::vector<int> structureStorage;
    std::vector<bool> occupiedSlots;
    std::vector<int> logicalOrder;
    int frontIndex;
    int rearIndex;
    int elementCount;
    int dequeFrontIndex;
    int dequeBackIndex;
    std::vector<LinkedNodeSnapshot> linkedNodes;

    TraceEvent() 
        : id(0), stepIndex(0), eventType("step"), sourceLine(1), capacity(0), topIndex(-1), statusType("normal"), charIndex(-1), isCompleted(false),
          comparisons(0), swaps(0), writes(0), recursionDepth(0), rangeLow(-1), rangeHigh(-1), pivotIndex(-1), passNumber(0),
          rootId(-1), activeNodeId(-1), heapSize(0), heapType("min"), activeParentIdx(-1), activeLeftIdx(-1), activeRightIdx(-1),
          activeVertexId(-1), activeEdgeU(-1), activeEdgeV(-1), matrixK(-1), matrixI(-1), matrixJ(-1), hasNegativeCycle(false),
          frontIndex(-1), rearIndex(-1), elementCount(0), dequeFrontIndex(-1), dequeBackIndex(-1) {}
};

class TraceEmitter {
private:
    std::vector<TraceEvent> events;
    int nextId;

    static std::string escapeJson(const std::string& str) {
        std::ostringstream ss;
        for (char c : str) {
            switch (c) {
                case '"': ss << "\\\""; break;
                case '\\': ss << "\\\\"; break;
                case '\b': ss << "\\b"; break;
                case '\f': ss << "\\f"; break;
                case '\n': ss << "\\n"; break;
                case '\r': ss << "\\r"; break;
                case '\t': ss << "\\t"; break;
                default:
                    if (static_cast<unsigned char>(c) < 32) {
                        // control character
                        ss << " ";
                    } else {
                        ss << c;
                    }
                    break;
            }
        }
        return ss.str();
    }

public:
    TraceEmitter() : nextId(0) {}

    void emit(TraceEvent event) {
        event.id = nextId++;
        event.stepIndex = static_cast<int>(events.size());
        events.push_back(event);
    }

    const std::vector<TraceEvent>& getEvents() const {
        return events;
    }

    void clear() {
        events.clear();
        nextId = 0;
    }

    std::string toJson() const {
        std::ostringstream ss;
        ss << "[\n";
        for (size_t i = 0; i < events.size(); ++i) {
            const auto& e = events[i];
            ss << "  {\n";
            ss << "    \"id\": " << e.id << ",\n";
            ss << "    \"stepIndex\": " << e.stepIndex << ",\n";
            ss << "    \"eventType\": \"" << escapeJson(e.eventType) << "\",\n";
            ss << "    \"title\": \"" << escapeJson(e.title) << "\",\n";
            ss << "    \"description\": \"" << escapeJson(e.description) << "\",\n";
            ss << "    \"sourceLine\": " << e.sourceLine << ",\n";
            ss << "    \"activeLine\": " << e.sourceLine << ",\n";

            // arrayState
            ss << "    \"arrayState\": [";
            for (size_t j = 0; j < e.arrayState.size(); ++j) {
                ss << e.arrayState[j];
                if (j + 1 < e.arrayState.size()) ss << ", ";
            }
            ss << "],\n";

            // stackState
            ss << "    \"stackState\": [";
            for (size_t j = 0; j < e.stackState.size(); ++j) {
                ss << e.stackState[j];
                if (j + 1 < e.stackState.size()) ss << ", ";
            }
            ss << "],\n";

            // auxStackState
            ss << "    \"auxStackState\": [";
            for (size_t j = 0; j < e.auxStackState.size(); ++j) {
                ss << e.auxStackState[j];
                if (j + 1 < e.auxStackState.size()) ss << ", ";
            }
            ss << "],\n";

            // charStackState
            ss << "    \"charStackState\": [";
            for (size_t j = 0; j < e.charStackState.size(); ++j) {
                ss << "\"" << escapeJson(e.charStackState[j]) << "\"";
                if (j + 1 < e.charStackState.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"capacity\": " << e.capacity << ",\n";
            ss << "    \"topIndex\": " << e.topIndex << ",\n";
            ss << "    \"statusType\": \"" << escapeJson(e.statusType) << "\",\n";
            ss << "    \"expression\": \"" << escapeJson(e.expression) << "\",\n";
            ss << "    \"charIndex\": " << e.charIndex << ",\n";
            ss << "    \"currentChar\": \"" << escapeJson(e.currentChar) << "\",\n";

            // activeIndices
            ss << "    \"activeIndices\": [";
            for (size_t j = 0; j < e.activeIndices.size(); ++j) {
                ss << e.activeIndices[j];
                if (j + 1 < e.activeIndices.size()) ss << ", ";
            }
            ss << "],\n";

            // highlightedItems
            ss << "    \"highlightedItems\": {";
            bool firstHigh = true;
            for (const auto& pair : e.highlightedItems) {
                if (!firstHigh) ss << ", ";
                ss << "\"" << pair.first << "\": \"" << escapeJson(pair.second) << "\"";
                firstHigh = false;
            }
            ss << "},\n";

            // pointers
            ss << "    \"pointers\": [";
            for (size_t j = 0; j < e.pointers.size(); ++j) {
                ss << "{\"name\": \"" << escapeJson(e.pointers[j].name) 
                   << "\", \"index\": " << e.pointers[j].index;
                if (!e.pointers[j].color.empty()) {
                    ss << ", \"color\": \"" << escapeJson(e.pointers[j].color) << "\"";
                }
                ss << "}";
                if (j + 1 < e.pointers.size()) ss << ", ";
            }
            ss << "],\n";

            // variables
            ss << "    \"variables\": {";
            bool firstVar = true;
            for (const auto& pair : e.variables) {
                if (!firstVar) ss << ", ";
                ss << "\"" << escapeJson(pair.first) << "\": \"" << escapeJson(pair.second) << "\"";
                firstVar = false;
            }
            ss << "},\n";

            ss << "    \"statusText\": \"" << escapeJson(e.statusText) << "\",\n";
            ss << "    \"comparisons\": " << e.comparisons << ",\n";
            ss << "    \"swaps\": " << e.swaps << ",\n";
            ss << "    \"writes\": " << e.writes << ",\n";
            ss << "    \"recursionDepth\": " << e.recursionDepth << ",\n";
            ss << "    \"rangeLow\": " << e.rangeLow << ",\n";
            ss << "    \"rangeHigh\": " << e.rangeHigh << ",\n";
            ss << "    \"pivotIndex\": " << e.pivotIndex << ",\n";
            ss << "    \"passNumber\": " << e.passNumber << ",\n";

            // treeNodes
            ss << "    \"treeNodes\": [";
            for (size_t j = 0; j < e.treeNodes.size(); ++j) {
                const auto& tn = e.treeNodes[j];
                ss << "{\"id\": " << tn.id << ", \"value\": " << tn.value
                   << ", \"leftId\": " << tn.leftId << ", \"rightId\": " << tn.rightId
                   << ", \"parentId\": " << tn.parentId << ", \"depth\": " << tn.depth << "}";
                if (j + 1 < e.treeNodes.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"rootId\": " << e.rootId << ",\n";
            ss << "    \"activeNodeId\": " << e.activeNodeId << ",\n";

            // traversalOutput
            ss << "    \"traversalOutput\": [";
            for (size_t j = 0; j < e.traversalOutput.size(); ++j) {
                ss << e.traversalOutput[j];
                if (j + 1 < e.traversalOutput.size()) ss << ", ";
            }
            ss << "],\n";

            // callStack
            ss << "    \"callStack\": [";
            for (size_t j = 0; j < e.callStack.size(); ++j) {
                ss << "\"" << escapeJson(e.callStack[j]) << "\"";
                if (j + 1 < e.callStack.size()) ss << ", ";
            }
            ss << "],\n";

            // queueState
            ss << "    \"queueState\": [";
            for (size_t j = 0; j < e.queueState.size(); ++j) {
                ss << "\"" << escapeJson(e.queueState[j]) << "\"";
                if (j + 1 < e.queueState.size()) ss << ", ";
            }
            ss << "],\n";

            // highlightedNodes
            ss << "    \"highlightedNodes\": {";
            bool firstHN = true;
            for (const auto& pair : e.highlightedNodes) {
                if (!firstHN) ss << ", ";
                ss << "\"" << pair.first << "\": \"" << escapeJson(pair.second) << "\"";
                firstHN = false;
            }
            ss << "},\n";

            // highlightedEdges
            ss << "    \"highlightedEdges\": [";
            for (size_t j = 0; j < e.highlightedEdges.size(); ++j) {
                ss << "\"" << escapeJson(e.highlightedEdges[j]) << "\"";
                if (j + 1 < e.highlightedEdges.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"heapSize\": " << e.heapSize << ",\n";
            ss << "    \"heapType\": \"" << escapeJson(e.heapType) << "\",\n";
            ss << "    \"activeParentIdx\": " << e.activeParentIdx << ",\n";
            ss << "    \"activeLeftIdx\": " << e.activeLeftIdx << ",\n";
            ss << "    \"activeRightIdx\": " << e.activeRightIdx << ",\n";

            // graphVertices
            ss << "    \"graphVertices\": [";
            for (size_t j = 0; j < e.graphVertices.size(); ++j) {
                const auto& v = e.graphVertices[j];
                ss << "{\"id\": " << v.id 
                   << ", \"label\": \"" << escapeJson(v.label) << "\""
                   << ", \"state\": \"" << escapeJson(v.state) << "\""
                   << ", \"distance\": " << v.distance
                   << ", \"hasDistance\": " << (v.hasDistance ? "true" : "false")
                   << ", \"predecessor\": " << v.predecessor
                   << ", \"discoveryTime\": " << v.discoveryTime
                   << ", \"finishTime\": " << v.finishTime << "}";
                if (j + 1 < e.graphVertices.size()) ss << ", ";
            }
            ss << "],\n";

            // graphEdges
            ss << "    \"graphEdges\": [";
            for (size_t j = 0; j < e.graphEdges.size(); ++j) {
                const auto& edge = e.graphEdges[j];
                ss << "{\"u\": " << edge.u
                   << ", \"v\": " << edge.v
                   << ", \"weight\": " << edge.weight
                   << ", \"directed\": " << (edge.directed ? "true" : "false")
                   << ", \"state\": \"" << escapeJson(edge.state) << "\"}";
                if (j + 1 < e.graphEdges.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"activeVertexId\": " << e.activeVertexId << ",\n";
            ss << "    \"activeEdgeU\": " << e.activeEdgeU << ",\n";
            ss << "    \"activeEdgeV\": " << e.activeEdgeV << ",\n";

            // reconstructedPath
            ss << "    \"reconstructedPath\": [";
            for (size_t j = 0; j < e.reconstructedPath.size(); ++j) {
                ss << e.reconstructedPath[j];
                if (j + 1 < e.reconstructedPath.size()) ss << ", ";
            }
            ss << "],\n";

            // priorityQueueState
            ss << "    \"priorityQueueState\": [";
            for (size_t j = 0; j < e.priorityQueueState.size(); ++j) {
                ss << "\"" << escapeJson(e.priorityQueueState[j]) << "\"";
                if (j + 1 < e.priorityQueueState.size()) ss << ", ";
            }
            ss << "],\n";

            // distanceMatrix
            ss << "    \"distanceMatrix\": [";
            for (size_t r = 0; r < e.distanceMatrix.size(); ++r) {
                ss << "[";
                for (size_t c = 0; c < e.distanceMatrix[r].size(); ++c) {
                    ss << e.distanceMatrix[r][c];
                    if (c + 1 < e.distanceMatrix[r].size()) ss << ", ";
                }
                ss << "]";
                if (r + 1 < e.distanceMatrix.size()) ss << ", ";
            }
            ss << "],\n";

            // predecessorMatrix
            ss << "    \"predecessorMatrix\": [";
            for (size_t r = 0; r < e.predecessorMatrix.size(); ++r) {
                ss << "[";
                for (size_t c = 0; c < e.predecessorMatrix[r].size(); ++c) {
                    ss << e.predecessorMatrix[r][c];
                    if (c + 1 < e.predecessorMatrix[r].size()) ss << ", ";
                }
                ss << "]";
                if (r + 1 < e.predecessorMatrix.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"matrixK\": " << e.matrixK << ",\n";
            ss << "    \"matrixI\": " << e.matrixI << ",\n";
            ss << "    \"matrixJ\": " << e.matrixJ << ",\n";
            ss << "    \"hasNegativeCycle\": " << (e.hasNegativeCycle ? "true" : "false") << ",\n";

            ss << "    \"structureType\": \"" << escapeJson(e.structureType) << "\",\n";
            ss << "    \"structureStorage\": [";
            for (size_t j = 0; j < e.structureStorage.size(); ++j) {
                ss << e.structureStorage[j];
                if (j + 1 < e.structureStorage.size()) ss << ", ";
            }
            ss << "],\n";
            ss << "    \"occupiedSlots\": [";
            for (size_t j = 0; j < e.occupiedSlots.size(); ++j) {
                ss << (e.occupiedSlots[j] ? "true" : "false");
                if (j + 1 < e.occupiedSlots.size()) ss << ", ";
            }
            ss << "],\n";
            ss << "    \"logicalOrder\": [";
            for (size_t j = 0; j < e.logicalOrder.size(); ++j) {
                ss << e.logicalOrder[j];
                if (j + 1 < e.logicalOrder.size()) ss << ", ";
            }
            ss << "],\n";
            ss << "    \"frontIndex\": " << e.frontIndex << ",\n";
            ss << "    \"rearIndex\": " << e.rearIndex << ",\n";
            ss << "    \"elementCount\": " << e.elementCount << ",\n";
            ss << "    \"dequeFrontIndex\": " << e.dequeFrontIndex << ",\n";
            ss << "    \"dequeBackIndex\": " << e.dequeBackIndex << ",\n";
            ss << "    \"linkedNodes\": [";
            for (size_t j = 0; j < e.linkedNodes.size(); ++j) {
                const auto& node = e.linkedNodes[j];
                ss << "{\"id\": " << node.id << ", \"value\": " << node.value
                   << ", \"nextId\": " << node.nextId << ", \"prevId\": " << node.prevId << "}";
                if (j + 1 < e.linkedNodes.size()) ss << ", ";
            }
            ss << "],\n";

            ss << "    \"isCompleted\": " << (e.isCompleted ? "true" : "false") << "\n";
            ss << "  }";
            if (i + 1 < events.size()) ss << ",";
            ss << "\n";
        }
        ss << "]\n";
        return ss.str();
    }
};

#endif // TRACE_EVENT_HPP
