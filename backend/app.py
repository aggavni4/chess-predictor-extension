from flask import Flask, request, jsonify
import chess
import numpy as np
from tensorflow.keras.models import load_model

# Load the trained models
opening_model = load_model('./models/opening_model.h5')
midgame_model = load_model('./models/midgame_model.h5')
endgame_model = load_model('./models/endgame_model.h5')

def one_hot_encode_piece(piece):
    pieces = list('rnbqkpRNBQKP.')
    arr = np.zeros(len(pieces))
    piece_to_index = {p: i for i, p in enumerate(pieces)}
    index = piece_to_index.get(piece, len(pieces)-1)
    arr[index] = 1
    return arr

def encode_board(board):
    board_str = str(board).replace(' ', '')
    board_list = [[one_hot_encode_piece(piece) for piece in row] for row in board_str.split('\n')]
    return np.array(board_list)

def count_material(fen):
    material_dict = {'p': 1, 'b': 3, 'n': 3, 'r': 5, 'q': 9}
    return sum(material_dict.get(char.lower(), 0) for char in fen if char.lower() in material_dict)

def predict_best_move(fen):
    board = chess.Board(fen=fen)
    material = count_material(fen)
    model = (
        opening_model if material > 60 else
        midgame_model if material >= 30 else
        endgame_model
    )

    moves = []
    input_vectors = []
    for move in board.legal_moves:
        candidate_board = board.copy()
        candidate_board.push(move)
        moves.append(move)
        input_vectors.append(encode_board(candidate_board))

    input_vectors = np.stack(input_vectors)
    scores = model.predict(input_vectors, verbose=0)
    index_of_best_move = np.argmax(scores) if board.turn == chess.BLACK else np.argmax(-scores)
    best_move = moves[index_of_best_move]

    return str(best_move)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    fen = data.get('fen', '')
    if not fen:
        return jsonify({'error': 'No FEN string provided'}), 400
    try:
        best_move = predict_best_move(fen)
        return jsonify({'best_move': best_move})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
