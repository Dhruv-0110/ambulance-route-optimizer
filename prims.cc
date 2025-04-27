#include<iostream>
#include<vector>
#include<queue>
using namespace std;

int main() {
    int V, E;
    cout << "Enter number of vertices and edges: ";
    cin >> V >> E;
    vector<vector<pair<int, int>>> adj(V);

    cout << "Enter edges (u v w):" << endl;
    for (int i = 0; i < E; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    int source;
    cout << "Enter source node: ";
    cin >> source;

    vector<bool> MST(V, 0); 
    vector<int> key(V, INT_MAX);  
    vector<int> parent(V, -1);    
    priority_queue<pair<int,int>,vector<pair<int,int>>,greater<>> pq;
    
    return 0;
}