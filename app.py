from flask import Flask, render_template, jsonify, request
import json
import os
from graph import load_hospitals, build_graph, dijkstra_with_path
from graph import dijkstra_with_path

nodes = load_hospitals(file_path=r"D:/Dhruv Verma -  4th Semester/Project/AmbulanceNavigator/Hospitals.json")
graph = build_graph(nodes)

app = Flask(__name__)

@app.route('/')
def front():
    return render_template('front.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/hospitals')
def get_hospitals():
    try:
        return jsonify(nodes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/graph')
def get_graph():
    try:
        return jsonify(graph)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/shortest')
def get_shortest_paths():
    try:
        start = request.args.get('start')
        if start not in graph:
            return jsonify({'error': f"{start} not found in hospital graph"}), 404
        distances = dijkstra_with_path(graph, start)
        return jsonify(distances)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/route')
def get_route():
    start = request.args.get('start')
    end = request.args.get('end')

    if not start or not end:
        return jsonify({'error': 'Start and end hospitals required'}), 400

    if start not in graph or end not in graph:
        return jsonify({'error': 'Invalid hospital name'}), 404

    path, total_dist = dijkstra_with_path(graph, start, end)
    coords = [nodes[hop] for hop in path]  # convert names to lat/lon for map

    return jsonify({
        'route': coords,
        'distance': total_dist
    })


if __name__ == '__main__':
    app.run(debug=True)
