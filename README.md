## Workflow

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