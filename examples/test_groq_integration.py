"""
Universal Script Tester API - Test d'intégration Groq
Exemple d'utilisation pour démonstration
"""

import json
import requests
from groq import Groq

# Configuration
GROQ_API_KEY = "votre_clé_groq"
UST_API_KEY = "ust-api-key"
UST_API_URL = "https://ust-7isa.onrender.com/api/ai/execute"

groq_client = Groq(api_key=GROQ_API_KEY)

def ask_groq_to_write_code(task_description, language="python"):
    """Génère du code via Groq"""
    system_prompt = f"""Tu es un assistant de programmation expert. 
Génère du code {language} propre et fonctionnel pour la tâche demandée.
IMPORTANT: Réponds UNIQUEMENT avec le code, sans explications ni markdown."""

    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task_description}
        ],
        temperature=0.3,
        max_tokens=2000
    )
    
    code = completion.choices[0].message.content
    
    # Nettoyer le markdown si présent
    if "```" in code:
        code = code.split("```")[1]
        if code.startswith("python") or code.startswith("javascript"):
            code = "\n".join(code.split("\n")[1:])
    
    return code.strip()

def execute_code_ust(language, code, session_id="demo-session"):
    """Exécute du code via UST API"""
    payload = {
        "language": language,
        "code": code,
        "session_id": session_id,
        "api_key": UST_API_KEY
    }
    
    response = requests.post(
        UST_API_URL,
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=35
    )
    
    return response.json()

def run_demo():
    """Exécute une démonstration complète"""
    task = "Calcule la factorielle de 10 et affiche le résultat"
    
    print(f"Tâche: {task}\n")
    
    # Étape 1: Groq génère
    print("[1/2] Génération du code avec Groq...")
    code = ask_groq_to_write_code(task, "python")
    print(f"Code généré:\n{code}\n")
    
    # Étape 2: UST exécute
    print("[2/2] Exécution via UST API...")
    result = execute_code_ust("python", code)
    
    # Résultats
    print("\nRésultats:")
    print(f"Succès: {result['success']}")
    print(f"Temps: {result['execution_time']}ms")
    
    if result['success']:
        for output in result['output']:
            print(f"Output: {output['content']}")
    
    return {
        "task": task,
        "generated_code": code,
        "execution_result": result
    }

if __name__ == "__main__":
    demo_result = run_demo()
    
    # Sauvegarder les résultats
    with open('result.json', 'w') as f:
        json.dump(demo_result, f, indent=2)
    
    print("\n✓ Résultats sauvegardés dans result.json")