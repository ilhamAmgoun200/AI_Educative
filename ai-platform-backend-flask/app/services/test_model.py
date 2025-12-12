from recommandation_service import rec_service

data_test = {
    "user_id": 999, # Ignoré mais souvent présent dans le JSON
    "user_filliere": "Sciences SVT",
    "user_age": 17,
    "target_course_name": "Youth and Humour",
    "target_matiere": "Anglais",
    "user_history_names": ["Sustainable Development", "La Vérité"]
}

result, status = rec_service.predict(data_test)
print(f"Status: {status}")
print(result)