Requirement already satisfied: groq in /usr/local/lib/python3.12/dist-packages (0.32.0)
Requirement already satisfied: requests in /usr/local/lib/python3.12/dist-packages (2.32.4)
Requirement already satisfied: anyio<5,>=3.5.0 in /usr/local/lib/python3.12/dist-packages (from groq) (4.10.0)
Requirement already satisfied: distro<2,>=1.7.0 in /usr/local/lib/python3.12/dist-packages (from groq) (1.9.0)
Requirement already satisfied: httpx<1,>=0.23.0 in /usr/local/lib/python3.12/dist-packages (from groq) (0.28.1)
Requirement already satisfied: pydantic<3,>=1.9.0 in /usr/local/lib/python3.12/dist-packages (from groq) (2.11.9)
Requirement already satisfied: sniffio in /usr/local/lib/python3.12/dist-packages (from groq) (1.3.1)
Requirement already satisfied: typing-extensions<5,>=4.10 in /usr/local/lib/python3.12/dist-packages (from groq) (4.15.0)
Requirement already satisfied: charset_normalizer<4,>=2 in /usr/local/lib/python3.12/dist-packages (from requests) (3.4.3)
Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.12/dist-packages (from requests) (3.10)
Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.12/dist-packages (from requests) (2.5.0)
Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.12/dist-packages (from requests) (2025.8.3)
Requirement already satisfied: httpcore==1.* in /usr/local/lib/python3.12/dist-packages (from httpx<1,>=0.23.0->groq) (1.0.9)
Requirement already satisfied: h11>=0.16 in /usr/local/lib/python3.12/dist-packages (from httpcore==1.*->httpx<1,>=0.23.0->groq) (0.16.0)
Requirement already satisfied: annotated-types>=0.6.0 in /usr/local/lib/python3.12/dist-packages (from pydantic<3,>=1.9.0->groq) (0.7.0)
Requirement already satisfied: pydantic-core==2.33.2 in /usr/local/lib/python3.12/dist-packages (from pydantic<3,>=1.9.0->groq) (2.33.2)
Requirement already satisfied: typing-inspection>=0.4.0 in /usr/local/lib/python3.12/dist-packages (from pydantic<3,>=1.9.0->groq) (0.4.1)

    ╔═══════════════════════════════════════════════════════════════╗
    ║   Universal Script Tester - Test d'Intégration Groq AI       ║
    ║                                                               ║
    ║   Ce notebook démontre l'intégration d'une IA (Groq) avec    ║
    ║   l'API Universal Script Tester pour générer et exécuter     ║
    ║   du code automatiquement.                                    ║
    ╚═══════════════════════════════════════════════════════════════╝
    

Lancement des tests de démonstration...



======================================================================
TEST 1/4
======================================================================
======================================================================
TÂCHE: Calcule la factorielle de 10 et affiche le résultat
======================================================================

[1/3] Génération du code avec Groq AI...

✓ Code généré (171 caractères)

Code:
----------------------------------------------------------------------
def factorielle(n):
    if n == 0:
        return 1
    else:
        return n * factorielle(n-1)

resultat = factorielle(10)
print("La factorielle de 10 est :", resultat)
----------------------------------------------------------------------

[2/3] Exécution via Universal Script Tester API...

[3/3] Résultats de l'exécution:
----------------------------------------------------------------------
✓ EXÉCUTION RÉUSSIE
Temps d'exécution: 45ms

Sortie du programme:
  [log] La factorielle de 10 est : 3628800
======================================================================


======================================================================
TEST 2/4
======================================================================
======================================================================
TÂCHE: Crée une fonction qui génère les 15 premiers nombres de Fibonacci
======================================================================

[1/3] Génération du code avec Groq AI...

✓ Code généré (268 caractères)

Code:
----------------------------------------------------------------------
function generateFibonacci(n) {
    let fibSequence = [0, 1];
    while (fibSequence.length < n) {
        fibSequence.push(fibSequence[fibSequence.length - 1] + fibSequence[fibSequence.length - 2]);
    }
    return fibSequence;
}

console.log(generateFibonacci(15));
----------------------------------------------------------------------

[2/3] Exécution via Universal Script Tester API...

[3/3] Résultats de l'exécution:
----------------------------------------------------------------------
✓ EXÉCUTION RÉUSSIE
Temps d'exécution: 1ms

Sortie du programme:
  [log] [0,1,1,2,3,5,8,13,21,34,55,89,144,233,377]
======================================================================


======================================================================
TEST 3/4
======================================================================
======================================================================
TÂCHE: Écris un algorithme de tri à bulles pour trier [64, 34, 25, 12, 22, 11, 90]
======================================================================

[1/3] Génération du code avec Groq AI...

✓ Code généré (371 caractères)

Code:
----------------------------------------------------------------------
def tri_a_bulles(tableau):
    n = len(tableau)
    for i in range(n):
        for j in range(0, n - i - 1):
            if tableau[j] > tableau[j + 1]:
                tableau[j], tableau[j + 1] = tableau[j + 1], tableau[j]
    return tableau

tableau = [64, 34, 25, 12, 22, 11, 90]
print("Tableau avant tri:", tableau)
print("Tableau après tri:", tri_a_bulles(tableau))
----------------------------------------------------------------------

[2/3] Exécution via Universal Script Tester API...

[3/3] Résultats de l'exécution:
----------------------------------------------------------------------
✓ EXÉCUTION RÉUSSIE
Temps d'exécution: 21ms

Sortie du programme:
  [log] Tableau avant tri: [64, 34, 25, 12, 22, 11, 90]
Tableau après tri: [11, 12, 22, 25, 34, 64, 90]
======================================================================


======================================================================
TEST 4/4
======================================================================
======================================================================
TÂCHE: Calcule la somme des nombres pairs de 1 à 100
======================================================================

[1/3] Génération du code avec Groq AI...

✓ Code généré (110 caractères)

Code:
----------------------------------------------------------------------
let somme = 0;
for (let i = 1; i <= 100; i++) {
  if (i % 2 === 0) {
    somme += i;
  }
}
console.log(somme);
----------------------------------------------------------------------

[2/3] Exécution via Universal Script Tester API...

[3/3] Résultats de l'exécution:
----------------------------------------------------------------------
✓ EXÉCUTION RÉUSSIE
Temps d'exécution: 1ms

Sortie du programme:
  [log] 2550
======================================================================


======================================================================
RÉSUMÉ DES TESTS
======================================================================

Tests réussis: 4/4
✓ Test 1: Calcule la factorielle de 10 et affiche le résulta...
✓ Test 2: Crée une fonction qui génère les 15 premiers nombr...
✓ Test 3: Écris un algorithme de tri à bulles pour trier [64...
✓ Test 4: Calcule la somme des nombres pairs de 1 à 100...


✓ Tests terminés !

Vous pouvez maintenant tester avec vos propres tâches:
  custom_test('Votre tâche ici', 'python')
'\nEXEMPLES D\'UTILISATION:\n\n1. Test simple:\n   result = custom_test("Calcule le 20ème nombre premier", "python")\n\n2. Test JavaScript:\n   result = custom_test("Crée une fonction qui inverse une chaîne de caractères", "javascript")\n\n3. Test complexe:\n   result = custom_test(\n       "Implémente l\'algorithme de recherche binaire et teste-le sur [1,3,5,7,9,11,13,15]",\n       "python"\n   )\n\n4. Accès direct aux résultats:\n   result = custom_test("Calcule la somme de 1 à 1000", "python")\n   print(result["generated_code"])\n   print(result["execution_result"]["output"])\n'