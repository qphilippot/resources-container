La génération des méta doit se gérer au niveau du conteneur, avant la compilation.

Par défaut, il va vouloir scanner tous le répertoire du projet. Il devra être possible de restreindre ce champ dans les fichiers de configs (type services.yaml) 

```yaml
configuration:
  analyse_class: true

autoload:
  App\:
    resource: '../src/*'
    exclude: '../src/{wepback-plugin, *.ts, *.js, *.yaml, utils, core, publisher-subscriber}'

# si le champ autoload n'est pas précisé
```

# TODO
* diviser le `setFactory` pour n'avoir qu'un seul type possible en entrée. Vérifier les cas d'usages et comment est-ce que l'on pourrait modifier la conceptiona actuelle pour couvrir le même périmetre fonctionnel tout en proposant des règles de typage plus strictes.
* créer un type d'enum pour les InvalidBehavior
* Créer un plugin qui ajoute le fonctionnement "setProperty" pour les définitions at l'auto-wiring
* Créer un définition service / manager => s'occupe de mettre à jour les changes
* Créer un MixedInterface helper
* Definition autoconfigured as feature
* Voir s'il est possible de sortir l'env processor et toute cette logique du container.model et container-builder
* Permettre au container d'utiliser des methodmap qui permettent d'invoquer une methode en fallback du get si aucun alias / service n'est trouvé. Ce fallback devrait retourner un service. ==> Ne pas supporter en V1 car pas de cas d'usage identifié.
* registerForAutoconfiguration
* Comprendre pourquoi le EnvParameterBag fait des choses étranges lors du get (un get ne devrait pas modifier le state d'une collection...)
* Comprendre ce que signifie la variable format dans le container builder resolveEnvPlaceholders
* Supporter les `ChildDefinition`
* Supporter les tags ainsi que les _instanceof (ajout de la passe `ResolveInstanceofConditionalsPass`)

# My Own Rules
## Container
* Le container stock des services et des alias, il peut résoudre des alias et propose des hooks pour la gestion d'erreur. La compilation ne sert qu'à figer le parameter-bag ?

## Container Builder 
* Propose le concept de definition, synthethic, etc.
* Lors de la compilation, il renvoi un container read-only classique ?
* Si une variable d'environnement existe dans un env-placeholder-parameter-bag en tant que paramètre sous la forme env(FOO) on préfére résoudre cette variable en tant que paramètre et ne pas prendre la variable d'env
## Env Placeholder Bag
* Les placeholders sont le nom des variables gérées par le bag ainsi que les différentes références qui lui sont faîtes (utile pour le merge de config ?) 

## Definition
* Le tracking des erreurs doit passer par un plugin / decorator / feature spécialisé et ne pas être directement dans le modèle

## Yaml parser
* utiliser un système de path générique compatible s3

### Workflow
* Récupérer le fichier
* Le parser
* Passe de validation / vérification validité syntaxe de configuration
* (système d'extension ?)
* déclare le fichier au builder comme une source valide
* parsing des imports
* ajout des paramètres
* ajout des extensions
* ajout des services
* Créer une classe spéciale pour le value resovler du yamlConfigLoader
* Documenter le ignore_errors et les valeurs possibles pour le chargement de resources
* support when@env config feature
* support configurator ?
* support expression
* support taggedValues
* create setterInjectionPayload in order to parse "calls" properly
* Rework synthetic spec in order to return share and return synthetic public before and after compilation
