from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Autorise toutes les origines (utile pour React/localhost)

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return jsonify({'error': 'Aucune image reçue'}), 400

    image_file = request.files['image']
    input_bytes = image_file.read()

    try:
        output_bytes = remove(input_bytes)
        return send_file(
            io.BytesIO(output_bytes),
            mimetype='image/png',
            as_attachment=False,
            download_name='output.png'
        )
    except Exception as e:
        print(f"Erreur pendant remove(): {e}")
        return jsonify({'error': 'Erreur lors du traitement de l’image'}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
