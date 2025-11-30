"""
Routes pour le chat avec IA
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.chat_service import ChatService

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()


@chat_bp.route('/courses/<int:course_id>/chat', methods=['POST'])
@jwt_required()
def send_message(course_id):
    """
    Envoyer un message dans le chat du cours
    
    Body:
    {
        "message": "Qu'est-ce qu'une variable en Python?"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validation simple
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        if 'message' not in data:
            return jsonify({'error': 'Le champ message est requis'}), 400
        
        message = data['message'].strip()
        
        if not message:
            return jsonify({'error': 'Le message ne peut pas être vide'}), 400
        
        if len(message) > 1000:
            return jsonify({'error': 'Le message est trop long (max 1000 caractères)'}), 400
        
        # Envoyer le message et obtenir la réponse
        result = chat_service.send_message(
            user_id=int(user_id),
            course_id=course_id,
            message=message
        )
        
        return jsonify({
            'success': True,
            'message': 'Message envoyé avec succès',
            'data': {
                'user_message': result['user_message'],
                'ai_message': result['ai_message']
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur send_message: {e}")
        return jsonify({'error': 'Erreur lors de l\'envoi du message'}), 500


@chat_bp.route('/courses/<int:course_id>/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history(course_id):
    """
    Récupérer l'historique du chat pour un cours
    
    Query params (optionnels):
    - limit: nombre de messages à récupérer (défaut: 50)
    - offset: pagination
    """
    try:
        user_id = get_jwt_identity()
        
        # Paramètres de pagination
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        if limit > 100:
            limit = 100
        
        messages = chat_service.get_chat_history(
            user_id=int(user_id),
            course_id=course_id,
            limit=limit,
            offset=offset
        )
        
        return jsonify({
            'success': True,
            'data': messages,
            'count': len(messages)
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur get_chat_history: {e}")
        return jsonify({'error': 'Erreur lors du chargement de l\'historique'}), 500


@chat_bp.route('/courses/<int:course_id>/chat/clear', methods=['DELETE'])
@jwt_required()
def clear_chat_history(course_id):
    """
    Effacer l'historique du chat pour un cours (pour l'utilisateur connecté)
    """
    try:
        user_id = get_jwt_identity()
        
        deleted_count = chat_service.clear_chat_history(
            user_id=int(user_id),
            course_id=course_id
        )
        
        return jsonify({
            'success': True,
            'message': f'{deleted_count} messages supprimés',
            'deleted_count': deleted_count
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur clear_chat_history: {e}")
        return jsonify({'error': 'Erreur lors de la suppression de l\'historique'}), 500


@chat_bp.route('/courses/<int:course_id>/chat/stats', methods=['GET'])
@jwt_required()
def get_chat_stats(course_id):
    """
    Obtenir des statistiques sur le chat (nombre de messages, dernière activité, etc.)
    """
    try:
        user_id = get_jwt_identity()
        
        stats = chat_service.get_chat_stats(
            user_id=int(user_id),
            course_id=course_id
        )
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur get_chat_stats: {e}")
        return jsonify({'error': 'Erreur lors du chargement des statistiques'}), 500


@chat_bp.route('/courses/<int:course_id>/chat/export', methods=['GET'])
@jwt_required()
def export_chat_history(course_id):
    """
    Exporter l'historique du chat en format JSON ou TXT
    
    Query params:
    - format: json ou txt (défaut: json)
    """
    try:
        user_id = get_jwt_identity()
        export_format = request.args.get('format', 'json').lower()
        
        if export_format not in ['json', 'txt']:
            return jsonify({'error': 'Format invalide (json ou txt)'}), 400
        
        export_data = chat_service.export_chat_history(
            user_id=int(user_id),
            course_id=course_id,
            format_type=export_format
        )
        
        if export_format == 'json':
            return jsonify({
                'success': True,
                'data': export_data
            }), 200
        else:  # txt
            return export_data, 200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': f'attachment; filename=chat_course_{course_id}.txt'
            }
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur export_chat_history: {e}")
        return jsonify({'error': 'Erreur lors de l\'export'}), 500