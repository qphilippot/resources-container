# Principe
## Autoload
La possibilité d'autoload les classes et de les enregistrer automatiquement dans le conteneur n'est pas nécessairement une bonne idée. Dans un contexte browser, le module bundler packagera toutes les classes disponibles, même celles qui ne sont pas utilisée par la configuration de build courante (puisqu'on importe toutes les classes, le client les téléchargera toutes). Côté serveur cela est moins pénalisant.

**SAUF** si on autoload toutes les classes et qu'on supprimes les définitions qui ne sont pas utilisées, via une passe de compilation, comme fait Symfony.

## Workflow

Toutes les instances qui seront générées par le conteneur seront nommées des resources (qu'il s'agisse d'un service, un controller, un personnage dans un jeu-vidéo, peu importe).
La première étape sera de lire la configuration pour savoir quelles sont les ressources prises en charges par le conteneur. Il s'agit d'une première passe qui va lire nos fichiers de configurations, et selon ces règles, parcourir le filesystem afin de créer des définitions dans le conteneur.
Une fois cette passe terminée, on va compiler le conteneur, c'est à dire résoudre toutes les définitions, et remplacer celles-ci par de vrai instanciations de classes.
Lors de la compilation, il y aura des passes pour résoudre les références vers nos resources, les décorer, injecter les diverses dépendances au bon endroit, détecter les dépendances circulaires, et instancier les resources dans le bon ordre.

### 1. ContainerBuilder

Il permet de créer de compiler le conteneur, c'est à dire instancier les différentes resources à l'aides des définitions, des resources déjà disponibles, et des alias, en injectant les dépendences requises.

Le `ContainerBuilder` contient une instance de `ContainerInterface`, lequel centralise toutes les resources instanciées.

Afin de générer les resouces, le `ContainerBuilder` utilise un système de passes. Chaque passe à pour objectif de transformer une contrainte, spécificité ou fonctionnalité prévue par la configuration.

Le système de passe est géré par une instance de `PassesManager`. 

### PassesManager

On enregistre des passes dans le `PassesManager` en spécifiant le nom de l'étape de compilation à laquelle la passe sera associées, ainsi que le niveau de priorité associé à l'exécution de la tâche.

```typescript 
    addPass(
        pass: CompilerPassInterface, 
        step: string, 
        priority: number = 0
    )
```

### Exemple de passes
 
#### ResolveSyntheticPass

On peut vouloir utiliser une définition synthétique, pour bénéficier du système de configuration du `ContainerBuilder` sur une instance spécifique, au lieu d'une classe.

#### ResolveClassPass

Vérifie que chaque définition est bien reliée à une classe. Si une classe est nulle, on cherche à résoudre le nom de la classe à partir de l'id de la resource.

#### RegisterEnvVarProcessor

Permet de créer un service capable d'injecter d'appliquer un traitement sur les variables d'environnement avant de les injecter dans nos instances.
## Note 
- Resource != Definition
## Implémenter ##
- ResolveNamedArgumentsPassTest

# EnvVarProcessor
## ConstEnvVarProcessor

Actuellement il n'est pas possible d'implémenter nativement un processor qui récupère une constante de classe. La raison est que nous ne connaissons pas les classes qui ne sont pas importées. Il n'y a pas d'auto-wiring. Il faudrait donc un implémenter au préalable un système qui enregistre toutes les constantes disponibles dans le programme. 

#todo
- finir d'implémenter les env-processors
- finir le file.env-var-processor
- finir le require.env-var-processor
- possibilité de rajouter des règles custom dans l'auto-configure / auto-wiring
- implémenter les tag_iterator

# Choix techniques
## Pas de deprecated dans les alias
L'idée derrière les deprecated dans le container est de préparer les projets aux breaking-changes prévus dans les montées de versions majeures. Dans le cadre d'un container plus simple, censé être plus facilement customisable, la gestion des deprecation ne doit pas être une feature par défaut. L'idée n'est pas d'avoir un container builder identique dans 99% des projets (comme pour les projets symfony) mais adapaté à chaque app. Ainsi, uniformiser les deprecations n'est peut-être pas utile.

## Ne pas supporter l'ExpressionLanguage
Pour l'instant je n'en voit pas l'intérêt. Je préfère d'abord me concentrer sur le développement d'un conteneur plus simple, mais fonctionnel ET pratique.
https://symfony.com/doc/current/components/expression_language.html

## Ne pas implémenter de système d'extensions pour l'instant

