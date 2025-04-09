from flask import Flask, request, jsonify
import torch
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
import pandas as pd
import osmnx as ox

app = Flask(__name__)

# Define the GCN model
class GCNModel(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, num_classes):
        super(GCNModel, self).__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, num_classes)

    def forward(self, data):
        x, edge_index, edge_attr = data.x, data.edge_index, data.edge_attr
        h = self.conv1(x, edge_index).relu()
        h = self.conv2(h, edge_index)
        return h

# Load pre-trained model
model = GCNModel(in_channels=5, hidden_channels=16, num_classes=1)
model.load_state_dict(torch.load("gcn_model.pth"))
model.eval()

@app.route('/api/boundaries', methods=['GET'])
def get_boundaries():
    districts = [
        "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
        "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
        "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
    ]
    features = []

    for district in districts:
        try:
            gdf = ox.geocode_to_gdf(f"{district}, Kerala, India")
            geometry = gdf.geometry.iloc[0]
            features.append({
                "type": "Feature",
                "properties": {"name": district},
                "geometry": geometry.__geo_interface__
            })
        except Exception as e:
            print(f"Error fetching boundary for {district}: {e}")

    geojson = {"type": "FeatureCollection", "features": features}
    return jsonify(geojson)



@app.route('/api/process_csv', methods=['POST'])
def process_csv():
    data = request.get_json().get('data', [])
    print("CSV Data Received:", data)  # Log the received CSV data to the terminal

    # Convert CSV data to node features
    node_features = []
    for row in data:
        node_features.append([float(row['Param1']), float(row['Param2']),
                              float(row['Param3']), float(row['Param4']),
                              float(row['Param5'])])

    node_features = torch.tensor(node_features, dtype=torch.float)

    # Define fixed edge index and edge attributes
    edge_index = torch.tensor([
        [0, 1], [0, 2], [0, 4], [1, 3], [2, 5], [3, 6],
        [4, 7], [5, 8], [6, 9], [7, 10], [8, 11], [9, 12],
        [10, 13], [11, 12]
    ], dtype=torch.long).t()

    edge_features = torch.ones((edge_index.shape[1], 2), dtype=torch.float)

    # Create PyTorch Geometric Data object
    data = Data(x=node_features, edge_index=edge_index, edge_attr=edge_features)

    # Run model inference and get predictions
    with torch.no_grad():
        predictions_tensor = model(data)
        predicted_probabilities = torch.sigmoid(predictions_tensor)
        predicted_labels = (predicted_probabilities > 0.5).float()
    # Map district names to predictions
    district_names = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
    "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"]

    predictions = {
        district: {
            "probability": prob.item(),
            "risk": "High Risk" if label.item() == 1 else "Low Risk"
        }
        for district, prob, label in zip(district_names, predicted_probabilities, predicted_labels)
    }

    return jsonify({"message": "CSV processed successfully", "predictions": predictions})



@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Load CSV file from request
    file = request.files['file']
    try:
        data = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": f"Invalid file format: {str(e)}"}), 400

    if "District" not in data.columns:
        return jsonify({"error": "The file must contain a 'District' column."}), 400

    # Prepare node features
    try:
        node_features = torch.tensor(data.drop(columns=["District"]).values, dtype=torch.float)
    except Exception as e:
        return jsonify({"error": f"Invalid node features: {str(e)}"}), 400

    # Define a dummy edge index (replace with actual edge index in your setup)
    num_nodes = node_features.size(0)
    edge_index = torch.tensor([[i, (i + 1) % num_nodes] for i in range(num_nodes)], dtype=torch.long).t()
    edge_features = torch.ones((edge_index.size(1), 2), dtype=torch.float)

    # Create data object
    graph_data = Data(x=node_features, edge_index=edge_index, edge_attr=edge_features)

    # Run predictions
    with torch.no_grad():
        predictions_tensor = model(graph_data)
        predicted_probabilities = torch.sigmoid(predictions_tensor)
        predicted_labels = (predicted_probabilities > 0.5).float()

    # Prepare results
    results = [
        {"district": district, "probability": prob.item(), "risk": "High Risk" if label.item() == 1 else "Low Risk"}
        for district, prob, label in zip(data["District"], predicted_probabilities, predicted_labels)
    ]

    return jsonify({"predictions": results})

if __name__ == "__main__":
    app.run(debug=True)
